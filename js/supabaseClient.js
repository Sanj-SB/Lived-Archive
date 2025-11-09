// supabaseClient.js - Supabase client initialization
// NOTE: You provided the project URL and anon key. In production, do NOT commit anon/service keys in source.
// Move keys to environment variables or a secure server-side proxy for sensitive operations.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase config - replace these values if different
const SUPABASE_URL = 'https://ilfbpykimlfbiuoqugxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZmJweWtpbWxmYml1b3F1Z3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDc3NDAsImV4cCI6MjA3Nzk4Mzc0MH0.e_1wroKpr5tMV5RQcp5GXqgIN9d-Rr74XzxJCcQW9iw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Expose getPublicUrl globally for use in app.js
if (typeof window !== 'undefined') {
  window.getPublicUrl = getPublicUrl;
}

// Helper: publicly get a storage URL for a path
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}
