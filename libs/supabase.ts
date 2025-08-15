import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(process.env.SUPABASE_URL);
const supabaseKey = String(process.env.SUPABASE_ANON_KEY);
export const sb = createClient(supabaseUrl, supabaseKey)