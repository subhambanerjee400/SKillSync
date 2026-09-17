import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../lib/profile';
import {
  USER_ROLES,
  getPendingRole,
  getUserRoles,
  normalizeRole,
} from '../lib/userRoles';
import AuthLayout from '../components/AuthLayout';
import {
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [pendingRoleBanner, setPendingRoleBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL params and sessionStorage for pending role handoff
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    const pending = getPendingRole();
    const roleParam = params.get('pending_role') || (pending ? pending.role : null);

    if (roleParam) {
      const normalized = normalizeRole(roleParam);
      const roleLabel = normalized === USER_ROLES.INSTITUTION ? 'Training Institution' : 'Job Seeker';
      // Ensure pending role is kept in session storage
      savePendingRole({
        role: normalized,
        email: emailParam || (pending ? pending.email : ''),
      });
      setPendingRoleBanner(`Log in with your existing credentials to add the ${roleLabel} role to your account.`);
    } else if (params.get('registered') === 'true') {
      setInfoMsg(t('auth.accountCreatedLoginMsg') || 'Registration successful! Please sign in.');
    }
  }, [location.search, t]);

  // Route helper after successful login or for already authenticated users
  const handleRoleRouting = async (targetUser) => {
    if (!targetUser?.id) {
      navigate('/onboarding', { replace: true });
      return;
    }

    // Process any pending role insertion
    const pending = getPendingRole();
    if (pending?.role) {
      await addUserRole(targetUser.id, pending.role, pending);
      clearPendingRole();
    }

    const roles = await getUserRoles(targetUser.id);

    // If user has MORE THAN ONE role: show "Continue as..." screen
    if (roles && roles.length > 1) {
      navigate('/role-select', { replace: true });
      return;
    }

    // Exactly ONE role
    const singleRole = roles[0] ? normalizeRole(roles[0]) : USER_ROLES.JOB_SEEKER;
    if (singleRole === USER_ROLES.INSTITUTION) {
      navigate('/institution-dashboard', { replace: true });
      return;
    }

    // Job seeker flow: verify profile
    const profile = await getUserProfile(targetUser.id);
    if (profile && (profile.id || profile.role || profile.name)) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  };

  // If already authenticated, route appropriately
  useEffect(() => {
    if (user?.id) {
      handleRoleRouting(user);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg(t('auth.errValidEmail') || 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg(t('auth.errPasswordLength') || 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      const authedUser = res?.user || user;
      await handleRoleRouting(authedUser);
    } catch (err) {
      console.error('Sign-in error:', err);
      setErrorMsg(err.message || t('auth.errSignInFailed') || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText={t('common.intelligencePortal') || 'National Readiness Portal'}
      badgeIcon={ShieldCheck}
      kicker={t('common.tagline') || 'National Readiness Portal'}
      title={t('auth.welcomeBack') || 'Welcome Back'}
      subtitle={t('auth.loginSubtitle') || 'Sign in to access your skills dashboard and learning roadmaps.'}
      footerPrompt={t('auth.noAccountPrompt') || "Don't have an account?"}
      footerLinkText={t('auth.signupLink') || 'Create one'}
      footerLinkTo="/signup"
    >
      {/* Alert Notifications */}
      <AnimatePresence>
        {/* Pending Role Banner (Reassuring flow for adding role) */}
        {pendingRoleBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="auth-alert auth-alert-info"
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              color: '#166534',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.88rem', lineHeight: 1.45, fontWeight: 500 }}>
              {pendingRoleBanner}
            </span>
          </motion.div>
        )}

        {infoMsg && !pendingRoleBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="auth-alert auth-alert-info"
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{infoMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="auth-alert auth-alert-error"
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="auth-field-group">
          <label htmlFor="login-email" className="auth-field-label">
            {t('auth.emailLabel') || 'Email Address'}
          </label>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <Mail size={18} />
            </div>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
              className="auth-input-control"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-field-group">
          <div className="auth-field-header">
            <label htmlFor="login-password" className="auth-field-label">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert(t('auth.forgotPasswordAlert') || 'Password reset instructions will be sent to your email.');
              }}
              className="auth-forgot-link"
            >
              {t('auth.forgotPassword') || 'Forgot password?'}
            </a>
          </div>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <Lock size={18} />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={t('auth.passwordPlaceholder') || '••••••••'}
              className="auth-input-control"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-pwd-toggle"
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{t('auth.signingIn') || 'Signing in...'}</span>
            </>
          ) : (
            <>
              <span>{t('auth.signInBtn') || 'Sign In'}</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Access Row */}
      <div className="auth-demo-section">
        <div className="auth-demo-header">
          <Compass size={14} color="#34d399" />
          <span>{t('auth.quickDemo') || 'Quick Demo Access'}</span>
        </div>
        <div className="auth-demo-grid">
          <button
            type="button"
            onClick={() => {
              setEmail('student@example.com');
              setPassword('password123');
              setErrorMsg('');
            }}
            className="auth-demo-pill"
          >
            <span>{t('auth.studentDemo') || 'Candidate Demo'}</span>
            <ArrowUpRight size={13} color="#64748b" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('institution@example.com');
              setPassword('password123');
              setErrorMsg('');
            }}
            className="auth-demo-pill"
          >
            <span>Institution Demo</span>
            <ArrowUpRight size={13} color="#64748b" />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
