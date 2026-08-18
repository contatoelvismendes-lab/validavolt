import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface CreateAdminRequest {
  email: string
  password: string
  name: string
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
    const payload: CreateAdminRequest = await req.json()

    // Validar campos obrigatórios
    if (!payload.email || !payload.password || !payload.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, password, name" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validar senha (mínimo 6 caracteres)
    if (payload.password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    console.log(`[CreateAdmin] Creating admin user: ${payload.email}`)

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error("Auth error:", authError)
      return new Response(
        JSON.stringify({
          error: authError?.message || "Failed to create user",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const userId = authData.user.id

    // Criar profile com role='admin'
    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        id: userId,
        email: payload.email,
        full_name: payload.name,
        role: "admin",
        status: "active",
      },
    ])

    if (profileError) {
      console.error("Profile error:", profileError)
      // Se falhar ao criar profile, deletar o usuário auth
      await supabase.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({
          error: "Failed to create admin profile",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Criar user_credits
    const { error: creditsError } = await supabase.from("user_credits").insert([
      {
        user_id: userId,
        balance: 0,
      },
    ])

    if (creditsError) {
      console.error("Credits error:", creditsError)
    }

    console.log(`[CreateAdmin] Admin created successfully: ${payload.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        user: {
          id: userId,
          email: payload.email,
          name: payload.name,
          role: "admin",
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[CreateAdmin Error]:", error)
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
