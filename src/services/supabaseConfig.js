import { createClient } from '@supabase/supabase-js';

// ⚠️ REPLACE WITH YOUR KEYS FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://ptycpfbevlsjgjghrpyj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eWNwZmJldmxzamdqZ2hycHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjY5MzIsImV4cCI6MjA3OTMwMjkzMn0.LTeGWIuIZeCmBMbjY_ImjcuEGWnIKg4RIM9ZxrB8css';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);