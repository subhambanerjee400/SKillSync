import React from 'react';
import { ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SkillGapPanel({
  matchedSkills = [],
  missingSkills = [],
  onOpenMatched,
  onOpenMissing,
}) {
  return (
    <div
      className="skill-gap-grid"
    >
      {/* Stat Card 1: Matched Skills (Donezo dark-green primary card style) */}
      <div
        style={{
          background: '#0E4A32',
          borderRadius: '20px',
          padding: 'clamp(1.15rem, 3vw, 1.5rem)',
          color: '#FFFFFF',
          boxShadow: '0 4px 20px -2px rgba(14, 74, 50, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E2E8F0' }}>
              Matched Skills
            </span>
            <button
              type="button"
              onClick={onOpenMatched}
              aria-label="View matched skills details"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '50%',
                background: '#FFFFFF',
                color: '#0E4A32',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.background = '#F0FDF4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>

          {/* Large Stat Number */}
          <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            {matchedSkills.length}
          </div>

          {/* Indicator Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6EE7B7',
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
              }}
            >
              <CheckCircle2 size={12} />
              <span>Verified alignment</span>
            </span>
          </div>
        </div>

        {/* Skill Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', minWidth: 0, maxWidth: '100%' }}>
          {matchedSkills.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontStyle: 'italic' }}>
              No matched skills recorded yet. Complete your onboarding skills checklist.
            </p>
          ) : (
            matchedSkills.map((skill, i) => (
              <span
                key={i}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  color: '#F8FAFC',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ width: '5px', height: '5px', minWidth: '5px', borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{skill}</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Stat Card 2: Missing Skills (Donezo white stat card style) */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: 'clamp(1.15rem, 3vw, 1.5rem)',
          border: '1px solid #F0F2F5',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6B7280' }}>
              Missing Skills
            </span>
            <button
              type="button"
              onClick={onOpenMissing}
              aria-label="View missing skills details"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '50%',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#F9FAFB';
              }}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>

          {/* Large Stat Number */}
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            {missingSkills.length}
          </div>

          {/* Indicator Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: missingSkills.length === 0 ? '#059669' : '#DC2626',
                background: missingSkills.length === 0 ? '#ECFDF5' : '#FEF2F2',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: missingSkills.length === 0 ? '1px solid #A7F3D0' : '1px solid #FEE2E2',
              }}
            >
              {missingSkills.length === 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              <span>{missingSkills.length === 0 ? 'Fully aligned' : 'Target gaps to bridge'}</span>
            </span>
          </div>
        </div>

        {/* Skill Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6', minWidth: 0, maxWidth: '100%' }}>
          {missingSkills.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#059669', margin: 0, fontWeight: 600 }}>
              🎉 Zero skill gaps! You meet 100% of the core competencies for this role.
            </p>
          ) : (
            missingSkills.map((skill, i) => (
              <span
                key={i}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  color: '#374151',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ width: '5px', height: '5px', minWidth: '5px', borderRadius: '50%', background: '#FB7185', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-word' }}>{skill}</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
