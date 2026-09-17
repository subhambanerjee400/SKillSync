import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSkillLabel } from '../i18n/skillLabels';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { RECOMMENDATIONS } from '../data/recommendations';
import { TRADE_INSTITUTES } from '../data/demoData';

export default function SkillDetailModal({
  isOpen,
  type, // 'matched' | 'missing'
  onClose,
  analysis,
  role = 'Target Role',
  segment = 'Software',
  userLocation = '',
}) {
  const { t, i18n } = useTranslation();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Find nearest rising skill for role (for legacy/declining pairing advisory)
  const nearestRising = useMemo(() => {
    const required = analysis?.requiredSkills || [];
    const rising = required.filter((s) => s.demandStatus === 'rising');
    return rising.length > 0 ? rising[0].name : 'modern cloud/AI tooling';
  }, [analysis]);

  // Helper to find curated resource for missing skill
  const getResourceForSkill = (skillName) => {
    if (!skillName) return null;
    const normSkill = skillName.trim().toLowerCase();

    // 1. For Trade users, check TRADE_INSTITUTES first
    if (segment === 'Trade') {
      const matchingInstitutes = (TRADE_INSTITUTES || []).filter((inst) =>
        (inst.skillsOffered || []).some(
          (s) =>
            s.toLowerCase() === normSkill ||
            s.toLowerCase().includes(normSkill) ||
            normSkill.includes(s.toLowerCase())
        )
      );

      if (matchingInstitutes.length > 0) {
        const normLoc = (userLocation || '').trim().toLowerCase();
        const cityMatch = normLoc
          ? matchingInstitutes.find(
            (inst) =>
              normLoc.includes(inst.city.toLowerCase()) ||
              inst.city.toLowerCase().includes(normLoc)
          )
          : null;

        const chosen = cityMatch || matchingInstitutes[0];
        return {
          title: chosen.name,
          provider: `${chosen.type} Institute • ${chosen.city}`,
          link: chosen.website,
          isInstitute: true,
        };
      }
    }

    // 2. Check RECOMMENDATIONS
    const matches = (RECOMMENDATIONS || []).filter(
      (r) =>
        r.skill &&
        (r.skill.toLowerCase() === normSkill ||
          r.skill.toLowerCase().includes(normSkill) ||
          normSkill.includes(r.skill.toLowerCase()))
    );

    if (matches.length > 0) {
      const roleMatch = role
        ? matches.find(
          (r) => r.role && r.role.toLowerCase() === role.toLowerCase()
        )
        : null;
      const res = roleMatch || matches[0];
      return {
        title: res.title,
        provider: res.provider,
        link: res.link,
        isInstitute: false,
      };
    }

    return null;
  };

  if (!isOpen) return null;

  // Status Badge Helper
  const renderDemandBadge = (status) => {
    switch (status) {
      case 'rising':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
            }}
          >
            <TrendingUp size={11} />
            <span>{t('modal.statusRising')}</span>
          </span>
        );
      case 'stable':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
            }}
          >
            <span>{t('modal.statusStable')}</span>
          </span>
        );
      case 'declining':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            <span>{t('modal.statusDeclining')}</span>
          </span>
        );
      case 'legacy':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#F3E8FF',
              color: '#6B21A8',
              border: '1px solid #E9D5FF',
            }}
          >
            <span>{t('modal.statusLegacy')}</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: '#F1F5F9',
              color: '#475569',
            }}
          >
            {status || t('modal.statusStandard')}
          </span>
        );
    }
  };

  const isMatchedView = type === 'matched';
  const matchedDetails = analysis?.matchedDetails || [];
  const risingMissing = analysis?.risingMissing || [];
  const stableMissing = analysis?.stableMissing || [];
  const decliningOrLegacyMissing = analysis?.decliningOrLegacyMissing || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          boxSizing: 'border-box',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isMatchedView ? '#F0FDF4' : '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isMatchedView ? '#0E4A32' : '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isMatchedView ? <CheckCircle2 size={20} color="#34D399" /> : <AlertCircle size={20} color="#F59E0B" />}
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {isMatchedView ? t('modal.matchedTitle') : t('modal.missingTitle')}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                {isMatchedView
                  ? t('modal.matchedSubtitle', { count: matchedDetails.length, role })
                  : t('modal.missingSubtitle', { role })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Case 1: Matched Skills View */}
          {isMatchedView ? (
            matchedDetails.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                }}
              >
                {t('modal.noMatchedFound')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matchedDetails.map((item, idx) => {
                  const isDecliningOrLegacy =
                    item.demandStatus === 'legacy' || item.demandStatus === 'declining';

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.9rem 1.1rem',
                        borderRadius: '12px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <span style={{ fontSize: '0.925rem', fontWeight: 700, color: '#1E293B' }}>
                            {getSkillLabel(item.name, i18n.language)}
                          </span>
                        </div>
                        {renderDemandBadge(item.demandStatus)}
                      </div>

                      {/* Advisory note for legacy / declining skills */}
                      {isDecliningOrLegacy && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.45rem',
                            padding: '0.55rem 0.75rem',
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            borderRadius: '8px',
                            fontSize: '0.775rem',
                            color: '#92400E',
                            lineHeight: 1.4,
                          }}
                        >
                          <ShieldAlert size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>
                            {t('modal.advisoryDesc', { rising: getSkillLabel(nearestRising, i18n.language) })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Case 2: Missing Skills View (Grouped into Rising / Stable / Declining or Legacy) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Section 1: Rising Missing Skills (High Priority) */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginBottom: '0.65rem',
                  }}
                >
                  <TrendingUp size={16} color="#059669" />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#065F46', margin: 0 }}>
                    {t('modal.risingGapsHeader')}
                  </h3>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ECFDF5',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {t('modal.skillsCount', { count: risingMissing.length })}
                  </span>
                </div>

                {risingMissing.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.25rem 0', fontStyle: 'italic' }}>
                    {t('modal.risingCovered')}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {risingMissing.map((skillName) => {
                      const res = getResourceForSkill(skillName);
                      return (
                        <div
                          key={skillName}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065F46' }}>
                                {getSkillLabel(skillName, i18n.language)}
                              </span>
                              {renderDemandBadge('rising')}
                            </div>
                            {res && (
                              <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                                {res.provider}
                              </div>
                            )}
                          </div>

                          {res && (
                            <a
                              href={res.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                minHeight: '44px',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: '#0E4A32',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#15803D')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#0E4A32')}
                            >
                              <span>{t('modal.viewResource')}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Stable Missing Skills */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.65rem',
                  }}
                >
                  <BookOpen size={16} color="#2563EB" />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E40AF', margin: 0 }}>
                    {t('modal.stableGapsHeader')}
                  </h3>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#2563EB',
                      background: '#EFF6FF',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {t('modal.skillsCount', { count: stableMissing.length })}
                  </span>
                </div>

                {stableMissing.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.25rem 0', fontStyle: 'italic' }}>
                    {t('modal.stableCovered')}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {stableMissing.map((skillName) => {
                      const res = getResourceForSkill(skillName);
                      return (
                        <div
                          key={skillName}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                                {getSkillLabel(skillName, i18n.language)}
                              </span>
                              {renderDemandBadge('stable')}
                            </div>
                            {res && (
                              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                {res.provider}
                              </div>
                            )}
                          </div>

                          {res && (
                            <a
                              href={res.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                minHeight: '44px',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: '#F1F5F9',
                                color: '#1E293B',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#E2E8F0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#F1F5F9';
                              }}
                            >
                              <span>{t('modal.viewResource')}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 3: Declining or Legacy Missing Skills */}
              {decliningOrLegacyMissing.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <Building2 size={16} color="#64748B" />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#475569', margin: 0 }}>
                      {t('modal.legacyGapsHeader')}
                    </h3>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#64748B',
                        background: '#F1F5F9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {t('modal.skillsCount', { count: decliningOrLegacyMissing.length })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {decliningOrLegacyMissing.map((skillName) => {
                      const res = getResourceForSkill(skillName);
                      return (
                        <div
                          key={skillName}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                                {getSkillLabel(skillName, i18n.language)}
                              </span>
                              {renderDemandBadge('legacy')}
                            </div>
                            {res && (
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                                {res.provider}
                              </div>
                            )}
                          </div>

                          {res && (
                            <a
                              href={res.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                minHeight: '44px',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: '#FFFFFF',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <span>{t('modal.viewResource')}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {t('modal.alignmentMatrix')}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: '44px',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
