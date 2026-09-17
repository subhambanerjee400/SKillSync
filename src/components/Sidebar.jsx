import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, User, LogOut, Sparkles, ArrowRight, ShieldCheck, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Sidebar({
  onLogout,
  activeItem = 'Dashboard',
  onSelectItem,
  isMobile = false,
  isOpen = false,
  onClose,
  userAvatar: propAvatar = null,
}) {
  const { t } = useTranslation();
  const { userAvatar: authAvatar } = useAuth();
  const userAvatar = propAvatar || authAvatar;
  const [current, setCurrent] = useState(activeItem);

  const handleSelect = (item) => {
    setCurrent(item);
    if (onSelectItem) onSelectItem(item);
    if (isMobile && onClose) onClose();
  };

  const handleLogoutClick = () => {
    if (isMobile && onClose) onClose();
    if (onLogout) onLogout();
  };

  return (
    <aside
      className={isMobile ? `dashboard-sidebar mobile-sidebar-drawer ${isOpen ? 'open' : ''}` : 'dashboard-sidebar'}
      style={{
        width: isMobile ? '280px' : '240px',
        minWidth: isMobile ? 'auto' : '240px',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.75rem 1.25rem',
        minHeight: isMobile ? '100%' : '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Top Logo & Navigation */}
      <div>
        {/* Brand Logo with optional Close button on mobile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '0.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#0E4A32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(14, 74, 50, 0.25)',
              }}
            >
              <Sparkles size={20} color="#34D399" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Skill<span style={{ color: '#0E4A32' }}>Sync</span>
            </span>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('nav.closeDrawer')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Section: MENU */}
        <div style={{ marginBottom: '2rem' }}>
          <span
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            {t('nav.menu')}
          </span>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {/* Dashboard Nav Item */}
            <button
              type="button"
              onClick={() => handleSelect('Dashboard')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                background: current === 'Dashboard' ? '#F0FDF4' : 'transparent',
                color: current === 'Dashboard' ? '#0E4A32' : '#64748B',
                fontWeight: current === 'Dashboard' ? 700 : 500,
                fontSize: '0.9rem',
                position: 'relative',
                transition: 'all 150ms ease',
                textAlign: 'left',
              }}
            >
              {current === 'Dashboard' && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3.5px',
                    height: '20px',
                    borderRadius: '0 4px 4px 0',
                    background: '#0E4A32',
                  }}
                />
              )}
              <LayoutDashboard size={18} color={current === 'Dashboard' ? '#0E4A32' : '#64748B'} />
              <span>{t('nav.dashboard')}</span>
            </button>

            {/* Profile Nav Item */}
            <button
              type="button"
              onClick={() => handleSelect('Profile')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                background: current === 'Profile' ? '#F0FDF4' : 'transparent',
                color: current === 'Profile' ? '#0E4A32' : '#64748B',
                fontWeight: current === 'Profile' ? 700 : 500,
                fontSize: '0.9rem',
                position: 'relative',
                transition: 'all 150ms ease',
                textAlign: 'left',
              }}
            >
              {current === 'Profile' && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3.5px',
                    height: '20px',
                    borderRadius: '0 4px 4px 0',
                    background: '#0E4A32',
                  }}
                />
              )}
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: current === 'Profile' ? '1.5px solid #0E4A32' : '1px solid #CBD5E1',
                  }}
                />
              ) : (
                <User size={18} color={current === 'Profile' ? '#0E4A32' : '#64748B'} />
              )}
              <span>{t('nav.profile')}</span>
            </button>
          </nav>
        </div>

        {/* Section: GENERAL */}
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            {t('nav.general')}
          </span>

          <button
            type="button"
            onClick={handleLogoutClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '10px',
              background: 'transparent',
              color: '#64748B',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 150ms ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.background = '#FEF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748B';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>

        {/* Section: LANGUAGE */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            {t('nav.language')}
          </span>
          <LanguageSwitcher variant="light" />
        </div>
      </div>

      {/* Bottom Promo Card (Donezo style) */}
      <div
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #0A3725 0%, #0E4A32 100%)',
          padding: '1.25rem',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -4px rgba(14, 74, 50, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <ShieldCheck size={16} color="#34D399" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('nav.proTitle')}
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#E2E8F0', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
          {t('nav.proDesc')}
        </p>
        <button
          type="button"
          style={{
            width: '100%',
            padding: '0.45rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
        >
          <span>{t('nav.explorePro')}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </aside>
  );
}
