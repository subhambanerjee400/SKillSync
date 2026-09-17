import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ArrowUpRight, Code, Layers, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

const ICON_THEMES = [
  { icon: Code, bg: '#E0F2FE', color: '#0284C7' },
  { icon: Layers, bg: '#F0FDF4', color: '#16A34A' },
  { icon: Sparkles, bg: '#F3E8FF', color: '#9333EA' },
  { icon: BookOpen, bg: '#FEF3C7', color: '#D97706' },
];

export default function RecommendationPanel({ recommendations = [], notice = null }) {
  const { t } = useTranslation();

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
            {t('recommendations.title')}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '2px 0 0 0' }}>
            {t('recommendations.subtitle')}
          </p>
        </div>
        <button
          type="button"
          aria-label={t('recommendations.explore')}
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
          <span>{t('recommendations.explore')}</span>
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
            {t('recommendations.allVerified')}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
            {t('recommendations.allVerifiedDesc')}
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
                  /* Allow button to wrap below the text row on narrow screens */
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid #F3F4F6',
                  background: '#FFFFFF',
                  transition: 'all 150ms ease',
                  boxSizing: 'border-box',
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
                {/* Icon & Text — grows to fill the row, min-width:0 prevents flex blowout */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    flex: '1 1 0',      /* grow & shrink; basis 0 so it shares space fairly */
                    minWidth: '0',      /* essential: lets flex child shrink below its content size */
                  }}
                >
                  {/* Coloured icon */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      minWidth: '38px',
                      borderRadius: '10px',
                      background: theme.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                  >
                    <IconComponent size={17} color={theme.color} />
                  </div>

                  {/* Text block — must have minWidth:0 to allow text to truncate/wrap */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {/* Title: single-line ellipsis with full text on hover via title attr */}
                    <h4
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 0.15rem 0',
                        /* Allow wrapping up to 2 lines before ellipsis */
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                      }}
                      title={rec.title}
                    >
                      {rec.title}
                    </h4>

                    {rec.subtitle && (
                      <span
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#059669',
                          marginBottom: '0.25rem',
                          lineHeight: 1.3,
                        }}
                        title={rec.subtitle}
                      >
                        {rec.subtitle}
                      </span>
                    )}

                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#6B7280',
                        margin: 0,
                        lineHeight: 1.4,
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

                {/* CTA button — flexShrink:0 on desktop, but wraps to its own full-width
                    row when the container is too narrow (flexWrap:wrap above). */}
                <a
                  href={rec.link || '#'}
                  target={rec.link && rec.link !== '#' ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  aria-label={`Open ${rec.title}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    /* On wide screens: compact pill. On narrow screens (when wrapped):
                       stretch to full width so it's easy to tap. */
                    flex: '0 0 auto',
                    width: 'max-content',
                    maxWidth: '100%',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '9999px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#111827',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
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
                  <span>{rec.ctaText || t('recommendations.viewBtn')}</span>
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
