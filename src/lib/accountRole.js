import { getSessionActiveRole, normalizeRole } from './userRoles.js';

export const ACCOUNT_ROLES = {
  USER: 'user',
  JOB_SEEKER: 'job_seeker',
  INSTITUTION: 'institution',
  INDUSTRY: 'industry',
};

export function saveAccountRoleLocally(key, role) {
  if (!key || !role) return;
  try {
    const str = localStorage.getItem('skillsync_accounts');
    const registry = str ? JSON.parse(str) : {};
    registry[key] = role;
    localStorage.setItem('skillsync_accounts', JSON.stringify(registry));
  } catch (e) {
    console.warn('Failed to save account role locally:', e);
  }
}

export function getAccountRole(user, explicitRole = null) {
  if (explicitRole) {
    return normalizeRole(explicitRole);
  }

  // 1. Check active session-selected role
  const sessionRole = getSessionActiveRole();
  if (sessionRole) {
    return sessionRole;
  }

  if (!user) return ACCOUNT_ROLES.JOB_SEEKER;

  // 2. Check user metadata or user property
  const candidate = user?.user_metadata?.account_role || user?.account_role;
  if (candidate) {
    return normalizeRole(candidate);
  }

  // 3. Check local accounts registry by user.id and user.email
  try {
    const str = localStorage.getItem('skillsync_accounts');
    if (str) {
      const registry = JSON.parse(str);
      if (user.id && registry[user.id]) return normalizeRole(registry[user.id]);
      if (user.email && registry[user.email.toLowerCase()]) return normalizeRole(registry[user.email.toLowerCase()]);
    }
  } catch (e) {}

  return ACCOUNT_ROLES.JOB_SEEKER;
}

export function getAccountHomePath(user, explicitRole = null) {
  const role = getAccountRole(user, explicitRole);
  switch (role) {
    case ACCOUNT_ROLES.INSTITUTION:
      return '/institution-dashboard';
    case ACCOUNT_ROLES.INDUSTRY:
      return '/industry-dashboard';
    default:
      return '/dashboard';
  }
}
