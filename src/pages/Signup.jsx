import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../lib/profile';
import { getAccountHomePath, getAccountRole } from '../lib/accountRole';
import {
  USER_ROLES,
  findExistingAccountByEmail,
  savePendingRole,
  normalizeRole,
} from '../lib/userRoles';
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
  UserPlus,
  Building2,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountRole, setAccountRole] = useState(USER_ROLES.JOB_SEEKER);

  // Institution-specific fields
  const [institutionName, setInstitutionName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [reassuranceMsg, setReassuranceMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to role home or /onboarding
  useEffect(() => {
    if (user?.id) {
      if (getAccountRole(user) !== 'job_seeker' && getAccountRole(user) !== 'user') {
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

  const roleLabel = (role) => {
    return normalizeRole(role) === USER_ROLES.INSTITUTION ? 'Training Institution' : 'Job Seeker';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setReassuranceMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      setErrorMsg(t('auth.errFullName') || 'Please enter your full name');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(t('auth.errValidEmail') || 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg(t('auth.errPasswordLength') || 'Password must be at least 6 characters');
      return;
    }

    if (accountRole === USER_ROLES.INSTITUTION && !institutionName.trim()) {
      setErrorMsg('Please enter your Institution Name');
      return;
    }

    setIsSubmitting(true);

    // 1. Check if an account already exists for this email
    const existing = findExistingAccountByEmail(cleanEmail);

    if (existing.exists) {
      const normalizedChosenRole = normalizeRole(accountRole);
      const hasSameRole = existing.roles.some((r) => normalizeRole(r) === normalizedChosenRole);

      if (hasSameRole) {
        // Edge case: Same role registration attempt
        const label = roleLabel(normalizedChosenRole);
        setErrorMsg(`You already have a ${label} account with this email — please log in instead.`);
        setIsSubmitting(false);
        setTimeout(() => {
          navigate(`/login?email=${encodeURIComponent(cleanEmail)}`);
        }, 2200);
        return;
      }

      // Edge case: Different role registration attempt (e.g. job_seeker adding institution)
      const targetLabel = roleLabel(normalizedChosenRole);
      savePendingRole({
        role: normalizedChosenRole,
        email: cleanEmail,
        fullName: fullName.trim(),
        institution_name: institutionName.trim(),
        registration_number: registrationNumber.trim(),
      });

      setIsSubmitting(false);
      setReassuranceMsg(
        `An account with this email already exists. Log in and we'll add the ${targetLabel} role to your account.`
      );
      return;
    }

    // 2. Fresh registration
    try {
      await signup(cleanEmail, password, {
        full_name: fullName.trim(),
        account_role: accountRole,
        institution_name: institutionName.trim(),
        registration_number: registrationNumber.trim(),
      });

      setSuccessMsg(t('auth.accountCreatedSuccess') || 'Account created successfully!');
      setTimeout(() => {
        navigate('/login?registered=true', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('[Signup] Error:', err);
      const rawMsg = err?.message || err?.error_description || err?.msg || err?.error || String(err || '');
      const errorCode = err?.code || '';

      // Check if Supabase detected an existing user during signup
      const isAlreadyRegistered =
        errorCode === 'user_already_exists' ||
        rawMsg.toLowerCase().includes('already registered') ||
        rawMsg.toLowerCase().includes('already in use') ||
        rawMsg.toLowerCase().includes('user already exists') ||
        rawMsg.toLowerCase().includes('email exists');

      if (isAlreadyRegistered) {
        // Absolutely clear any raw error message
        setErrorMsg('');

        const targetLabel = roleLabel(accountRole);
        savePendingRole({
          role: accountRole,
          email: cleanEmail,
          fullName: fullName.trim(),
          institution_name: institutionName.trim(),
          registration_number: registrationNumber.trim(),
        });

        setReassuranceMsg(
          `An account with this email already exists. Log in and we'll add the ${targetLabel} role to your account.`
        );
      } else {
        setErrorMsg(rawMsg || t('auth.errSignupFailed') || 'Registration failed');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText={t('auth.registrationBadge') || 'SkillSync Access'}
      badgeIcon={UserPlus}
      kicker={t('common.tagline') || 'National Readiness Portal'}
      title={t('auth.createAccount') || 'Create Account'}
      subtitle="Register a new account or connect multiple roles under a single verified email."
      footerPrompt={t('auth.haveAccountPrompt') || 'Already have an account?'}
      footerLinkText={t('auth.signInLink') || 'Sign in'}
      footerLinkTo="/login"
    >
      {/* Feedback Alerts */}
      <AnimatePresence>
        {/* Reassuring multi-role prompt */}
        {reassuranceMsg && (
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
              flexDirection: 'column',
              gap: '0.65rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
              <Sparkles size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.88rem', lineHeight: 1.45, fontWeight: 500 }}>
                {reassuranceMsg}
              </span>
            </div>
            <Link
              id="reassurance-login-link"
              to={`/login?pending_role=${accountRole}&email=${encodeURIComponent(email.trim())}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#15803D',
                textDecoration: 'none',
                alignSelf: 'flex-end',
                padding: '0.4rem 0.8rem',
                background: '#DCFCE7',
                border: '1px solid #BBF7D0',
                borderRadius: '6px',
              }}
            >
              <span>Log in to add {roleLabel(accountRole)} role</span>
              <ArrowRight size={14} />
            </Link>
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
        {/* Account Role Dropdown */}
        <div className="auth-field-group">
          <label htmlFor="signup-account-role" className="auth-field-label">
            {t('auth.iamLabel') || 'I am registering as'}
          </label>
          <div className="auth-input-box">
            <div className="auth-input-icon">
              <Briefcase size={18} />
            </div>
            <select
              id="signup-account-role"
              value={accountRole}
              onChange={(e) => {
                setAccountRole(e.target.value);
                if (errorMsg) setErrorMsg('');
                if (reassuranceMsg) setReassuranceMsg('');
              }}
              className="auth-input-control auth-select-control"
            >
              <option value={USER_ROLES.JOB_SEEKER}>
                {t('auth.roleJobSeeker') || 'Job Seeker (Candidate / Trainee)'}
              </option>
              <option value={USER_ROLES.INSTITUTION}>
                {t('auth.roleInstitution') || 'Institution (ITI / Polytechnic / University)'}
              </option>
            </select>
          </div>
        </div>

        {/* Full Name / Representative Name */}
        <div className="auth-field-group">
          <label htmlFor="signup-name" className="auth-field-label">
            {accountRole === USER_ROLES.INSTITUTION ? 'Representative Full Name' : t('auth.fullNameLabel') || 'Full Name'}
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
              placeholder={accountRole === USER_ROLES.INSTITUTION ? 'e.g. Dr. Rajesh Sharma' : t('auth.fullNamePlaceholder') || 'e.g. Subham Banerjee'}
              className="auth-input-control"
            />
          </div>
        </div>

        {/* Institution-Specific Fields */}
        {accountRole === USER_ROLES.INSTITUTION && (
          <>
            <div className="auth-field-group">
              <label htmlFor="signup-institution-name" className="auth-field-label">
                Institution / College Name
              </label>
              <div className="auth-input-box">
                <div className="auth-input-icon">
                  <Building2 size={18} />
                </div>
                <input
                  id="signup-institution-name"
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => {
                    setInstitutionName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. Govt. ITI Tollygunge"
                  className="auth-input-control"
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="signup-reg-number" className="auth-field-label">
                Registration / Accreditation Number (Optional)
              </label>
              <div className="auth-input-box">
                <div className="auth-input-icon">
                  <FileText size={18} />
                </div>
                <input
                  id="signup-reg-number"
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. NCVT/DGET-WB-10492"
                  className="auth-input-control"
                />
              </div>
            </div>
          </>
        )}

        {/* Email Field */}
        <div className="auth-field-group">
          <label htmlFor="signup-email" className="auth-field-label">
            {t('auth.emailLabel') || 'Email Address'}
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
                if (reassuranceMsg) setReassuranceMsg('');
              }}
              placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
              className="auth-input-control"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-field-group">
          <label htmlFor="signup-password" className="auth-field-label">
            {t('auth.passwordMinLabel') || 'Password (min. 6 characters)'}
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

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{t('auth.creatingAccount') || 'Processing...'}</span>
            </>
          ) : (
            <>
              <span>
                {accountRole === USER_ROLES.INSTITUTION
                  ? 'Register Institution Role'
                  : t('auth.createAccountBtn') || 'Create Account'}
              </span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
