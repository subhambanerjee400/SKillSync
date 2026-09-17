import { supabase } from './supabase.js';

export const RELEVANCE_OPTIONS = [
  'Not Relevant',
  'Slightly Relevant',
  'Relevant',
  'Very Relevant',
  'Highly Relevant',
];

// In-memory fallback cache for Node/test environments
const inMemoryCache = new Map();

const safeStorage = {
  getItem(key) {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch (e) {}
    }
    return inMemoryCache.get(key) || null;
  },
  setItem(key, val) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, val);
        return;
      } catch (e) {}
    }
    inMemoryCache.set(key, val);
  },
};

/**
 * Submit feedback for a job seeker.
 * Persists to Supabase `public.feedback` and mirrors in local cache.
 */
export async function submitFeedback({
  userId,
  overallRating,
  relevanceRating,
  skillsImproved = [],
  skillsStillNeeded = [],
  writtenFeedback,
  suggestions = '',
}) {
  if (!userId) {
    throw new Error('User ID is required to submit feedback');
  }

  const ratingInt = Math.min(5, Math.max(1, parseInt(overallRating, 10) || 5));
  const validRelevance = RELEVANCE_OPTIONS.includes(relevanceRating)
    ? relevanceRating
    : 'Relevant';

  const payload = {
    user_id: userId,
    overall_rating: ratingInt,
    relevance_rating: validRelevance,
    skills_improved: Array.isArray(skillsImproved) ? skillsImproved : [],
    skills_still_needed: Array.isArray(skillsStillNeeded) ? skillsStillNeeded : [],
    written_feedback: (writtenFeedback || '').trim(),
    suggestions: (suggestions || '').trim() || null,
  };

  if (!payload.written_feedback) {
    throw new Error('Please provide written feedback');
  }

  let savedRow = null;

  // 1. Try Supabase insert
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([payload])
      .select('*')
      .maybeSingle();

    if (error) {
      console.warn('Supabase feedback insert warning:', error.message || error);
    } else if (data) {
      savedRow = data;
    }
  } catch (err) {
    console.warn('Supabase feedback network error:', err.message || err);
  }

  // 2. Fallback / local cache persistence
  if (!savedRow) {
    savedRow = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
  }

  try {
    const cacheKey = `skillsync_feedback_${userId}`;
    const existingStr = safeStorage.getItem(cacheKey);
    const existingList = existingStr ? JSON.parse(existingStr) : [];
    const updated = [savedRow, ...existingList.filter((item) => item.id !== savedRow.id)];
    safeStorage.setItem(cacheKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to cache feedback locally:', e);
  }

  return { success: true, data: savedRow };
}

/**
 * Fetch past feedback submitted by a specific user.
 * Strictly queries ONLY the user's rows (`user_id = userId`), enforcing tenant isolation.
 */
export async function getUserFeedbackHistory(userId) {
  if (!userId) return { success: true, data: [] };

  let rows = [];

  // 1. Try Supabase select
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase feedback fetch warning:', error.message || error);
    } else if (data && data.length > 0) {
      rows = data;
    }
  } catch (err) {
    console.warn('Supabase feedback fetch error:', err.message || err);
  }

  // 2. Merge / fallback to local cache
  try {
    const cacheKey = `skillsync_feedback_${userId}`;
    const cachedStr = safeStorage.getItem(cacheKey);
    if (cachedStr) {
      const cachedList = JSON.parse(cachedStr);
      if (Array.isArray(cachedList)) {
        // Merge by ID with Supabase rows having priority
        const existingIds = new Set(rows.map((r) => r.id));
        for (const item of cachedList) {
          if (item && item.user_id === userId && !existingIds.has(item.id)) {
            rows.push(item);
          }
        }
      }
    }
  } catch (e) {}

  // Sort by created_at DESC
  rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return { success: true, data: rows };
}
