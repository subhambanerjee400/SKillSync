import { supabase } from './supabase.js';

export const USER_ROLES = {
  JOB_SEEKER: 'job_seeker',
  INSTITUTION: 'institution',
  INDUSTRY_PARTNER: 'industry_partner',
};

// Safe storage wrapper for browser storage or in-memory fallback
const inMemoryCache = new Map();

const getGlobalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
};

const getGlobalSessionStorage = () => {
  if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
  if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) return globalThis.sessionStorage;
  return null;
};

export const safeStorage = {
  getItem(key) {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        return storage.getItem(key);
      } catch (e) { }
    }
    return inMemoryCache.get(key) || null;
  },
  setItem(key, val) {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        storage.setItem(key, val);
        return;
      } catch (e) { }
    }
    inMemoryCache.set(key, val);
  },
  removeItem(key) {
    const storage = getGlobalStorage();
    if (storage) {
      try {
        storage.removeItem(key);
        return;
      } catch (e) { }
    }
    inMemoryCache.delete(key);
  },
};

export const safeSessionStorage = {
  getItem(key) {
    const storage = getGlobalSessionStorage();
    if (storage) {
      try {
        return storage.getItem(key);
      } catch (e) { }
    }
    return inMemoryCache.get(`session_${key}`) || null;
  },
  setItem(key, val) {
    const storage = getGlobalSessionStorage();
    if (storage) {
      try {
        storage.setItem(key, val);
        return;
      } catch (e) { }
    }
    inMemoryCache.set(`session_${key}`, val);
  },
  removeItem(key) {
    const storage = getGlobalSessionStorage();
    if (storage) {
      try {
        storage.removeItem(key);
        return;
      } catch (e) { }
    }
    inMemoryCache.delete(`session_${key}`);
  },
};

/**
 * Normalizes any role string into canonical 'job_seeker', 'institution', or 'industry_partner'.
 */
export function normalizeRole(role) {
  if (!role) return USER_ROLES.JOB_SEEKER;
  const clean = String(role).trim().toLowerCase();
  if (clean === 'institution') return USER_ROLES.INSTITUTION;
  if (
    clean === 'industry_partner' ||
    clean === 'industry' ||
    clean === 'employer' ||
    clean === 'partner'
  ) {
    return USER_ROLES.INDUSTRY_PARTNER;
  }
  if (clean === 'job_seeker' || clean === 'user' || clean === 'student') {
    return USER_ROLES.JOB_SEEKER;
  }
  return clean;
}

/**
 * Returns user-facing friendly role label.
 */
export function getRoleDisplayLabel(role) {
  const norm = normalizeRole(role);
  if (norm === USER_ROLES.INSTITUTION) return 'Training Institution';
  if (norm === USER_ROLES.INDUSTRY_PARTNER) return 'Industry Partner';
  return 'Job Seeker';
}

/**
 * Fetch all roles assigned to a user from public.user_roles.
 * Merges with local storage cache for offline/mock resilience.
 * Always returns an array of unique normalized strings.
 */
export async function getUserRoles(userId) {
  if (!userId) return [USER_ROLES.JOB_SEEKER];

  let roles = [];

  // 1. Try Supabase user_roles table
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase user_roles fetch warning:', error.message || error);
    } else if (data && data.length > 0) {
      roles = data.map((r) => normalizeRole(r.role));
    }
  } catch (err) {
    console.warn('user_roles network error:', err.message || err);
  }

  // 2. Fallback / merge with local cache
  const cachedStr = safeStorage.getItem(`skillsync_user_roles_${userId}`);
  if (cachedStr) {
    try {
      const parsed = JSON.parse(cachedStr);
      if (Array.isArray(parsed)) {
        roles = Array.from(new Set([...roles, ...parsed.map(normalizeRole)]));
      }
    } catch (e) { }
  }

  // 3. Fallback to legacy skillsync_accounts or profiles if empty
  if (roles.length === 0) {
    try {
      const accStr = safeStorage.getItem('skillsync_accounts');
      if (accStr) {
        const acc = JSON.parse(accStr);
        if (acc[userId]) {
          roles.push(normalizeRole(acc[userId]));
        }
      }
    } catch (e) { }
  }

  // Default fallback to at least job_seeker
  if (roles.length === 0) {
    roles = [USER_ROLES.JOB_SEEKER];
  }

  const uniqueRoles = Array.from(new Set(roles));
  safeStorage.setItem(`skillsync_user_roles_${userId}`, JSON.stringify(uniqueRoles));
  return uniqueRoles;
}

/**
 * Add a new role to a user.
 * Inserts into public.user_roles (enforcing UNIQUE(user_id, role)).
 * Updates local cache and returns updated list of roles.
 */
export async function addUserRole(userId, role, metadata = {}) {
  if (!userId) return [USER_ROLES.JOB_SEEKER];
  const normalized = normalizeRole(role);

  // 1. Insert into Supabase user_roles
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role: normalized },
        { onConflict: 'user_id,role' }
      );

    if (error) {
      console.warn('Supabase addUserRole warning:', error.message || error);
    }
  } catch (err) {
    console.warn('addUserRole network error:', err.message || err);
  }

  // 2. Update local storage cache
  const currentRoles = await getUserRoles(userId);
  const updatedRoles = Array.from(new Set([...currentRoles, normalized]));
  safeStorage.setItem(`skillsync_user_roles_${userId}`, JSON.stringify(updatedRoles));

  // 3. If institution or industry metadata provided, persist locally
  if (normalized === USER_ROLES.INSTITUTION && (metadata.institution_name || metadata.org_name)) {
    try {
      const instData = {
        institutionName: metadata.institution_name || metadata.org_name,
        registrationNumber: metadata.registration_number || '',
        updatedAt: new Date().toISOString(),
      };
      safeStorage.setItem(`skillsync_institution_${userId}`, JSON.stringify(instData));
    } catch (e) { }
  } else if (normalized === USER_ROLES.INDUSTRY_PARTNER && (metadata.company_name || metadata.org_name || metadata.industry_sector)) {
    try {
      const indData = {
        companyName: metadata.company_name || metadata.org_name || '',
        industrySector: metadata.industry_sector || '',
        updatedAt: new Date().toISOString(),
      };
      safeStorage.setItem(`skillsync_industry_${userId}`, JSON.stringify(indData));
    } catch (e) { }
  }

  return updatedRoles;
}

/**
 * Find existing account by email across local registry and stored users.
 * Returns { exists: boolean, userId: string | null, roles: string[] }
 */
export function findExistingAccountByEmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { exists: false, userId: null, roles: [] };
  }

  let foundUserId = null;

  // 1. Check user registry
  try {
    const regStr = safeStorage.getItem('skillsync_user_registry');
    if (regStr) {
      const registry = JSON.parse(regStr);
      if (registry[cleanEmail]) {
        foundUserId = registry[cleanEmail];
      }
    }
  } catch (e) { }

  // 2. Check current active skillsync_user
  if (!foundUserId) {
    try {
      const userStr = safeStorage.getItem('skillsync_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.email && u.email.toLowerCase() === cleanEmail) {
          foundUserId = u.id;
        }
      }
    } catch (e) { }
  }

  // 3. Check profiles in localStorage
  if (!foundUserId && typeof localStorage !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('skillsync_profile_')) {
          const prof = JSON.parse(localStorage.getItem(key));
          if (prof && prof.email && prof.email.toLowerCase() === cleanEmail) {
            foundUserId = prof.id;
            break;
          }
        }
      }
    } catch (e) { }
  }

  if (foundUserId) {
    let roles = [];
    const rolesStr = safeStorage.getItem(`skillsync_user_roles_${foundUserId}`);
    if (rolesStr) {
      try {
        roles = JSON.parse(rolesStr).map(normalizeRole);
      } catch (e) { }
    }

    if (roles.length === 0) {
      const accStr = safeStorage.getItem('skillsync_accounts');
      if (accStr) {
        try {
          const acc = JSON.parse(accStr);
          if (acc[foundUserId]) roles.push(normalizeRole(acc[foundUserId]));
          else if (acc[cleanEmail]) roles.push(normalizeRole(acc[cleanEmail]));
        } catch (e) { }
      }
    }

    if (roles.length === 0) {
      roles = [USER_ROLES.JOB_SEEKER];
    }

    return {
      exists: true,
      userId: foundUserId,
      roles: Array.from(new Set(roles)),
    };
  }

  return { exists: false, userId: null, roles: [] };
}

/**
 * Manage pending role addition during registration -> login handoff.
 */
export function savePendingRole(data) {
  if (!data) return;
  safeSessionStorage.setItem('skillsync_pending_role', JSON.stringify(data));
}

export function getPendingRole() {
  const str = safeSessionStorage.getItem('skillsync_pending_role');
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

export function clearPendingRole() {
  safeSessionStorage.removeItem('skillsync_pending_role');
}

/**
 * Manage active session role:
 * Persists choice in sessionStorage for the active browser session,
 * with convenience default in localStorage.
 */
export function getSessionActiveRole(defaultRole = null) {
  const sessionRole = safeSessionStorage.getItem('skillsync_session_role');
  if (sessionRole) return normalizeRole(sessionRole);

  const lastRole = safeStorage.getItem('skillsync_last_role');
  if (lastRole) return normalizeRole(lastRole);

  return defaultRole ? normalizeRole(defaultRole) : null;
}

export function setSessionActiveRole(role) {
  if (!role) return;
  const normalized = normalizeRole(role);
  safeSessionStorage.setItem('skillsync_session_role', normalized);
  safeStorage.setItem('skillsync_last_role', normalized);
}

export function clearSessionActiveRole() {
  safeSessionStorage.removeItem('skillsync_session_role');
}
