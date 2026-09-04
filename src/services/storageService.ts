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

  try {
    const timestamp = Date.now();
    const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${cleanUserId}/${prefix}_${timestamp}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
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
