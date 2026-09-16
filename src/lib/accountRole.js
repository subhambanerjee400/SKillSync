export const ACCOUNT_ROLES = {
  USER: 'user',
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

export function getAccountRole(user) {
  if (!user) return ACCOUNT_ROLES.USER;

  // 1. Check user metadata or user property
  const candidate = user?.user_metadata?.account_role || user?.account_role;
  if (Object.values(ACCOUNT_ROLES).includes(candidate)) {
    return candidate;
  }

  // 2. Check local accounts registry by user.id and user.email
  try {
    const str = localStorage.getItem('skillsync_accounts');
    if (str) {
      const registry = JSON.parse(str);
      if (user.id && registry[user.id]) return registry[user.id];
      if (user.email && registry[user.email.toLowerCase()]) return registry[user.email.toLowerCase()];
    }
  } catch (e) {}

  return ACCOUNT_ROLES.USER;
}

export function getAccountHomePath(user) {
  switch (getAccountRole(user)) {
    case ACCOUNT_ROLES.INSTITUTION:
      return '/institution-dashboard';
    case ACCOUNT_ROLES.INDUSTRY:
      return '/industry-dashboard';
    default:
      return '/dashboard';
  }
}
