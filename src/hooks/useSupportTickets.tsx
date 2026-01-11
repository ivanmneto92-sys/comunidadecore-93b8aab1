import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  last_message?: string;
  unread_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_admin_reply: boolean;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useSupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setTickets(data as SupportTicket[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (subject: string, description: string, priority: string = 'normal') => {
    if (!user) return null;

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({ user_id: user.id, subject, priority })
      .select()
      .single();

    if (ticketError || !ticket) return null;

    // Create initial message with description
    await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        content: description,
        is_admin_reply: false
      });

    await fetchTickets();
    return ticket;
  };

  return { tickets, loading, fetchTickets, createTicket };
}

export function useSupportMessages(ticketId: string | null) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!ticketId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      // Fetch profiles separately
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', senderIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const messagesWithProfiles = data.map(m => ({
        ...m,
        profiles: profilesMap.get(m.sender_id) || null
      }));
      setMessages(messagesWithProfiles as SupportMessage[]);
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content: string, senderId: string, isAdminReply: boolean = false) => {
    if (!ticketId) return null;

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        content,
        is_admin_reply: isAdminReply
      })
      .select()
      .single();

    if (!error && data) {
      await fetchMessages();
      
      // Update ticket updated_at and status
      const newStatus = isAdminReply ? 'in_progress' : 'open';
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString(), status: newStatus })
        .eq('id', ticketId);
    }

    return data;
  };

  return { messages, loading, fetchMessages, sendMessage };
}

export function useAdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles separately
      const userIds = [...new Set(data.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const ticketsWithProfiles = data.map(t => ({
        ...t,
        profiles: profilesMap.get(t.user_id) || null
      }));
      
      setTickets(ticketsWithProfiles as SupportTicket[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'resolved') {
      updates.closed_at = new Date().toISOString();
    }
    
    await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId);
    
    await fetchTickets();
  };

  return { tickets, loading, fetchTickets, updateTicketStatus };
}
