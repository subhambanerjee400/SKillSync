import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import '../pages/Auth.css';

export default function AuthLayout({
  badgeText,
  badgeIcon: BadgeIcon = ShieldCheck,
  kicker,
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkTo,
}) {
  const { t } = useTranslation();

  const resolvedBadgeText = badgeText || t('common.intelligencePortal');
  const resolvedKicker = kicker || t('common.tagline');

  return (
    <div className="auth-page-root">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Top Header: Brand Wordmark + Language Switcher + Badge */}
        <div className="auth-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/" className="auth-brand-logo">
            <div className="auth-audio-icon">
              <span className="auth-audio-bar" />
              <span className="auth-audio-bar" />
              <span className="auth-audio-bar" />
              <span className="auth-audio-bar" />
            </div>
            <div className="auth-brand-name">
              Skill<span>Sync</span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LanguageSwitcher variant="dark" compact />
            <div className="auth-portal-badge">
              <BadgeIcon size={13} color="#34d399" />
              <span>{resolvedBadgeText}</span>
            </div>
          </div>
        </div>

        {/* Content & Form Container */}
        <div className="auth-form-wrapper">
          {resolvedKicker && <span className="auth-kicker">{resolvedKicker}</span>}
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}

          {children}

          {footerPrompt && footerLinkTo && (
            <div className="auth-prompt">
              {footerPrompt}{' '}
              <Link to={footerLinkTo} className="auth-link">
                {footerLinkText}
              </Link>
            </div>
          )}
        </div>

        {/* Unified Card Footer */}
        <div className="auth-footer">
          <span>{t('common.allRightsNotice', { year: new Date().getFullYear() })}</span>
          <div className="auth-footer-links">
            <a href="#privacy" className="auth-footer-link">{t('common.privacyPolicy')}</a>
            <a href="#terms" className="auth-footer-link">{t('common.termsOfService')}</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
