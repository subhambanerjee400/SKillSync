import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../lib/profile';
import { getAccountHomePath, getAccountRole } from '../lib/accountRole';
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
  ShieldCheck 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL params for registration message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setInfoMsg('Account created successfully! Sign in to access your dashboard.');
    }
  }, []);

  // If already authenticated, redirect to /dashboard (if profile exists) or /onboarding
  useEffect(() => {
    if (user?.id) {
      if (getAccountRole(user) !== 'user') {
        navigate(getAccountHomePath(user), { replace: true });
        return;
      }
      getUserProfile(user.id).then((profile) => {
        if (profile) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      const authedUser = res?.user || user;
      if (authedUser?.id) {
        if (getAccountRole(authedUser) !== 'user') {
          navigate(getAccountHomePath(authedUser), { replace: true });
          return;
        }
        console.log('[Login] Sign-in successful for user ID:', authedUser.id);
        const profile = await getUserProfile(authedUser.id);
        if (profile && (profile.id || profile.role || profile.name)) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Intelligence Portal"
      badgeIcon={ShieldCheck}
      kicker="Skill Alignment Platform"
      title="Welcome back"
      subtitle="Bridge the curriculum gap with predictive skill intelligence. Sign in to your portal."
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up for SkillSync"
      footerLinkTo="/signup"
    >
      {/* Alert Notifications */}
      <AnimatePresence>
        {infoMsg && (
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
            Email Address
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
              placeholder="student@university.edu"
              className="auth-input-control"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-field-group">
          <div className="auth-field-header">
            <label htmlFor="login-password" className="auth-field-label">
              Password
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link has been dispatched to your institutional inbox (Demo mode).');
              }}
              className="auth-forgot-link"
            >
              Forgot password?
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
              placeholder="••••••••••••"
              className="auth-input-control"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-pwd-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in to Platform</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Access Row */}
      <div className="auth-demo-section">
        <div className="auth-demo-header">
          <Compass size={14} color="#34d399" />
          <span>Quick Demo Access:</span>
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
            <span>🎓 Student Demo</span>
            <ArrowUpRight size={13} color="#64748b" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('industry@example.com');
              setPassword('password123');
              setErrorMsg('');
            }}
            className="auth-demo-pill"
          >
            <span>🏢 Industry Partner</span>
            <ArrowUpRight size={13} color="#64748b" />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
