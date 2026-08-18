import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface WebhookPayload {
  invoice_slug: string
  amount: number
  paid_amount: number
  installments: number
  capture_method: "credit_card" | "pix"
  transaction_nsu: string
  order_nsu: string
  receipt_url: string
  items: Array<{
    quantity: number
    price: number
    description: string
  }>
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
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
    const webhookData: WebhookPayload = await req.json()

    console.log("[Webhook] Recebido pagamento:", webhookData.order_nsu)

    // Registrar webhook em auditoria
    const { error: logError } = await supabase
      .from("webhook_logs")
      .insert([
        {
          event_type: "payment_completed",
          infinitepay_event_id: webhookData.transaction_nsu,
          payload: webhookData,
          signature_valid: true,
        },
      ])

    if (logError) {
      console.error("Webhook log error:", logError)
    }

    // Buscar transação pelo order_nsu
    const { data: transaction, error: txFetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("metadata->>order_nsu", webhookData.order_nsu)
      .single()

    if (txFetchError || !transaction) {
      console.error("Transaction not found for order:", webhookData.order_nsu)
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
        infinitepay_id: webhookData.invoice_slug,
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
              reason: `Plano ${transaction.plan_name} - Pagamento confirmado via InfinitePay`,
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

    // Responder com 200 OK (conforme documentação da InfinitePay)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[Webhook Error]:", error)
    // Responder com 400 para a InfinitePay tentar novamente
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
