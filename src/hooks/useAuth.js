import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { saveAccountRoleLocally } from '../lib/accountRole';
import { getUserProfile, saveProfileLocally } from '../lib/profile';
import { getAvatarUrl } from '../data/avatars';
import {
  getUserRoles,
  addUserRole,
  getSessionActiveRole,
  setSessionActiveRole,
  clearSessionActiveRole,
  getPendingRole,
  clearPendingRole,
  normalizeRole,
  USER_ROLES,
} from '../lib/userRoles';

const AuthContext = createContext(null);

function getOrCreateFallbackUserId(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return 'usr_' + Date.now();

  try {
    const registryStr = localStorage.getItem('skillsync_user_registry');
    const registry = registryStr ? JSON.parse(registryStr) : {};
    if (registry[cleanEmail]) {
      return registry[cleanEmail];
    }

    // Check if any existing profile belongs to this email
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('skillsync_profile_')) {
        try {
          const prof = JSON.parse(localStorage.getItem(key));
          if (prof && prof.email && prof.email.toLowerCase() === cleanEmail && prof.id) {
            registry[cleanEmail] = prof.id;
            localStorage.setItem('skillsync_user_registry', JSON.stringify(registry));
            return prof.id;
          }
        } catch (e) { }
      }
    }

    // Deterministic id from clean email
    let hash = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      hash = (hash << 5) - hash + cleanEmail.charCodeAt(i);
      hash |= 0;
    }
    const cleanPrefix = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 10);
    const id = `usr_${cleanPrefix}_${Math.abs(hash).toString(36)}`;
    registry[cleanEmail] = id;
    localStorage.setItem('skillsync_user_registry', JSON.stringify(registry));
    return id;
  } catch (e) {
    return 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([USER_ROLES.JOB_SEEKER]);
  const [activeRole, setActiveRole] = useState(() => getSessionActiveRole(USER_ROLES.JOB_SEEKER));
  const [profile, setProfile] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('skillsync_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u?.id) {
          const cached = localStorage.getItem(`skillsync_profile_${u.id}`);
          if (cached) return JSON.parse(cached);
        }
      }
    } catch (e) {}
    return null;
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true); // Only true during initial session check
  const [error, setError] = useState(null);

  // Sync roles whenever user changes
  const refreshUserRoles = useCallback(async (uid) => {
    const targetId = uid || user?.id;
    if (!targetId) {
      setUserRoles([USER_ROLES.JOB_SEEKER]);
      return [USER_ROLES.JOB_SEEKER];
    }
    try {
      const roles = await getUserRoles(targetId);
      setUserRoles(roles);

      const sessionChoice = getSessionActiveRole();
      if (sessionChoice && roles.includes(sessionChoice)) {
        setActiveRole(sessionChoice);
      } else if (roles.length === 1) {
        setActiveRole(roles[0]);
        setSessionActiveRole(roles[0]);
      }
      return roles;
    } catch (err) {
      console.warn('refreshUserRoles error:', err);
      return [USER_ROLES.JOB_SEEKER];
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // 1. Check Supabase session first
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Supabase getSession error:', sessionError.message);
        }

        if (mounted && data?.session?.user) {
          const authed = data.session.user;
          setSession(data.session);
          setUser(authed);
          setRole(authed.user_metadata?.role || 'student');
          await refreshUserRoles(authed.id);
          setLoading(false);
          return;
        }

        // 2. Check local stored session (for dev/fallback if project key is still placeholder)
        const savedUserStr = localStorage.getItem('skillsync_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            if (savedUser && savedUser.id) {
              if (mounted) {
                setUser(savedUser);
                setRole(savedUser.user_metadata?.role || savedUser.role || 'student');
                setSession({ user: savedUser });
                await refreshUserRoles(savedUser.id);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            localStorage.removeItem('skillsync_user');
          }
        }
      } catch (err) {
        console.warn('Error during session initialization:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // 3. Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setRole(newSession.user.user_metadata?.role || 'student');
        localStorage.setItem('skillsync_user', JSON.stringify(newSession.user));
        await refreshUserRoles(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setRole('student');
        setUserRoles([USER_ROLES.JOB_SEEKER]);
        setActiveRole(USER_ROLES.JOB_SEEKER);
        clearSessionActiveRole();
        clearPendingRole();
        localStorage.removeItem('skillsync_user');
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [refreshUserRoles]);

  // Fetch and refresh active profile from Supabase profiles table
  const refreshProfile = useCallback(async (targetUserId) => {
    const uid = targetUserId || user?.id;
    if (!uid) {
      setProfile(null);
      return null;
    }
    try {
      const p = await getUserProfile(uid);
      if (p) {
        setProfile((prev) => {
          if (prev && JSON.stringify(prev) === JSON.stringify(p)) return prev;
          return p;
        });
      }
      return p;
    } catch (err) {
      console.warn('refreshProfile error:', err);
      return null;
    }
  }, [user?.id]);

  // Keep profile in sync whenever user id changes
  useEffect(() => {
    if (user?.id) {
      // 1. Immediately hydrate from local storage cache if available
      try {
        const cached = localStorage.getItem(`skillsync_profile_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id === user.id || parsed.name)) {
            setProfile((curr) => {
              if (curr && JSON.stringify(curr) === JSON.stringify(parsed)) return curr;
              return parsed;
            });
          }
        }
      } catch (e) {}

      // 2. Fetch fresh copy from Supabase profiles table
      refreshProfile(user.id);
      refreshUserRoles(user.id);
    } else {
      setProfile(null);
    }
  }, [user?.id, refreshProfile, refreshUserRoles]);

  // Update profile across shared context, Supabase, and localStorage
  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return { error: new Error('No authenticated user') };

    // 1. Optimistically merge and update state + local cache so all components re-render immediately
    let mergedProfile = null;
    setProfile((prev) => {
      mergedProfile = { ...(prev || {}), id: user.id, ...updates };
      saveProfileLocally(user.id, mergedProfile);
      return mergedProfile;
    });

    // 2. Keep skillsync_user in sync if name or avatar was updated
    if (updates.name || updates.avatar_url) {
      try {
        const savedUserStr = localStorage.getItem('skillsync_user');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (updates.name) {
            u.name = updates.name;
            u.full_name = updates.name;
          }
          if (updates.avatar_url) {
            u.avatar_url = updates.avatar_url;
            u.avatar = updates.avatar_url;
          }
          localStorage.setItem('skillsync_user', JSON.stringify(u));
        }
      } catch (e) {}
    }

    // 3. Write updates directly to Supabase profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Supabase updateProfile warning:', error.message);
      } else if (data) {
        setProfile(data);
        saveProfileLocally(user.id, data);
      }
      return { data: data || mergedProfile, error };
    } catch (err) {
      console.warn('updateProfile network error:', err);
      return { data: mergedProfile, error: err };
    }
  }, [user?.id]);

  // Canonical single source of truth for user's display name
  const userName = useMemo(() => {
    return (
      profile?.name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.full_name ||
      user?.name ||
      (user?.email ? user.email.split('@')[0] : 'Member')
    );
  }, [profile?.name, user]);

  // Canonical single source of truth for user's avatar URL
  const userAvatar = useMemo(() => {
    const rawAvatar =
      profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      user?.avatar_url ||
      user?.avatar;
    return getAvatarUrl(rawAvatar, userName);
  }, [profile?.avatar_url, user, userName]);

  // Switch the user's active session role (job_seeker <-> institution)
  const switchActiveRole = useCallback((newRole) => {
    const normalized = normalizeRole(newRole);
    setActiveRole(normalized);
    setSessionActiveRole(normalized);
    return normalized;
  }, []);

  // Add a new role to the current user
  const addRoleToUser = useCallback(async (roleToAdd, metadata = {}) => {
    if (!user?.id) return [USER_ROLES.JOB_SEEKER];
    const updated = await addUserRole(user.id, roleToAdd, metadata);
    setUserRoles(updated);
    return updated;
  }, [user?.id]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const cleanEmail = email.trim();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        console.error('Supabase signInWithPassword error:', authError);
        // If Supabase returns an invalid key error (placeholder key), provide fallback session
        if (authError.message?.toLowerCase().includes('api key') || authError.status === 401) {
          console.warn('Supabase returned API key error. Using development session:', authError.message);
          const userId = getOrCreateFallbackUserId(cleanEmail);
          let savedAccountRole = 'job_seeker';
          try {
            const str = localStorage.getItem('skillsync_accounts');
            if (str) {
              const reg = JSON.parse(str);
              if (reg[userId]) savedAccountRole = reg[userId];
              else if (reg[cleanEmail.toLowerCase()]) savedAccountRole = reg[cleanEmail.toLowerCase()];
            }
          } catch (e) { }

          const fallbackUser = {
            id: userId,
            email: cleanEmail,
            role: 'student',
            user_metadata: {
              full_name: cleanEmail.split('@')[0],
              role: 'student',
              account_role: savedAccountRole,
            },
          };

          // Apply pending role if present
          const pending = getPendingRole();
          if (pending && (!pending.email || pending.email.toLowerCase() === cleanEmail.toLowerCase())) {
            await addUserRole(userId, pending.role, pending);
            clearPendingRole();
          }

          const roles = await getUserRoles(userId);
          setUserRoles(roles);

          const lastChoice = getSessionActiveRole();
          if (lastChoice && roles.includes(lastChoice)) {
            setActiveRole(lastChoice);
          } else if (roles.length === 1) {
            setActiveRole(roles[0]);
            setSessionActiveRole(roles[0]);
          } else {
            setActiveRole(null);
          }

          setUser(fallbackUser);
          setSession({ user: fallbackUser });
          localStorage.setItem('skillsync_user', JSON.stringify(fallbackUser));
          return { user: fallbackUser, session: { user: fallbackUser }, roles };
        }
        throw authError;
      }

      if (data?.user) {
        let authedUser = data.user;

        // Apply pending role if present
        const pending = getPendingRole();
        if (pending && (!pending.email || pending.email.toLowerCase() === cleanEmail.toLowerCase())) {
          await addUserRole(authedUser.id, pending.role, pending);
          clearPendingRole();
        }

        const roles = await getUserRoles(authedUser.id);
        setUserRoles(roles);

        const lastChoice = getSessionActiveRole();
        if (lastChoice && roles.includes(lastChoice)) {
          setActiveRole(lastChoice);
        } else if (roles.length === 1) {
          setActiveRole(roles[0]);
          setSessionActiveRole(roles[0]);
        } else {
          setActiveRole(null);
        }

        setUser(authedUser);
        setSession(data.session);
        setRole(authedUser.user_metadata?.role || 'student');
        localStorage.setItem('skillsync_user', JSON.stringify(authedUser));
        return { ...data, user: authedUser, roles };
      }

      return data;
    } catch (err) {
      console.error('Sign-in failed with error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (email, password, metadata = {}) => {
    setError(null);
    const rawRole = metadata.account_role || metadata.accountRole || USER_ROLES.JOB_SEEKER;
    const chosenRole = normalizeRole(rawRole);
    const cleanEmail = email.trim().toLowerCase();
    saveAccountRoleLocally(cleanEmail, chosenRole);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: metadata.full_name || metadata.fullName || 'Member',
            role: metadata.role || 'student',
            account_role: chosenRole,
            institution_name: metadata.institution_name || metadata.org_name || '',
            registration_number: metadata.registration_number || '',
            company_name: metadata.company_name || metadata.companyName || metadata.org_name || '',
            industry_sector: metadata.industry_sector || metadata.industrySector || '',
            org_name: metadata.org_name || metadata.institution_name || metadata.company_name || '',
            target_role: metadata.target_role || metadata.targetRole || '',
          },
        },
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('api key') || authError.status === 401) {
          console.warn('Supabase returned API key error. Using development signup:', authError.message);

          // In development fallback mode: if this email already exists and has roles, simulate Supabase "User already registered" error
          try {
            const regStr = localStorage.getItem('skillsync_user_registry');
            const registry = regStr ? JSON.parse(regStr) : {};
            if (registry[cleanEmail]) {
              const existingId = registry[cleanEmail];
              const rolesStr = localStorage.getItem(`skillsync_user_roles_${existingId}`);
              const existingRoles = rolesStr ? JSON.parse(rolesStr) : [];
              if (existingRoles.length > 0) {
                const dupError = new Error('User already registered');
                dupError.code = 'user_already_exists';
                dupError.status = 400;
                throw dupError;
              }
            }
          } catch (dupErr) {
            if (dupErr.message === 'User already registered') throw dupErr;
          }

          const userId = getOrCreateFallbackUserId(cleanEmail);
          saveAccountRoleLocally(userId, chosenRole);
          const fallbackUser = {
            id: userId,
            email: cleanEmail,
            role: metadata.role || 'student',
            user_metadata: {
              full_name: metadata.full_name || metadata.fullName || cleanEmail.split('@')[0],
              role: metadata.role || 'student',
              account_role: chosenRole,
              institution_name: metadata.institution_name || metadata.org_name || '',
              registration_number: metadata.registration_number || '',
              company_name: metadata.company_name || metadata.companyName || metadata.org_name || '',
              industry_sector: metadata.industry_sector || metadata.industrySector || '',
              org_name: metadata.org_name || metadata.institution_name || metadata.company_name || '',
            },
          };

          const roles = await addUserRole(userId, chosenRole, metadata);
          setUserRoles(roles);
          setActiveRole(chosenRole);
          setSessionActiveRole(chosenRole);

          setUser(fallbackUser);
          setSession({ user: fallbackUser });
          localStorage.setItem('skillsync_user', JSON.stringify(fallbackUser));
          return { user: fallbackUser, session: { user: fallbackUser }, roles };
        }
        throw authError;
      }

      if (data?.user) {
        saveAccountRoleLocally(data.user.id, chosenRole);
        try {
          await supabase.from('accounts').upsert({
            user_id: data.user.id,
            account_role: chosenRole,
          });
        } catch (accErr) {
          console.warn('Supabase accounts upsert warning:', accErr?.message);
        }

        const roles = await addUserRole(data.user.id, chosenRole, metadata);
        setUserRoles(roles);
        setActiveRole(chosenRole);
        setSessionActiveRole(chosenRole);

        setUser(data.user);
        setSession(data.session);
        setRole(data.user.user_metadata?.role || metadata.role || 'student');
        localStorage.setItem('skillsync_user', JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('student');
      setUserRoles([USER_ROLES.JOB_SEEKER]);
      setActiveRole(USER_ROLES.JOB_SEEKER);
      clearSessionActiveRole();
      clearPendingRole();
      localStorage.removeItem('skillsync_user');
    }
  }, []);

  const switchRole = useCallback((newRole) => {
    setRole(newRole);
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    role,
    userRoles,
    activeRole,
    switchActiveRole,
    addRoleToUser,
    refreshUserRoles,
    profile,
    profileLoading,
    userName,
    userAvatar,
    loading,
    error,
    login,
    signup,
    logout,
    switchRole,
    refreshProfile,
    updateProfile,
    setProfile,
  }), [
    user,
    session,
    role,
    userRoles,
    activeRole,
    switchActiveRole,
    addRoleToUser,
    refreshUserRoles,
    profile,
    profileLoading,
    userName,
    userAvatar,
    loading,
    error,
    login,
    signup,
    logout,
    switchRole,
    refreshProfile,
    updateProfile,
  ]);

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
