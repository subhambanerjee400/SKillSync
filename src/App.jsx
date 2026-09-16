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
import Landing from './pages/Landing';
import { getAccountHomePath, getAccountRole } from './lib/accountRole';
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
        <span>Loading...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getAccountHomePath(user)} replace />;
  }

  return children;
}

// Route Guard for /onboarding:
// After a successful login, before rendering the onboarding form, checks Supabase for
// an existing row in the profiles table matching this user's id.
// If a profile already exists: skips onboarding and redirects straight to /dashboard.
// If no profile exists yet (first-time user): shows the onboarding form.
function OnboardingRoute({ children }) {
  const { user, loading } = useAuth();
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

  if (getAccountRole(user) !== 'user') {
    return <Navigate to={getAccountHomePath(user)} replace />;
  }

  if (hasProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AccountRoleRoute({ accountRole, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#64748b' }}>Verifying session...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (getAccountRole(user) !== accountRole) return <Navigate to={getAccountHomePath(user)} replace />;
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
              <AccountRoleRoute accountRole="user">
                <Dashboard />
              </AccountRoleRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <AccountRoleRoute accountRole="user">
                <EditProfile />
              </AccountRoleRoute>
            }
          />
          <Route path="/institution-dashboard" element={<AccountRoleRoute accountRole="institution"><InstitutionDashboardPreview /></AccountRoleRoute>} />
          <Route path="/industry-dashboard" element={<AccountRoleRoute accountRole="industry"><IndustryDashboardPreview /></AccountRoleRoute>} />
          {/* Landing Page (Entry point before login/signup) */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
