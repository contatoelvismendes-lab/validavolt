import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const INFINITEPAY_WEBHOOK_SECRET = Deno.env.get("INFINITEPAY_WEBHOOK_SECRET")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface WebhookPayload {
  id: string
  event_type: string
  charge_id: string
  status: string
  amount: number
  paid_at?: string
  customer?: {
    name: string
    email: string
    document: string
  }
  metadata?: {
    order_id: string
  }
  timestamp: string
  signature?: string
}

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  if (!INFINITEPAY_WEBHOOK_SECRET) {
    console.warn("INFINITEPAY_WEBHOOK_SECRET not configured - skipping verification")
    return true
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(INFINITEPAY_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  )

  const calculatedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")

  return calculatedSignature === signature
}

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Signature",
      },
    })
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const payload = await req.text()
    const signature = req.headers.get("x-signature") || req.headers.get("X-Signature")
    const webhookData: WebhookPayload = JSON.parse(payload)

    // Verificar assinatura
    if (signature && !(await verifySignature(payload, signature))) {
      console.warn("Invalid webhook signature")
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    console.log(`[Webhook] Event: ${webhookData.event_type}, Charge ID: ${webhookData.charge_id}`)

    // Registrar webhook em auditoria
    const { error: logError } = await supabase
      .from("webhook_logs")
      .insert([
        {
          event_type: webhookData.event_type,
          infinitepay_event_id: webhookData.id,
          payload: webhookData,
          signature_valid: signature ? true : null,
        },
      ])

    if (logError) {
      console.error("Webhook log error:", logError)
    }

    // Processar eventos de pagamento
    const isPaid =
      webhookData.status === "paid" ||
      webhookData.status === "approved" ||
      webhookData.status === "completed"

    const isFailed =
      webhookData.status === "failed" ||
      webhookData.status === "rejected" ||
      webhookData.status === "cancelled"

    if (isPaid) {
      // Buscar transação
      const { data: transaction, error: txFetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("infinitepay_id", webhookData.charge_id)
        .single()

      if (txFetchError || !transaction) {
        console.error("Transaction not found for charge:", webhookData.charge_id)
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      }

      // Atualizar status da transação
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: "PAID",
          paid_at: new Date().toISOString(),
          webhook_data: webhookData,
        })
        .eq("id", transaction.id)

      if (updateError) {
        console.error("Transaction update error:", updateError)
        return new Response(
          JSON.stringify({ error: "Failed to update transaction" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }

      // Buscar usuário e injetar créditos
      if (transaction.user_id) {
        // Obter créditos do plano
        const { data: plan } = await supabase
          .from("planos")
          .select("credits")
          .eq("id", transaction.plan_id)
          .single()

        if (plan) {
          // Adicionar créditos
          const { data: userCredits } = await supabase
            .from("user_credits")
            .select("balance")
            .eq("user_id", transaction.user_id)
            .single()

          const currentBalance = userCredits?.balance || 0
          const newBalance = currentBalance + plan.credits

          const { error: creditError } = await supabase
            .from("user_credits")
            .update({ balance: newBalance })
            .eq("user_id", transaction.user_id)

          if (!creditError) {
            // Log de transação de crédito
            await supabase.from("credit_transactions").insert([
              {
                user_id: transaction.user_id,
                type: "add",
                amount: plan.credits,
                balance_after: newBalance,
                transaction_id: transaction.id,
                reason: `Plano ${transaction.plan_name} - Pagamento confirmado`,
                created_at: new Date().toISOString(),
              },
            ])

            console.log(
              `[Success] Added ${plan.credits} credits to user ${transaction.user_id}`
            )
          } else {
            console.error("Credit update error:", creditError)
          }
        }
      }

      console.log(`[Success] Transaction ${transaction.id} marked as PAID`)
    } else if (isFailed) {
      // Atualizar status para FAILED
      const { data: transaction } = await supabase
        .from("transactions")
        .select("id")
        .eq("infinitepay_id", webhookData.charge_id)
        .single()

      if (transaction) {
        await supabase
          .from("transactions")
          .update({
            status: "FAILED",
            webhook_data: webhookData,
          })
          .eq("id", transaction.id)

        console.log(`[Failed] Transaction ${transaction.id} marked as FAILED`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: webhookData.id,
        message: "Webhook processed",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[Webhook Error]:", error)
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
