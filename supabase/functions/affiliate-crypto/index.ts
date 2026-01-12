import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ENCRYPTION_KEY = Deno.env.get('AFFILIATE_ENCRYPTION_KEY') || '';

// Convert Uint8Array to base64
function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

// Convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive a crypto key from the encryption key string
async function deriveKey(keyString: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString.slice(0, 32).padEnd(32, '0'));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    keyData.buffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return keyMaterial;
}

// Encrypt data
async function encrypt(plainText: string): Promise<string> {
  if (!plainText) return '';
  
  const encoder = new TextEncoder();
  const key = await deriveKey(ENCRYPTION_KEY);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = encoder.encode(plainText);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData.buffer
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return bytesToBase64(combined);
}

// Decrypt data
async function decrypt(encryptedBase64: string): Promise<string> {
  if (!encryptedBase64) return '';
  
  try {
    const key = await deriveKey(ENCRYPTION_KEY);
    const combined = base64ToBytes(encryptedBase64);
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted.buffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(decrypted));
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedBase64; // Return original if decryption fails (might be unencrypted)
  }
}

// Mask sensitive data for display
function maskData(data: string, type: 'email' | 'pix'): string {
  if (!data) return '';
  
  if (type === 'email') {
    const [local, domain] = data.split('@');
    if (!domain) return data;
    const maskedLocal = local.slice(0, 2) + '***' + (local.length > 2 ? local.slice(-1) : '');
    return `${maskedLocal}@${domain}`;
  }
  
  if (type === 'pix') {
    if (data.length <= 6) return '***';
    return data.slice(0, 3) + '***' + data.slice(-3);
  }
  
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'encrypt-payment-info': {
        // Encrypt payment email and PIX key
        const { payment_email, pix_key } = data;
        
        const encrypted_email = payment_email ? await encrypt(payment_email) : null;
        const encrypted_pix = pix_key ? await encrypt(pix_key) : null;
        
        return new Response(
          JSON.stringify({ 
            encrypted_email, 
            encrypted_pix,
            success: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'decrypt-payment-info': {
        // Get affiliate data and decrypt for the owner
        const { data: affiliate, error: affError } = await supabase
          .from('affiliates')
          .select('payment_email, pix_key, user_id')
          .eq('user_id', user.id)
          .single();

        if (affError || !affiliate) {
          return new Response(
            JSON.stringify({ error: 'Affiliate not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Only owner can decrypt their own data
        if (affiliate.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const decrypted_email = affiliate.payment_email ? await decrypt(affiliate.payment_email) : null;
        const decrypted_pix = affiliate.pix_key ? await decrypt(affiliate.pix_key) : null;

        return new Response(
          JSON.stringify({ 
            payment_email: decrypted_email,
            pix_key: decrypted_pix,
            success: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-masked-info': {
        // Get masked payment info for display
        const { affiliate_id } = data;
        
        const { data: affiliate, error: affError } = await supabase
          .from('affiliates')
          .select('payment_email, pix_key')
          .eq('id', affiliate_id)
          .single();

        if (affError || !affiliate) {
          return new Response(
            JSON.stringify({ error: 'Affiliate not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const decrypted_email = affiliate.payment_email ? await decrypt(affiliate.payment_email) : '';
        const decrypted_pix = affiliate.pix_key ? await decrypt(affiliate.pix_key) : '';

        return new Response(
          JSON.stringify({ 
            masked_email: maskData(decrypted_email, 'email'),
            masked_pix: maskData(decrypted_pix, 'pix'),
            success: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update-payment-info': {
        // Update affiliate payment info with encryption
        const { payment_email, pix_key, payment_method } = data;
        
        // Get user's affiliate
        const { data: affiliate, error: affError } = await supabase
          .from('affiliates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (affError || !affiliate) {
          return new Response(
            JSON.stringify({ error: 'Affiliate not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const encrypted_email = payment_email ? await encrypt(payment_email) : null;
        const encrypted_pix = pix_key ? await encrypt(pix_key) : null;

        const { error: updateError } = await supabase
          .from('affiliates')
          .update({
            payment_email: encrypted_email,
            pix_key: encrypted_pix,
            payment_method: payment_method,
            updated_at: new Date().toISOString()
          })
          .eq('id', affiliate.id);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update payment info' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
