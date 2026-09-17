import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import { getAvatarUrl } from '../data/avatars';
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  GraduationCap,
  Building2,
  Briefcase,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role, switchRole, logout, userName, userAvatar } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleConfig = {
    student: { label: t('nav.studentView'), icon: GraduationCap, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' },
    institute: { label: t('nav.instituteView'), icon: Building2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    industry: { label: t('nav.industryView'), icon: Briefcase, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)' },
  };

  const currentRoleInfo = roleConfig[role] || roleConfig.student;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
      }}
    >
      {/* Left: Mobile Toggle & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
          aria-label={t('nav.toggleNavigation')}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8FAFC' }}>
            Skill<span className="text-gradient">Sync</span>
          </span>
        </div>
      </div>

      {/* Center: Universal Search (Desktop) */}
      <div
        style={{
          position: 'relative',
          width: '320px',
          maxWidth: '100%',
        }}
        className="hide-mobile"
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder={t('nav.searchPlaceholder')}
          style={{
            width: '100%',
            padding: '0.5rem 1rem 0.5rem 2.25rem',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Language Switcher */}
        <LanguageSwitcher variant="dark" compact />

        {/* Quick Role Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: currentRoleInfo.bg,
              border: `1px solid ${currentRoleInfo.color}40`,
              color: currentRoleInfo.color,
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <RoleIcon size={15} />
            <span>{currentRoleInfo.label}</span>
            <ChevronDown size={14} />
          </button>

          {showRoleDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(16px)',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                {t('nav.instantRoleSwitcher')}
              </div>
              {[
                { r: 'student', label: t('nav.studentPortal'), icon: GraduationCap, color: '#6366F1' },
                { r: 'institute', label: t('nav.institutePortal'), icon: Building2, color: '#10B981' },
                { r: 'industry', label: t('nav.industryPortal'), icon: Briefcase, color: '#06B6D4' },
              ].map(({ r, label, icon: ItemIcon, color }) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: role === r ? color : 'var(--text-secondary)',
                    background: role === r ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                  }}
                >
                  <ItemIcon size={16} color={color} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '7px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#06B6D4',
                boxShadow: '0 0 6px #06B6D4',
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '300px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(16px)',
                zIndex: 50,
              }}
            >
              <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {t('nav.recentAlerts')}
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <span style={{ fontWeight: 700, color: '#A5B4FC' }}>New Skill Match!</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Nova Systems posted a Junior AI Engineer role (92% match).</p>
                </div>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>Curriculum Update</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Docker & Kubernetes added to elective choices for Semester 6.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '2px 6px 2px 2px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', paddingRight: '4px' }}>
              {userName.split(' ')[0]}
            </span>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '230px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(16px)',
                zIndex: 50,
              }}
            >
              <div style={{ paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {userName}
                </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: currentRoleInfo.color,
                      }}
                    >
                      {user?.institute || user?.company || user?.org_name || user?.role || t('nav.member')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/edit-profile');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      justifyContent: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: '0.25rem',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={15} />
                    <span>{t('nav.profile')}</span>
                  </button>

                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: '#FB7185',
                      borderRadius: 'var(--radius-sm)',
                      justifyContent: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </div>
              )}
            </div>
      </div>
    </header>
  );
}
