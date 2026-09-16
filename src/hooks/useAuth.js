import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { saveAccountRoleLocally } from '../lib/accountRole';

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
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true); // Only true during initial session check
  const [error, setError] = useState(null);

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
          setSession(data.session);
          setUser(data.session.user);
          setRole(data.session.user.user_metadata?.role || 'student');
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
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setRole('student');
        localStorage.removeItem('skillsync_user');
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        console.error('Supabase signInWithPassword error:', authError);
        // If Supabase returns an invalid key error (placeholder key), provide fallback session
        if (authError.message?.toLowerCase().includes('api key') || authError.status === 401) {
          console.warn('Supabase returned API key error. Using development session:', authError.message);
          const userId = getOrCreateFallbackUserId(email);
          let savedAccountRole = 'user';
          try {
            const str = localStorage.getItem('skillsync_accounts');
            if (str) {
              const reg = JSON.parse(str);
              if (reg[userId]) savedAccountRole = reg[userId];
              else if (reg[email.trim().toLowerCase()]) savedAccountRole = reg[email.trim().toLowerCase()];
            }
          } catch (e) { }

          const fallbackUser = {
            id: userId,
            email: email.trim(),
            role: 'student',
            user_metadata: {
              full_name: email.split('@')[0],
              role: 'student',
              account_role: savedAccountRole,
            },
          };
          setUser(fallbackUser);
          setSession({ user: fallbackUser });
          localStorage.setItem('skillsync_user', JSON.stringify(fallbackUser));
          return { user: fallbackUser, session: { user: fallbackUser } };
        }
        throw authError;
      }

      if (data?.user) {
        let authedUser = data.user;
        const currentRole = authedUser.user_metadata?.account_role;
        if (!currentRole) {
          try {
            const { data: accData } = await supabase
              .from('accounts')
              .select('account_role')
              .eq('user_id', authedUser.id)
              .maybeSingle();
            if (accData?.account_role) {
              authedUser = {
                ...authedUser,
                user_metadata: {
                  ...(authedUser.user_metadata || {}),
                  account_role: accData.account_role,
                },
              };
            }
          } catch (e) { }
        }
        setUser(authedUser);
        setSession(data.session);
        setRole(authedUser.user_metadata?.role || 'student');
        localStorage.setItem('skillsync_user', JSON.stringify(authedUser));
        return { ...data, user: authedUser };
      }

      return data;
    } catch (err) {
      console.error('Sign-in failed with error:', err);
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, metadata = {}) => {
    setError(null);
    const chosenRole = metadata.account_role || metadata.accountRole || 'user';
    saveAccountRoleLocally(email.trim().toLowerCase(), chosenRole);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata.full_name || metadata.fullName || 'Member',
            role: metadata.role || 'student',
            account_role: chosenRole,
            org_name: metadata.org_name || metadata.orgName || '',
            target_role: metadata.target_role || metadata.targetRole || '',
          },
        },
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('api key') || authError.status === 401) {
          console.warn('Supabase returned API key error. Using development signup:', authError.message);
          const userId = getOrCreateFallbackUserId(email);
          saveAccountRoleLocally(userId, chosenRole);
          const fallbackUser = {
            id: userId,
            email: email.trim(),
            role: metadata.role || 'student',
            user_metadata: {
              full_name: metadata.full_name || metadata.fullName || email.split('@')[0],
              role: metadata.role || 'student',
              account_role: chosenRole,
              org_name: metadata.org_name || metadata.orgName || '',
            },
          };
          setUser(fallbackUser);
          setSession({ user: fallbackUser });
          localStorage.setItem('skillsync_user', JSON.stringify(fallbackUser));
          return { user: fallbackUser, session: { user: fallbackUser } };
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
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setRole('student');
      localStorage.removeItem('skillsync_user');
    }
  };

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const value = {
    user,
    session,
    role,
    loading,
    error,
    login,
    signup,
    logout,
    switchRole,
  };

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
