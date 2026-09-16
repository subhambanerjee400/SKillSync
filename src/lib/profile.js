import { supabase } from './supabase.js';

// Safe storage wrapper for browser localStorage or in-memory fallback (Node/SSR/testing)
const inMemoryCache = new Map();
const safeStorage = {
  getItem(key) {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch (e) { }
    }
    return inMemoryCache.get(key) || null;
  },
  setItem(key, val) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, val);
        return;
      } catch (e) { }
    }
    inMemoryCache.set(key, val);
  },
};

/**
 * Fetch a user's profile from Supabase profiles table,
 * with fallback to local storage cache.
 * Returns null if no profile row exists.
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && data.id) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase profile fetch error:', err);
  }

  // Fallback to local cache for dev/offline resilience
  const cached = safeStorage.getItem(`skillsync_profile_${userId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.id === userId || parsed.name)) {
        return parsed;
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

/**
 * Fetch a user's skills from Supabase user_skills table,
 * with fallback to local storage cache.
 */
export async function getUserSkills(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select('skill_name')
      .eq('user_id', userId);

    if (data && data.length > 0) {
      return data.map((row) => row.skill_name);
    }
  } catch (err) {
    console.warn('Supabase user_skills fetch error:', err);
  }

  const cached = safeStorage.getItem(`skillsync_skills_${userId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) { }
  }

  return [];
}
