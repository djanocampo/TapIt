import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Storage service for avatar uploads.
 * Attempts upload to Supabase Storage if configured and available;
 * gracefully falls back to the compressed base64 dataUrl so it is 100% offline-resilient.
 */
export async function uploadAvatarImage(
  blob: Blob,
  userId: string,
  fallbackDataUrl: string,
  prefix = 'avatar'
): Promise<string> {
  if (!isSupabaseConfigured()) {
    return fallbackDataUrl;
  }

  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  if (blob.type && !ALLOWED_MIME_TYPES.includes(blob.type)) {
    console.warn('[StorageService] Disallowed MIME type rejected:', blob.type);
    return fallbackDataUrl;
  }

  // Enforce 10MB max size constraint
  if (blob.size > 10 * 1024 * 1024) {
    console.warn('[StorageService] Image size exceeds maximum allowable limit (10MB).');
    return fallbackDataUrl;
  }

  try {
    const timestamp = Date.now();
    const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '') || 'usr_anon';
    const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${cleanUserId}/${prefix}_${timestamp}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[StorageService] Supabase upload failed or bucket "avatars" not found, using dataUrl fallback:', uploadError.message);
      return fallbackDataUrl;
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    if (publicUrlData && publicUrlData.publicUrl) {
      return publicUrlData.publicUrl;
    }

    return fallbackDataUrl;
  } catch (err) {
    console.warn('[StorageService] Exception during avatar upload, falling back to dataUrl:', err);
    return fallbackDataUrl;
  }
}
