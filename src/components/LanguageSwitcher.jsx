import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export default function LanguageSwitcher({ variant = 'light', compact = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Determine current active language code (handling e.g. 'mr-IN' -> 'mr')
  const rawLang = i18n.language || 'en';
  const currentCode = rawLang.split('-')[0].toLowerCase();
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  const isDark = variant === 'dark';

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem('i18nextLng', code);
    } catch (e) {
      console.warn('localStorage language persistence error:', e);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? '0.35rem' : '0.45rem',
          padding: compact ? '0.35rem 0.65rem' : '0.45rem 0.8rem',
          borderRadius: '9999px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #E5E7EB',
          background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#1F2937',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 150ms ease',
        }}
      >
        <Globe size={15} color={isDark ? '#34D399' : '#0E4A32'} />
        <span>{currentLang.label}</span>
        <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
      </button>

      {/* Language Menu Dropdown */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '160px',
            background: isDark ? 'rgba(15, 23, 42, 0.96)' : '#FFFFFF',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #E5E7EB',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            backdropFilter: isDark ? 'blur(16px)' : 'none',
            padding: '0.35rem',
            zIndex: 100,
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentCode;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={() => handleSelectLanguage(lang.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.2)'
                      : '#F0FDF4'
                    : 'transparent',
                  color: isSelected
                    ? isDark
                      ? '#34D399'
                      : '#0E4A32'
                    : isDark
                      ? '#E2E8F0'
                      : '#374151',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span>{lang.label}</span>
                {isSelected && <Check size={14} color={isDark ? '#34D399' : '#0E4A32'} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
