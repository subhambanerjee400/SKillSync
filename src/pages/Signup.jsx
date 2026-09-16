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
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { user, signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountRole, setAccountRole] = useState('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to role home or /onboarding
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
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(email, password, {
        full_name: fullName.trim(),
        account_role: accountRole,
      });

      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login?registered=true', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('[Signup] Error:', err);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Account Registration"
      badgeIcon={UserPlus}
      kicker="Skill Alignment Platform"
      title="Create Your Account"
      subtitle="Bridge the curriculum gap with predictive skill intelligence. Join SkillSync today."
      footerPrompt="Already have an account?"
      footerLinkText="Sign In"
      footerLinkTo="/login"
    >
      {/* Feedback Alerts */}
      <AnimatePresence>
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

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="auth-alert auth-alert-info"
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Form */}
      <form onSubmit={handleSubmit}>
        {/* Full Name Field */}
        <div className="auth-field-group">
          <label htmlFor="signup-name" className="auth-field-label">
            Full Name
          </label>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <User size={18} />
            </div>
            <input
              id="signup-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Alex Morgan"
              className="auth-input-control"
            />
          </div>
        </div>

        {/* Account Role Dropdown */}
        <div className="auth-field-group">
          <label htmlFor="signup-account-role" className="auth-field-label">
            I am a...
          </label>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <Briefcase size={18} />
            </div>
            <select
              id="signup-account-role"
              value={accountRole}
              onChange={(e) => setAccountRole(e.target.value)}
              className="auth-input-control auth-select-control"
            >
              <option value="user">Job Seeker</option>
              <option value="institution">Training Institution</option>
              <option value="industry">Employer</option>
            </select>
          </div>
        </div>

        {/* Email Field */}
        <div className="auth-field-group">
          <label htmlFor="signup-email" className="auth-field-label">
            Email Address
          </label>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <Mail size={18} />
            </div>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="name@example.com"
              className="auth-input-control"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-field-group">
          <label htmlFor="signup-password" className="auth-field-label">
            Password (min. 6 characters)
          </label>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <Lock size={18} />
            </div>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
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

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
