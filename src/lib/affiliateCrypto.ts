import { supabase } from '@/integrations/supabase/client';

interface EncryptedPaymentInfo {
  encrypted_email: string | null;
  encrypted_pix: string | null;
  success: boolean;
}

interface DecryptedPaymentInfo {
  payment_email: string | null;
  pix_key: string | null;
  success: boolean;
}

interface MaskedPaymentInfo {
  masked_email: string;
  masked_pix: string;
  success: boolean;
}

/**
 * Encrypt payment info before storing
 */
export async function encryptPaymentInfo(
  paymentEmail: string | null,
  pixKey: string | null
): Promise<EncryptedPaymentInfo | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      console.error('No active session');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('affiliate-crypto', {
      body: {
        action: 'encrypt-payment-info',
        data: {
          payment_email: paymentEmail,
          pix_key: pixKey,
        },
      },
    });

    if (error) {
      console.error('Encryption error:', error);
      return null;
    }

    return data as EncryptedPaymentInfo;
  } catch (error) {
    console.error('Failed to encrypt payment info:', error);
    return null;
  }
}

/**
 * Decrypt payment info for the owner
 */
export async function decryptPaymentInfo(): Promise<DecryptedPaymentInfo | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      console.error('No active session');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('affiliate-crypto', {
      body: {
        action: 'decrypt-payment-info',
        data: {},
      },
    });

    if (error) {
      console.error('Decryption error:', error);
      return null;
    }

    return data as DecryptedPaymentInfo;
  } catch (error) {
    console.error('Failed to decrypt payment info:', error);
    return null;
  }
}

/**
 * Get masked payment info for display
 */
export async function getMaskedPaymentInfo(
  affiliateId: string
): Promise<MaskedPaymentInfo | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      console.error('No active session');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('affiliate-crypto', {
      body: {
        action: 'get-masked-info',
        data: { affiliate_id: affiliateId },
      },
    });

    if (error) {
      console.error('Get masked info error:', error);
      return null;
    }

    return data as MaskedPaymentInfo;
  } catch (error) {
    console.error('Failed to get masked payment info:', error);
    return null;
  }
}

/**
 * Update payment info with encryption via edge function
 */
export async function updatePaymentInfoSecure(
  paymentEmail: string | null,
  pixKey: string | null,
  paymentMethod: string
): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      console.error('No active session');
      return false;
    }

    const { data, error } = await supabase.functions.invoke('affiliate-crypto', {
      body: {
        action: 'update-payment-info',
        data: {
          payment_email: paymentEmail,
          pix_key: pixKey,
          payment_method: paymentMethod,
        },
      },
    });

    if (error) {
      console.error('Update payment info error:', error);
      return false;
    }

    return data?.success || false;
  } catch (error) {
    console.error('Failed to update payment info:', error);
    return false;
  }
}
