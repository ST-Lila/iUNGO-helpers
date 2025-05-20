import { createClient } from "@supabase/supabase-js";
import { DB_CONFIG } from "./config.js";

// Initialize Supabase client
export const supabase = createClient(
  DB_CONFIG.supabaseUrl,
  DB_CONFIG.supabaseKey
);
