// supabaseClient.js - Supabase client initialization
// NOTE: You provided the project URL and anon key. In production, do NOT commit anon/service keys in source.
// Move keys to environment variables or a secure server-side proxy for sensitive operations.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

const supabaseUrl = 'https://ilfbpykimlfbiuoqugxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZmJweWtpbWxmYml1b3F1Z3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDc3NDAsImV4cCI6MjA3Nzk4Mzc0MH0.e_1wroKpr5tMV5RQcp5GXqgIN9d-Rr74XzxJCcQW9iw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get public URL for files in storage
export function getPublicUrl(bucket, filePath) {
  if (!filePath) return null;

  // If already a full URL, return as-is
  if (filePath.startsWith('http')) return filePath;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

// Make it available globally for compatibility
window.getPublicUrl = getPublicUrl;

console.log('✅ Supabase client initialized:', supabaseUrl);

// Test connection on load
supabase.from('accepted_artifacts').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error);
    } else {
      console.log(`✅ Connected! Found ${count} accepted artifacts`);
    }
  });
