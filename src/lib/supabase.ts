import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaqzyfiiapihjiexplqs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcXp5ZmlpYXBpaGppZXhwbHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTYyMTMsImV4cCI6MjA3NzM5MjIxM30.E_aIvn-HEQE2b9d3cNPSs4EeKT0_orDx2wIZqVf655w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

