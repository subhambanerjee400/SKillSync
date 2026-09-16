import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import '../pages/Auth.css';

export default function AuthLayout({
  badgeText = 'Intelligence Portal',
  badgeIcon: BadgeIcon = ShieldCheck,
  kicker = 'Skill Alignment Platform',
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkTo,
}) {
  return (
    <div className="auth-page-root">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Top Header: Brand Wordmark + Badge */}
        <div className="auth-card-header">
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

          <div className="auth-portal-badge">
            <BadgeIcon size={13} color="#34d399" />
            <span>{badgeText}</span>
          </div>
        </div>

        {/* Content & Form Container */}
        <div className="auth-form-wrapper">
          {kicker && <span className="auth-kicker">{kicker}</span>}
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
          <span>&copy; {new Date().getFullYear()} SkillSync Inc. All rights reserved.</span>
          <div className="auth-footer-links">
            <a href="#privacy" className="auth-footer-link">Privacy Policy</a>
            <a href="#terms" className="auth-footer-link">Terms of Service</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
