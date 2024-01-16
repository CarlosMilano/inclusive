import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = "https://bujzktwqxzulcqaqugro.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1anprdHdxeHp1bGNxYXF1Z3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzNjkzOTksImV4cCI6MjAyMDk0NTM5OX0.F-s-3kTg2FYBJfLAEyqqMul4QMa5IebsgOJaQWSSAy0";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or key is missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
