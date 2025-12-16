import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// --- Configuration ---
// Use safe fallbacks to prevent immediate runtime crash if env vars are missing.
// This allows the UI to render and show helpful errors instead of a white screen.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "placeholder";

if (SUPABASE_URL === "https://placeholder.supabase.co") {
  console.warn("⚠️ Supabase Configuration Missing. Auth and Database features will not work.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types ---
// Mapping Supabase User to our App's User Interface
export interface User {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
}

// --- Auth Functions ---

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void
) => {
  // Check initial session safely
  supabase.auth.getSession().then(({ data }) => {
    callback(formatUser(data?.session?.user));
  }).catch(err => {
    console.warn("Auth session check failed (likely missing config):", err);
    callback(null);
  });

  // Listen for changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(formatUser(session?.user));
  });

  return () => subscription.unsubscribe();
};

const formatUser = (sbUser: SupabaseUser | undefined): User | null => {
  if (!sbUser) return null;
  return {
    uid: sbUser.id,
    email: sbUser.email || null,
    // Supabase stores provider metadata in user_metadata
    photoURL: sbUser.user_metadata?.avatar_url || null,
    displayName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || null,
  };
};

// --- Database Functions (Profiles Table) ---

export const getUserBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error) {
    // Silent fail for new users who might not have a profile row trigger yet
    // or if RLS is strict.
    return 0;
  }
  return data?.credits || 0;
};

export const addCredits = async (userId: string, amount: number) => {
  // 1. Get current
  const { data: current } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();
    
  const newBalance = (current?.credits || 0) + amount;

  // 2. Update
  const { error } = await supabase
    .from('profiles')
    .update({ credits: newBalance })
    .eq('id', userId);

  if (error) console.error("Error adding credits:", error);
};

export const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
  // We use a Postgres RPC (Remote Procedure Call) for atomic operations
  // ensuring two people can't spend the same credits at the same time.
  const { data, error } = await supabase
    .rpc('deduct_credits', { row_id: userId, amount: amount });

  if (error) {
    console.error("Transaction failed:", error);
    return false;
  }
  return data as boolean;
};

export const checkFreeTrialEligibility = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_trial_used')
    .eq('id', userId)
    .single();

  if (error) return false;
  return data?.is_trial_used === false; // Eligible if false
};

export const markFreeTrialUsed = async (userId: string) => {
  await supabase
    .from('profiles')
    .update({ is_trial_used: true })
    .eq('id', userId);
};

export const logUsage = async (userId: string, cost: number, details: any) => {
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      cost: cost,
      details: details
    });
    
  if (error) console.error("Logging failed:", error);
};