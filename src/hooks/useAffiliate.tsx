import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  payment_email: string | null;
  payment_method: string;
  pix_key: string | null;
  total_earnings: number;
  available_balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  referred_at: string;
  status: string;
  converted_at: string | null;
  profile?: {
    display_name: string | null;
    created_at: string;
  };
}

export interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  amount: number;
  tier: string;
  status: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  affiliate_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: Record<string, unknown> | null;
  processed_at: string | null;
  created_at: string;
}

interface UseAffiliateReturn {
  affiliate: Affiliate | null;
  referrals: Referral[];
  commissions: Commission[];
  payouts: PayoutRequest[];
  loading: boolean;
  createAffiliate: () => Promise<void>;
  requestPayout: (amount: number, method: string, details: Record<string, unknown>) => Promise<boolean>;
  updatePaymentInfo: (email: string, method: string, pixKey?: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useAffiliate(): UseAffiliateReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAffiliateData = async () => {
    if (!user) {
      setAffiliate(null);
      setReferrals([]);
      setCommissions([]);
      setPayouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch affiliate data
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (affiliateError) throw affiliateError;

      if (affiliateData) {
        setAffiliate(affiliateData as Affiliate);

        // Fetch referrals with profile info
        const { data: referralsData } = await supabase
          .from('referrals')
          .select(`
            *,
            profile:profiles!referrals_referred_user_id_fkey(display_name, created_at)
          `)
          .eq('affiliate_id', affiliateData.id)
          .order('referred_at', { ascending: false });

        setReferrals((referralsData as unknown as Referral[]) || []);

        // Fetch commissions
        const { data: commissionsData } = await supabase
          .from('commissions')
          .select('*')
          .eq('affiliate_id', affiliateData.id)
          .order('created_at', { ascending: false });

        setCommissions((commissionsData as Commission[]) || []);

        // Fetch payout requests
        const { data: payoutsData } = await supabase
          .from('payout_requests')
          .select('*')
          .eq('affiliate_id', affiliateData.id)
          .order('created_at', { ascending: false });

        setPayouts((payoutsData as PayoutRequest[]) || []);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [user]);

  const createAffiliate = async () => {
    if (!user) return;

    try {
      // Generate unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_affiliate_code');

      if (codeError) throw codeError;

      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          affiliate_code: codeData as string,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Sua conta de afiliado foi criada.',
      });

      await fetchAffiliateData();
    } catch (error) {
      console.error('Error creating affiliate:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar sua conta de afiliado.',
        variant: 'destructive',
      });
    }
  };

  const requestPayout = async (
    amount: number,
    method: string,
    details: Record<string, unknown>
  ): Promise<boolean> => {
    if (!affiliate) return false;

    if (amount > affiliate.available_balance) {
      toast({
        title: 'Saldo insuficiente',
        description: 'O valor solicitado é maior que o saldo disponível.',
        variant: 'destructive',
      });
      return false;
    }

    if (amount < 50) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo para saque é R$ 50,00.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.from('payout_requests').insert([{
        affiliate_id: affiliate.id,
        amount,
        payment_method: method,
        payment_details: details as unknown as Record<string, never>,
      }]);

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: 'Seu pedido de saque foi enviado para análise.',
      });

      await fetchAffiliateData();
      return true;
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar o saque.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updatePaymentInfo = async (
    email: string,
    method: string,
    pixKey?: string
  ): Promise<boolean> => {
    if (!affiliate) return false;

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({
          payment_email: email,
          payment_method: method,
          pix_key: pixKey || null,
        })
        .eq('id', affiliate.id);

      if (error) throw error;

      toast({
        title: 'Informações atualizadas!',
        description: 'Seus dados de pagamento foram salvos.',
      });

      await fetchAffiliateData();
      return true;
    } catch (error) {
      console.error('Error updating payment info:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as informações.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    affiliate,
    referrals,
    commissions,
    payouts,
    loading,
    createAffiliate,
    requestPayout,
    updatePaymentInfo,
    refetch: fetchAffiliateData,
  };
}
