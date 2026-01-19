import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCodeRequest {
  email: string;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendCodeRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user exists in auth.users
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error checking user:", userError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar usuário" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userExists = users.users.some(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      // Return success even if user doesn't exist (security - don't reveal if email exists)
      return new Response(
        JSON.stringify({ success: true, message: "Se o email existir, um código será enviado" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OTP code
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any previous codes for this email
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .is("used_at", null);

    // Store the new code
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        email: email.toLowerCase(),
        token: otpCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing token:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar código" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with OTP code
    const emailResponse = await resend.emails.send({
      from: "CORE <noreply@meoocore.com.br>",
      to: [email],
      subject: "Código de Recuperação de Senha - CORE",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; margin: 0; }
            .container { max-width: 500px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #22c55e; margin: 0; font-size: 32px; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; 
                    background: #262626; padding: 20px; border-radius: 8px; margin: 30px 0; color: #22c55e; }
            .message { text-align: center; color: #a3a3a3; line-height: 1.6; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #525252; }
            .warning { font-size: 12px; color: #f59e0b; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>CORE</h1>
            </div>
            
            <p class="message">Você solicitou a recuperação de senha da sua conta.</p>
            <p class="message">Use o código abaixo para redefinir sua senha:</p>
            
            <div class="code">${otpCode}</div>
            
            <p class="message">Este código expira em <strong>15 minutos</strong>.</p>
            
            <p class="warning">Se você não solicitou esta recuperação, ignore este email.</p>
            
            <div class="footer">
              <p>CORE Community Hub</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Código enviado com sucesso" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-reset-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
