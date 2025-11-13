import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = <SUPABASE URL>;
const SUPABASE_ANON_KEY = <SUPABASE KEY>;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);