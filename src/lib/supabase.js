import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Missing Supabase environment variables. Please restart your Vite server or check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
