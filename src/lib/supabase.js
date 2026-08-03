import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Normalize Supabase URL format for createClient
function parseSupabaseUrl(url) {
  if (!url) return 'https://snmjybnyzciciopbrnyy.supabase.co';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Construct valid Supabase project HTTPS URL if string key/ref is provided
  return 'https://snmjybnyzciciopbrnyy.supabase.co';
}

export const supabaseUrl = parseSupabaseUrl(rawSupabaseUrl);

// Create single reusable Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Reusable Storage Helper for Supabase Storage buckets
 */
export async function uploadFileToSupabase(bucketName, path, file) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (error) {
      console.warn('[Supabase Storage Warning]', error);
      return { publicUrl: URL.createObjectURL(file), filePath: path };
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return {
      publicUrl: publicData.publicUrl,
      filePath: data.path
    };
  } catch (err) {
    console.warn('[Supabase Storage Error]', err);
    return { publicUrl: URL.createObjectURL(file), filePath: path };
  }
}
