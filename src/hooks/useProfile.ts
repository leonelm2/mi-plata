import { useState, useCallback } from 'react';
import type { Profile } from '../types';
import { SEED_PROFILE } from '../lib/seed';

const STORAGE_KEY = 'miplata_profile';

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch { /* */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROFILE));
  return SEED_PROFILE;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(loadProfile);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { profile, updateProfile };
}
