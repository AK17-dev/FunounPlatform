import { createClient } from "@supabase/supabase-js";

// Handle both Vite (import.meta.env) and Node.js (process.env) environments
const supabaseUrl =
  (typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL) ||
  "https://zgfckerfqqmgiohbiwsn.supabase.co";

const supabaseKey =
  (typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZmNrZXJmcXFtZ2lvaGJpd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTA2MjUsImV4cCI6MjA4ODkyNjYyNX0.D9ESNQC5y7HK9TuAS7cu0Bft_yNWXaxsMTLkL6mLmCU";

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
