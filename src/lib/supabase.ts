import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rqremmfisvggplqxxist.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcmVtbWZpc3ZnZ3BscXh4aXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDE2NjIsImV4cCI6MjEwNDc3NzY2Mn0.pbhSKOZbbRlqXXco1eaCczXLT9X1Q_Dd5xkNp7tpAkg";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project-id")
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const DEMO_USER = {
  id: "demo-user-123",
  email: "creator@camverse.app",
  user_metadata: {
    full_name: "CamVerse Creator",
  },
};
