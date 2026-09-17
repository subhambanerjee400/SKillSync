import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES, normalizeRole, addUserRole } from '../lib/userRoles';
import { Building2, User, Briefcase, ChevronDown, Check } from 'lucide-react';

const ALL_SYSTEM_ROLES = [
  USER_ROLES.JOB_SEEKER,
  USER_ROLES.INSTITUTION,
  USER_ROLES.INDUSTRY_PARTNER,
];

export default function RoleSwitcher({ variant = 'light' }) {
  const { user, userRoles, activeRole, switchActiveRole, refreshUserRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Determine current effective role
  const isInstitutionPage = location.pathname.includes('/institution');
  const isIndustryPage = location.pathname.includes('/industry');
  const currentRole = isInstitutionPage
    ? USER_ROLES.INSTITUTION
    : isIndustryPage
    ? USER_ROLES.INDUSTRY_PARTNER
    : (normalizeRole(activeRole) || USER_ROLES.JOB_SEEKER);

  const handleSelectRole = async (targetRole) => {
    setIsOpen(false);
    switchActiveRole(targetRole);

    // Ensure user possesses target role in multi-role system so route guard permits navigation
    if (user?.id) {
      try {
        const hasRole = userRoles?.some((r) => normalizeRole(r) === targetRole);
        if (!hasRole) {
          await addUserRole(user.id, targetRole);
          if (refreshUserRoles) {
            await refreshUserRoles(user.id);
          }
        }
      } catch (e) {
        console.warn('Auto-granting role in switcher:', e);
      }
    }

    if (targetRole === USER_ROLES.INSTITUTION) {
      navigate('/institution-dashboard');
    } else if (targetRole === USER_ROLES.INDUSTRY_PARTNER) {
      navigate('/industry-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const isDark = variant === 'dark';
  const roleConfig = {
    [USER_ROLES.JOB_SEEKER]: {
      label: 'Job Seeker',
      sublabel: 'Skills & Pathways',
      icon: User,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    [USER_ROLES.INSTITUTION]: {
      label: 'Institution',
      sublabel: 'Curriculum & Analytics',
      icon: Building2,
      color: '#0284C7',
      bg: '#E0F2FE',
    },
    [USER_ROLES.INDUSTRY_PARTNER]: {
      label: 'Industry Partner',
      sublabel: 'Demand & Hiring Insights',
      icon: Briefcase,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
  };

  const currentConfig = roleConfig[currentRole] || roleConfig[USER_ROLES.JOB_SEEKER];
  const CurrentIcon = currentConfig.icon;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Switch account workspace role"
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.65rem 0.35rem 0.45rem',
          background: isDark ? '#1e293b' : '#FFFFFF',
          border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
          borderRadius: '9999px',
          color: isDark ? '#F1F5F9' : '#1F2937',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#10B981';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = isDark ? '#334155' : '#E5E7EB';
          }
        }}
      >
        <span
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: currentConfig.bg,
            color: currentConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CurrentIcon size={14} />
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>{currentConfig.label}</span>
        <ChevronDown
          size={14}
          color={isDark ? '#94A3B8' : '#6B7280'}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '215px',
            maxWidth: 'calc(100vw - 1.5rem)',
            background: isDark ? '#0f172a' : '#FFFFFF',
            border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '0.4rem',
            zIndex: 1000,
            animation: 'fadeIn 120ms ease-out',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              padding: '0.35rem 0.5rem 0.4rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isDark ? '#94A3B8' : '#9CA3AF',
              borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
              marginBottom: '0.3rem',
            }}
          >
            Switch Workspace Role
          </div>

          {ALL_SYSTEM_ROLES.map((r) => {
            const normalized = normalizeRole(r);
            const cfg = roleConfig[normalized];
            if (!cfg) return null;
            const ItemIcon = cfg.icon;
            const isSelected = normalized === currentRole;

            return (
              <button
                key={normalized}
                type="button"
                role="menuitem"
                onClick={() => handleSelectRole(normalized)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                  padding: '0.5rem 0.6rem',
                  background: isSelected
                    ? isDark
                      ? '#1e293b'
                      : '#F0FDF4'
                    : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: isDark ? '#F1F5F9' : '#111827',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = isDark ? '#1e293b' : '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: cfg.bg,
                      color: cfg.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ItemIcon size={16} />
                  </span>
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{cfg.label}</div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                      {cfg.sublabel}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Check size={16} color="#10B981" style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
