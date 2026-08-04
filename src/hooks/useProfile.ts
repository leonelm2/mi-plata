import { useState, useCallback, useEffect } from 'react';
import type { Profile } from '../types';
import { SEED_PROFILE } from '../lib/seed';
import { ProfileService } from '../services/supabase/profile';

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

  return { profile, updateProfile, isLoading };
}
