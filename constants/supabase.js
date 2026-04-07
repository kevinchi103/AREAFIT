import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://loxbdknmblqndfdepcic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveGJka25tYmxxbmRmZGVwY2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTA1MzYsImV4cCI6MjA5MTAyNjUzNn0.1tSwA_Ja4YQQkwQ81nkxM2ndgezZGVliYkHyd8QE2YQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);