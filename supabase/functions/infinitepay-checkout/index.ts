import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const INFINITEPAY_CHECKOUT_URL = "https://api.checkout.infinitepay.io/links"
const INFINITEPAY_HANDLE = "zinp"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const APP_URL = Deno.env.get("APP_URL") || "https://validavolt.vercel.app"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface CheckoutRequest {
  planoId: string
  tipoPagamento: "pix" | "card"
  parcelas?: number
  customerData: {
    name: string
    email: string
    document: string
    phone: string
  }
}

async function createCheckoutLink(
  planName: string,
  amount: number,
  orderId: string,
  customerData: CheckoutRequest["customerData"]
): Promise<any> {
  const payload = {
    handle: INFINITEPAY_HANDLE,
    items: [
      {
        quantity: 1,
        price: Math.floor(amount),
        description: planName
      }
    ],
    order_nsu: orderId,
    redirect_url: `${APP_URL}/checkout-success?order_nsu=${orderId}`,
    webhook_url: `${SUPABASE_URL}/functions/v1/infinitepay-webhook`,
    customer: {
      name: customerData.name,
      email: customerData.email,
      phone_number: `+55${customerData.phone.replace(/\D/g, '')}`
    }
  }

  console.log("Creating checkout link with payload:", JSON.stringify(payload))

  const response = await fetch(INFINITEPAY_CHECKOUT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("InfinitePay error response:", error)
    throw new Error(`InfinitePay error: ${error}`)
  }

  return await response.json()
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    const payload: CheckoutRequest = await req.json()

    if (!payload.planoId || !payload.customerData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Buscar plano
    const { data: plano, error: planoError } = await supabase
      .from("planos")
      .select("*")
      .eq("id", payload.planoId)
      .single()

    if (planoError || !plano) {
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validar dados do cliente
    if (!payload.customerData.name || !payload.customerData.email || !payload.customerData.document) {
      return new Response(
        JSON.stringify({ error: "Invalid customer data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const orderId = crypto.randomUUID()

    // Criar link de checkout na InfinitePay
    const checkoutData = await createCheckoutLink(
      plano.name,
      plano.price_cents,
      orderId,
      payload.customerData
    )

    // Salvar transação no Supabase
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert([
        {
          infinitepay_id: checkoutData.slug,
          plan_id: payload.planoId,
          plan_name: plano.name,
          amount_cents: plano.price_cents,
          payment_method: payload.tipoPagamento || "pix",
          installments: payload.parcelas || 1,
          status: "PENDING",
          customer_name: payload.customerData.name,
          customer_email: payload.customerData.email,
          customer_document: payload.customerData.document,
          customer_phone: payload.customerData.phone,
          metadata: {
            order_nsu: orderId,
            checkout_url: checkoutData.url,
          },
        },
      ])
      .select()
      .single()

    if (txError) {
      console.error("Transaction save error:", txError)
      return new Response(
        JSON.stringify({ error: "Failed to save transaction" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        checkout_url: checkoutData.url,
        order_nsu: orderId,
        amount: plano.price_cents,
        plan: plano,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Checkout error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
