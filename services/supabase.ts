import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbzhamrplgerrqhmyntp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiemhhbXJwbGdlcnJxaG15bnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTQ4MDAsImV4cCI6MjA3ODY5MDgwMH0.jLT6cH01iP0ENgYPzGGObDyQakPc0Fj9PP8e44cZTm4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
