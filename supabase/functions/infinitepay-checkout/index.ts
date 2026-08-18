import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const INFINITEPAY_BASE_URL = "https://api.infinitepay.io/v1"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function getInfinitePayKey() {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "INFINITEPAY_API_KEY")
      .single()

    if (error || !data?.value) {
      throw new Error("INFINITEPAY_API_KEY not configured in system settings")
    }

    return data.value
  } catch (err) {
    console.error("Failed to fetch API key from settings:", err)
    throw err
  }
}

interface CheckoutRequest {
  planoId: string
  tipoPagamento: "pix" | "card"
  parcelas?: number
  customerData: {
    name: string
    email: string
    document: string // CPF/CNPJ
    phone: string
  }
}

interface PixResponse {
  id: string
  qr_code: string
  qr_code_url: string
  copy_paste: string
  expires_at: string
}

interface CardResponse {
  id: string
  authorization_url?: string
  status: string
}

async function createPixCharge(
  amount: number,
  orderId: string,
  customerData: CheckoutRequest["customerData"],
  apiKey: string
): Promise<PixResponse> {
  const response = await fetch(`${INFINITEPAY_BASE_URL}/charges`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.floor(amount),
      payment_method: "pix",
      customer: {
        name: customerData.name,
        email: customerData.email,
        document: customerData.document,
        phone: customerData.phone,
      },
      metadata: {
        order_id: orderId,
      },
      expires_in: 900, // 15 minutos
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`InfinitePay PIX error: ${error}`)
  }

  return await response.json()
}

async function createCardCharge(
  amount: number,
  orderId: string,
  installments: number,
  customerData: CheckoutRequest["customerData"],
  apiKey: string
): Promise<CardResponse> {
  const response = await fetch(`${INFINITEPAY_BASE_URL}/charges`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.floor(amount),
      payment_method: "card",
      installments: Math.min(installments || 1, 12),
      customer: {
        name: customerData.name,
        email: customerData.email,
        document: customerData.document,
        phone: customerData.phone,
      },
      metadata: {
        order_id: orderId,
      },
      redirect_url: `${Deno.env.get("APP_URL")}/checkout-success`,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`InfinitePay Card error: ${error}`)
  }

  return await response.json()
}

serve(async (req) => {
  // CORS
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

    // Validar request
    if (!payload.planoId || !payload.tipoPagamento || !payload.customerData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Buscar chave da API
    const apiKey = await getInfinitePayKey()

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
    const installments = payload.tipoPagamento === "card" ? (payload.parcelas || 1) : 1

    // Criar cobrança na InfinitePay
    let chargeResponse: PixResponse | CardResponse

    if (payload.tipoPagamento === "pix") {
      chargeResponse = await createPixCharge(
        plano.price_cents,
        orderId,
        payload.customerData,
        apiKey
      )
    } else {
      chargeResponse = await createCardCharge(
        plano.price_cents,
        orderId,
        installments,
        payload.customerData,
        apiKey
      )
    }

    // Salvar transação no Supabase
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert([
        {
          infinitepay_id: chargeResponse.id,
          plan_id: payload.planoId,
          plan_name: plano.name,
          amount_cents: plano.price_cents,
          payment_method: payload.tipoPagamento,
          installments: installments,
          status: "PENDING",
          pix_qr_code: payload.tipoPagamento === "pix" ? (chargeResponse as PixResponse).qr_code : null,
          pix_copy_paste: payload.tipoPagamento === "pix" ? (chargeResponse as PixResponse).copy_paste : null,
          pix_expires_at: payload.tipoPagamento === "pix" ? (chargeResponse as PixResponse).expires_at : null,
          customer_name: payload.customerData.name,
          customer_email: payload.customerData.email,
          customer_document: payload.customerData.document,
          customer_phone: payload.customerData.phone,
          metadata: {
            user_agent: req.headers.get("user-agent"),
            ip_address: req.headers.get("x-forwarded-for"),
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

    // Retornar resposta formatada
    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        infinitepay_id: chargeResponse.id,
        payment_method: payload.tipoPagamento,
        ...(payload.tipoPagamento === "pix" && {
          pix: {
            qr_code: (chargeResponse as PixResponse).qr_code,
            qr_code_url: (chargeResponse as PixResponse).qr_code_url,
            copy_paste: (chargeResponse as PixResponse).copy_paste,
            expires_at: (chargeResponse as PixResponse).expires_at,
          },
        }),
        ...(payload.tipoPagamento === "card" && {
          card: {
            authorization_url: (chargeResponse as CardResponse).authorization_url,
            status: (chargeResponse as CardResponse).status,
          },
        }),
        amount: plano.price_cents,
        plan: plano,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Checkout error:", error)
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
