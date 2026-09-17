import { createClient } from '@supabase/supabase-js';

const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_URL) ||
  '';

const rawKey =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof process !== 'undefined' &&
    (process?.env?.VITE_SUPABASE_ANON_KEY ||
      process?.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  '';

const supabaseUrl = (rawUrl || '').trim().replace(/\/+$/, '');
const supabasePublishableKey = (rawKey || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('placeholder')
);

// 8-second global timeout fetch wrapper for Supabase requests
const fetchWithTimeout = (url, options = {}) => {
  const timeoutMs = 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Supabase request timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener('abort', () => {
        controller.abort(options.signal.reason);
      });
    }
  }

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Initialize Supabase client using publishable/anon key (never service-role key)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  }
);
