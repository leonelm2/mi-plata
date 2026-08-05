import { useState, useCallback, useEffect } from 'react';
import type { Profile } from '../types';
import { SEED_PROFILE } from '../lib/seed';
import { ProfileService } from '../services/supabase/profile';
import { supabase } from '../services/supabase/client';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile>(SEED_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(SEED_PROFILE);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    ProfileService.getProfile(userId)
      .then((data) => {
        if (isMounted && data) {
          setProfile(data);
        }
        if (isMounted) setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      if (!userId) return null;
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.warn('Storage bucket fallback (using URL preview):', uploadError.message);
          return URL.createObjectURL(file);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const photoUrl = publicUrlData.publicUrl;
        await ProfileService.updateProfile(userId, { foto_url: photoUrl });
        setProfile((prev) => ({ ...prev, foto_url: photoUrl }));
        return photoUrl;
      } catch (e) {
        console.error('Error uploading avatar:', e);
        return null;
      }
    },
    [userId]
  );

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      setProfile((prev) => ({ ...prev, ...updates }));
      if (userId) {
        try {
          await ProfileService.updateProfile(userId, updates);
        } catch (e) {
          console.error('Error syncing profile updates to Supabase:', e);
        }
      }
    },
    [userId]
  );

  return { profile, updateProfile, uploadAvatar, isLoading };
}
