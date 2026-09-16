import React from 'react';
import { Plus, ArrowUpRight, Code, Layers, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

const ICON_THEMES = [
  { icon: Code, bg: '#E0F2FE', color: '#0284C7' },
  { icon: Layers, bg: '#F0FDF4', color: '#16A34A' },
  { icon: Sparkles, bg: '#F3E8FF', color: '#9333EA' },
  { icon: BookOpen, bg: '#FEF3C7', color: '#D97706' },
];

export default function RecommendationPanel({ recommendations = [], notice = null }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #F0F2F5',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Recommended Pathways
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '2px 0 0 0' }}>
            Curated bridge programs aligned to your missing competencies
          </p>
        </div>
        <button
          type="button"
          aria-label="Explore all learning pathways"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid #E5E7EB',
            background: '#F9FAFB',
            color: '#374151',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F3F4F6';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <Plus size={13} />
          <span>Explore</span>
        </button>
      </div>

      {/* Notice Alert Banner (if fallback or notice present) */}
      {notice && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#92400E',
            fontSize: '0.78rem',
            fontWeight: 500,
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} style={{ flexShrink: 0, color: '#D97706' }} />
          <span>{notice}</span>
        </div>
      )}

      {/* Empty State */}
      {(!recommendations || recommendations.length === 0) ? (
        <div
          style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            borderRadius: '12px',
            background: '#F9FAFB',
            border: '1px dashed #E5E7EB',
            color: '#6B7280',
          }}
        >
          <BookOpen size={28} style={{ margin: '0 auto 0.5rem auto', color: '#9CA3AF' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', margin: '0 0 0.25rem 0' }}>
            All competencies verified!
          </p>
          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
            You have acquired all core skills for your role. No immediate bridge courses are required.
          </p>
        </div>
      ) : (
        /* Vertical list of items */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {recommendations.map((rec, idx) => {
            const theme = ICON_THEMES[idx % ICON_THEMES.length];
            const IconComponent = theme.icon;

            return (
              <div
                key={rec.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid #F3F4F6',
                  background: '#FFFFFF',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#F3F4F6';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                {/* Icon & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, paddingRight: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      minWidth: '40px',
                      borderRadius: '12px',
                      background: theme.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent size={18} color={theme.color} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 0.15rem 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={rec.title}
                    >
                      {rec.title}
                    </h4>

                    {rec.subtitle && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#059669',
                          marginBottom: '0.2rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {rec.subtitle}
                      </span>
                    )}

                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#6B7280',
                        margin: 0,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {rec.description}
                    </p>
                  </div>
                </div>

                {/* View/CTA Button */}
                <a
                  href={rec.link || '#'}
                  target={rec.link && rec.link !== '#' ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  aria-label={`Open ${rec.title}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#111827',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    flexShrink: 0,
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0E4A32';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#0E4A32';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <span>{rec.ctaText || 'View'}</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
