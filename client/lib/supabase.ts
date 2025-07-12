import { createClient } from "@supabase/supabase-js";

// Handle both Vite (import.meta.env) and Node.js (process.env) environments
const supabaseUrl =
  (typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL) ||
  "https://ptyqvatzakkilzbubzed.supabase.co";

const supabaseKey =
  (typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eXF2YXR6YWtraWx6YnViemVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzEzNDMsImV4cCI6MjA2NzkwNzM0M30.H_zVNnm94Pyr0z_mxAW8BrWll-gfwwuXsV9BOQTBGyo";

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
