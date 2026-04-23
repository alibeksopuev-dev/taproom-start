import { create } from 'zustand';
import { supabase } from '#/lib/supabase';
import { ORGANIZATION_ID } from '#/lib/constants';
import type { User, Session } from '@supabase/supabase-js';

interface UserDiscount {
  discount_percent: number;
  label: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  discount: UserDiscount | null;
  initialize: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchDiscount: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  discount: null,

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false });
      if (session?.user) {
        get().fetchDiscount(session.user.id);
        ensureProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isLoading: false });
      if (session?.user) {
        get().fetchDiscount(session.user.id);
        ensureProfile(session.user);
      } else {
        set({ discount: null });
      }
    });

    return () => subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null, discount: null });
  },

  fetchDiscount: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_discounts')
        .select('discount_percent, label')
        .eq('user_id', userId)
        .eq('organization_id', ORGANIZATION_ID)
        .eq('is_active', true)
        .single();

      if (error) {
        set({ discount: error.code === 'PGRST116' ? null : null });
        return;
      }
      set({ discount: data });
    } catch {
      set({ discount: null });
    }
  },
}));

async function ensureProfile(user: User) {
  try {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        language: 'en',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('Error ensuring profile:', err);
  }
}
