import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

// support_tickets postdates the generated types — see the same note in
// lib/generation.ts.
const db = supabase as unknown as SupabaseClient;

export type TicketStatus = 'open' | 'answered' | 'resolved';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
}

/** The signed-in customer's own tickets — Settings shows their history under the "raise a query" form. */
export function useMyTickets() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['support-tickets', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db
        .from('support_tickets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });
}

export function useRaiseTicket() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await db.from('support_tickets').insert({ user_id: user.id, subject, message });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets', 'mine'] }),
  });
}

/** Admin inbox — every ticket, newest first. */
export function useAllTickets() {
  return useQuery({
    queryKey: ['support-tickets', 'all'],
    queryFn: async () => {
      const { data, error } = await db
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });
}

/** Live updates for the admin inbox — a new query lands without a manual refresh. */
export function useTicketsRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel('support-tickets-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reply, status }: { id: string; reply: string; status: TicketStatus }) => {
      const { error } = await db
        .from('support_tickets')
        .update({ admin_reply: reply, status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
  });
}

export function useSetTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const { error } = await db
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
  });
}
