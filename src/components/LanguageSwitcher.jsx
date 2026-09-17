import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

const DROPDOWN_WIDTH = 168; // px — must match the width style below

export default function LanguageSwitcher({ variant = 'light', compact = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // 'left' | 'right' — computed on open so the panel never clips the viewport
  const [dropdownSide, setDropdownSide] = useState('right');

  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Determine current active language code (handling e.g. 'mr-IN' -> 'mr')
  const rawLang = i18n.language || 'en';
  const currentCode = rawLang.split('-')[0].toLowerCase();
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  const isDark = variant === 'dark';

  // On every open, decide whether the panel should anchor left or right
  // to stay fully within the viewport on narrow screens.
  const handleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.left; // space to the right of the button's left edge
      const spaceLeft  = rect.right;                    // space to the left of the button's right edge

      // Prefer right-aligned (right:0) if there's enough room on the left side of the button,
      // otherwise left-aligned (left:0) so it opens to the right.
      if (spaceLeft >= DROPDOWN_WIDTH + 8) {
        setDropdownSide('right');
      } else if (spaceRight >= DROPDOWN_WIDTH + 8) {
        setDropdownSide('left');
      } else {
        // Not enough room either way — clamp to whichever side has more space
        setDropdownSide(spaceRight >= spaceLeft ? 'left' : 'right');
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
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

  // Build the horizontal anchor for the dropdown
  const dropdownPositionStyle =
    dropdownSide === 'right'
      ? { right: 0 }   // panel's right edge aligns with button's right edge
      : { left: 0 };   // panel's left edge aligns with button's left edge

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
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
          whiteSpace: 'nowrap',
        }}
      >
        <Globe size={15} color={isDark ? '#34D399' : '#0E4A32'} />
        <span>{currentLang.label}</span>
        <ChevronDown
          size={13}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      {/* Language Menu Dropdown */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...dropdownPositionStyle,
            width: `${DROPDOWN_WIDTH}px`,
            // Clamp so panel never extends beyond the viewport on either side
            maxWidth: 'calc(100vw - 16px)',
            background: isDark ? 'rgba(15, 23, 42, 0.96)' : '#FFFFFF',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #E5E7EB',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            backdropFilter: isDark ? 'blur(16px)' : 'none',
            padding: '0.35rem',
            zIndex: 200,
            // Scrollable if list is long
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'hidden',
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
                  // Prevent text overflow inside the panel
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lang.label}
                </span>
                {isSelected && (
                  <Check
                    size={14}
                    color={isDark ? '#34D399' : '#0E4A32'}
                    style={{ flexShrink: 0, marginLeft: '0.4rem' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
