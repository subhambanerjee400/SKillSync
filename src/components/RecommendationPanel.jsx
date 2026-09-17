import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ArrowUpRight, Code, Layers, Sparkles, BookOpen, ExternalLink, Building2, Globe, Info } from 'lucide-react';

const ICON_THEMES = [
  { icon: Code, bg: '#E0F2FE', color: '#0284C7' },
  { icon: Layers, bg: '#F0FDF4', color: '#16A34A' },
  { icon: Sparkles, bg: '#F3E8FF', color: '#9333EA' },
  { icon: BookOpen, bg: '#FEF3C7', color: '#D97706' },
];

export default function RecommendationPanel({
  recommendations = [],
  notice = null,
  disclaimer = null,
  govtPortals = [],
}) {
  const { t } = useTranslation();

  // Separate training institutes from government skill portals
  const portalItems =
    govtPortals && govtPortals.length > 0
      ? govtPortals
      : (recommendations || []).filter((r) => r.type === 'Govt. Portal');

  const instituteItems = (recommendations || []).filter((r) => r.type !== 'Govt. Portal');
  const hasAnyItems = instituteItems.length > 0 || portalItems.length > 0;

  // Check if disclaimer should be displayed (if explicit, or if any govt ITI or portal is present)
  const showDisclaimer =
    Boolean(disclaimer) ||
    portalItems.length > 0 ||
    instituteItems.some((r) => r.type === 'Government ITI' || r.type === 'Government');

  const disclaimerMessage =
    disclaimer ||
    'Seat availability, addresses and contact details may change yearly — please verify on the official ITI portal before applying.';

  return (
    <div
      className="recommendation-panel-card"
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #F0F2F5',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        minHeight: 'fit-content',
        boxSizing: 'border-box',
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
      {!hasAnyItems ? (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {/* Vertical list of Training Institutes */}
          {instituteItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%' }}>
              {instituteItems.map((rec, idx) => {
                const theme = ICON_THEMES[idx % ICON_THEMES.length];
                const IconComponent = theme.icon;
                const isGovt = rec.type === 'Government ITI' || rec.type === 'Government';

                return (
                  <div
                    key={rec.id || idx}
                    className="recommendation-item-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '1rem 1.15rem',
                      borderRadius: '14px',
                      border: '1px solid #F3F4F6',
                      background: '#FFFFFF',
                      height: 'auto',
                      minHeight: 'fit-content',
                      boxSizing: 'border-box',
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
                    {/* Icon & Text — grows to fill available space */}
                    <div
                      className="recommendation-content-wrapper"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        flex: '1 1 0',
                        minWidth: '0',
                        maxWidth: '100%',
                      }}
                    >
                      {/* Coloured icon */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '10px',
                          background: theme.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <IconComponent size={18} color={theme.color} />
                      </div>

                      {/* Text block */}
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Title */}
                        <h4
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 0.25rem 0',
                            lineHeight: 1.45,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={rec.title}
                        >
                          {rec.title}
                        </h4>

                        {/* Type badge + Subtitle */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.35rem',
                          }}
                        >
                          {rec.type && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.12rem 0.5rem',
                                borderRadius: '9999px',
                                background: isGovt ? '#ECFDF5' : '#EFF6FF',
                                color: isGovt ? '#065F46' : '#1D4ED8',
                                border: isGovt ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
                              }}
                            >
                              {rec.type}
                            </span>
                          )}
                          {rec.subtitle && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                color: '#059669',
                                lineHeight: 1.45,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={rec.subtitle}
                            >
                              {rec.subtitle}
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: '#6B7280',
                            margin: 0,
                            lineHeight: 1.5,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {rec.description}
                        </p>
                      </div>
                    </div>

                    {/* CTA button */}
                    <a
                      href={rec.link || '#'}
                      target={rec.link && rec.link !== '#' ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      aria-label={`Open ${rec.title}`}
                      className="recommendation-cta-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                        width: 'max-content',
                        maxWidth: '100%',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        color: '#111827',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'all 150ms ease',
                        boxSizing: 'border-box',
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
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Government Skill Portals (listed separately as "Govt. Portals", not institutes) */}
          {portalItems.length > 0 && (
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #F0F2F5',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={16} color="#0E4A32" />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Govt. Portals
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#065F46',
                    background: '#ECFDF5',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  Official WB & National Portals
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 0.5rem 0' }}>
                Official government skill portals, centralized ITI admissions, and subsidized vocational schemes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                {portalItems.map((portal, idx) => (
                  <div
                    key={portal.id || idx}
                    className="recommendation-item-card recommendation-portal-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.9rem 1.15rem',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      height: 'auto',
                      minHeight: 'fit-content',
                      boxSizing: 'border-box',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.background = '#F1F5F9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#F8FAFC';
                    }}
                  >
                    <div
                      className="recommendation-content-wrapper"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        flex: '1 1 0',
                        minWidth: '0',
                        maxWidth: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          minWidth: '38px',
                          borderRadius: '10px',
                          background: '#ECFDF5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Globe size={18} color="#0E4A32" />
                      </div>

                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 0.2rem 0',
                            lineHeight: 1.4,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                          title={portal.title}
                        >
                          {portal.title}
                        </h4>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.3rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.67rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '9999px',
                              background: '#ECFDF5',
                              color: '#065F46',
                              border: '1px solid #A7F3D0',
                            }}
                          >
                            Govt. Portal
                          </span>
                          {portal.relevanceTag && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: '#059669',
                              }}
                            >
                              {portal.relevanceTag}
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            fontSize: '0.78rem',
                            color: '#64748B',
                            margin: 0,
                            lineHeight: 1.45,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {portal.description}
                        </p>
                      </div>
                    </div>

                    <a
                      href={portal.link || portal.website || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${portal.title}`}
                      className="recommendation-cta-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                        width: 'max-content',
                        maxWidth: '100%',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '9999px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#0E4A32',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'all 150ms ease',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0E4A32';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#0E4A32';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.color = '#0E4A32';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                      }}
                    >
                      <span>{portal.ctaText || 'Visit Official Website'}</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Note / Disclaimer */}
          {showDisclaimer && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem 0.95rem',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              <Info size={15} style={{ color: '#64748B', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Note: </span>
                {disclaimerMessage}{' '}
                <a
                  href="https://iti.wb.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#0E4A32',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  iti.wb.gov.in
                  <ExternalLink size={11} />
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
