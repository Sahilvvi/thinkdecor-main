import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  company_size: string | null;
  industry: string | null;
  region: string | null;
  reason: string | null;
  message: string;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

const TABLE = 'contact_submissions' as never;

export const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'closed', label: 'Closed' },
];

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at' as never, { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Lead[]).map((l) => ({ ...l, status: l.status ?? 'new' }));
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  const { error } = await supabase
    .from(TABLE)
    .update({ status } as never)
    .eq('id' as never, id as never);
  if (error) throw error;
}

export async function setLeadNotes(id: string, notes: string) {
  const { error } = await supabase
    .from(TABLE)
    .update({ notes } as never)
    .eq('id' as never, id as never);
  if (error) throw error;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq('id' as never, id as never);
  if (error) throw error;
}

/* ---------------- CSV export ---------------- */

const COLUMNS: { key: keyof Lead; header: string }[] = [
  { key: 'created_at', header: 'Received' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'company', header: 'Company' },
  { key: 'company_size', header: 'Team size' },
  { key: 'industry', header: 'Industry' },
  { key: 'region', header: 'Region' },
  { key: 'reason', header: 'Reason' },
  { key: 'status', header: 'Status' },
  { key: 'message', header: 'Message' },
  { key: 'notes', header: 'Notes' },
];

function cell(v: unknown) {
  const s = v == null ? '' : String(v);
  // Guard against spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function leadsToCsv(rows: Lead[]) {
  const head = COLUMNS.map((c) => cell(c.header)).join(',');
  const body = rows.map((r) => COLUMNS.map((c) => cell(r[c.key])).join(','));
  return [head, ...body].join('\r\n');
}

export function downloadCsv(rows: Lead[], filename = 'thinkdecor-leads.csv') {
  const blob = new Blob(['﻿' + leadsToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Sidebar nav badge (total + unread) — cached under the same query key the Leads page could reuse. */
export function useLeadsSummary() {
  return useQuery({
    queryKey: ['admin-leads-summary'],
    queryFn: async () => {
      const rows = await listLeads();
      return { total: rows.length, unread: rows.filter((l) => l.status === 'new').length };
    },
    staleTime: 30_000,
  });
}
