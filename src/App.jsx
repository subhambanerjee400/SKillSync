import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { getUserProfile } from './lib/profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import InstitutionDashboardPreview from './pages/InstitutionDashboardPreview';
import IndustryDashboardPreview from './pages/IndustryDashboardPreview';
import RoleSelect from './pages/RoleSelect';
import Landing from './pages/Landing';
import { getAccountHomePath, getAccountRole } from './lib/accountRole';
import { normalizeRole, USER_ROLES } from './lib/userRoles';
import { Loader2 } from 'lucide-react';

// Route Guard: Accessible only to authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          background: 'var(--bg-app)',
          gap: '0.75rem',
          fontSize: '0.95rem',
        }}
      >
        <Loader2 size={28} className="animate-spin" color="#10B981" />
        <span>Verifying session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Route Guard: Accessible only to unauthenticated visitors
function PublicRoute({ children }) {
  const { user, userRoles, activeRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          background: 'var(--bg-app)',
          gap: '0.75rem',
          fontSize: '0.95rem',
        }}
      >
        <Loader2 size={28} className="animate-spin" color="#10B981" />
        <span>Loading...</span>
      </div>
    );
  }

  if (user) {
    if (userRoles && userRoles.length > 1 && !activeRole) {
      return <Navigate to="/role-select" replace />;
    }
    return <Navigate to={getAccountHomePath(user, activeRole)} replace />;
  }

  return children;
}

// Route Guard for /onboarding:
// Checks if profile exists for job seeker. If profile already exists, redirects to /dashboard.
function OnboardingRoute({ children }) {
  const { user, userRoles, activeRole, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) {
      setChecking(false);
      return;
    }

    async function checkProfile() {
      try {
        const profile = await getUserProfile(user.id);
        if (mounted) {
          if (profile && (profile.id || profile.role || profile.name)) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
          setChecking(false);
        }
      } catch (err) {
        console.warn('OnboardingRoute profile check error:', err);
        if (mounted) {
          setChecking(false);
        }
      }
    }

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading || checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          background: 'var(--bg-app)',
          gap: '0.75rem',
          fontSize: '0.95rem',
        }}
      >
        <Loader2 size={28} className="animate-spin" color="#10B981" />
        <span>Checking profile status...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasJobSeekerRole = userRoles?.some((r) => normalizeRole(r) === USER_ROLES.JOB_SEEKER);
  if (!hasJobSeekerRole) {
    return <Navigate to={getAccountHomePath(user, activeRole)} replace />;
  }

  if (hasProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AccountRoleRoute({ accountRole, children }) {
  const { user, userRoles, activeRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f8fafc',
          color: '#64748b',
        }}
      >
        <Loader2 size={28} className="animate-spin" color="#10B981" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const targetRole = normalizeRole(accountRole);
  const hasTargetRole = userRoles?.some((r) => normalizeRole(r) === targetRole);

  // If user doesn't possess this role, route to their accessible dashboard or role selection
  if (!hasTargetRole) {
    if (userRoles && userRoles.length > 1 && !activeRole) {
      return <Navigate to="/role-select" replace />;
    }
    return <Navigate to={getAccountHomePath(user, activeRole)} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/role-select"
            element={
              <ProtectedRoute>
                <RoleSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AccountRoleRoute accountRole="job_seeker">
                <Dashboard />
              </AccountRoleRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <AccountRoleRoute accountRole="job_seeker">
                <EditProfile />
              </AccountRoleRoute>
            }
          />
          <Route
            path="/institution-dashboard"
            element={
              <AccountRoleRoute accountRole="institution">
                <InstitutionDashboardPreview />
              </AccountRoleRoute>
            }
          />
          <Route
            path="/industry-dashboard"
            element={
              <AccountRoleRoute accountRole="industry">
                <IndustryDashboardPreview />
              </AccountRoleRoute>
            }
          />
          {/* Landing Page (Entry point before login/signup) */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
