import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthResult {
  error: Error | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string,
  ) => Promise<AuthResult & { needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    try {
      // Set up auth state listener FIRST
      supabase.auth.onAuthStateChange((event, session) => {
        set({
          session,
          user: session?.user ?? null,
          loading: false,
        });
      });

      // Then get the current session
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false, initialized: true });
    }
  },

  signUp: async (email: string, password: string, name: string, phone?: string) => {
    set({ loading: true });
    // name/phone ride along as user metadata — the handle_new_user() trigger
    // reads them straight into the profiles row on insert.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { name, phone: phone?.trim() || null },
      },
    });
    set({ loading: false });
    // With "Confirm email" switched on in Supabase, the account is created but
    // no session comes back until they click the link in their inbox.
    return { error, needsConfirmation: !error && !data.session };
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ loading: false });
    return { error };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },

  // The three below deliberately leave `loading` alone: ProtectedRoute swaps
  // the whole page for a spinner while it's true, which would wipe the form
  // someone is in the middle of submitting.
  resendConfirmation: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    return { error };
  },

  requestPasswordReset: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },
}));
