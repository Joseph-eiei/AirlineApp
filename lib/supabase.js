import { createClient } from "@supabase/supabase-js";

// 👇 ใส่ค่าของคุณเองจาก https://app.supabase.com > Project > Settings > API
const SUPABASE_URL = "https://tczryircwlslnoafxpxe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjenJ5aXJjd2xzbG5vYWZ4cHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjg2OTAsImV4cCI6MjA3Njk0NDY5MH0.3pDMUoQvU3ra6wQ04UzTSBUdX58D_8lFFyHXMilxijg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);