import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSkillLabel } from '../i18n/skillLabels';
import { getAvatarUrl } from '../data/avatars';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../lib/profile';
import { getUserSkillGapAnalysis, saveScoreIfChanged, calculateScore } from '../lib/scoring';
import { getRequiredSkillsForRole } from '../data/demoData';
import {
  generateCourseRecommendations,
  generateTradeRecommendations,
} from '../lib/recommendations';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';
import SkillGapPanel from '../components/SkillGapPanel';
import ScoreSimulator from '../components/ScoreSimulator';
import SkillRoadmap from '../components/SkillRoadmap';
import RecommendationPanel from '../components/RecommendationPanel';
import SkillDetailModal from '../components/SkillDetailModal';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { generateRoadmap } from '../lib/roadmap';
import { Search, Bell, Mail, Plus, LogOut, Download, Loader2, Sparkles, Menu, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, profile: sharedProfile, userName, userAvatar } = useAuth();
  const [profile, setProfile] = useState(sharedProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [govtPortals, setGovtPortals] = useState([]);
  const [recNotice, setRecNotice] = useState(null);
  const [recDisclaimer, setRecDisclaimer] = useState(null);
  const [activeSkillModal, setActiveSkillModal] = useState(null); // 'matched' | 'missing' | null
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeHeaderPopover, setActiveHeaderPopover] = useState(null); // 'mail' | 'notifications' | null

  // Dismiss header popovers on outside click
  useEffect(() => {
    if (!activeHeaderPopover) return;
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.header-popover-container')) {
        setActiveHeaderPopover(null);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [activeHeaderPopover]);

  const effectiveProfile = sharedProfile || profile;

  const roadmapSteps = useMemo(() => {
    if (!analysis) return [];
    return generateRoadmap(
      analysis.matchedSkills || [],
      analysis.missingSkills || [],
      analysis.requiredSkills || []
    );
  }, [analysis]);

  // Fetch profile, calculate live score, and generate recommendations with timeout protection
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      if (user === null) {
        setIsLoading(false);
      }
      return;
    }

    let isMounted = true;

    // Helper to enforce hard timeout on async operations
    const withTimeout = (promise, ms = 8000, errorMsg = 'Request timed out') => {
      let timer;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(errorMsg)), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
    };

    async function loadDashboardData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        // 1. Resolve user profile: check shared context first, then localStorage, then direct fetch
        let activeProf = sharedProfile;
        if (!activeProf) {
          try {
            const cached = localStorage.getItem(`skillsync_profile_${userId}`);
            if (cached) activeProf = JSON.parse(cached);
          } catch (e) {}
        }

        if (!activeProf) {
          try {
            activeProf = await withTimeout(
              getUserProfile(userId),
              6000,
              'Profile request timed out after 6s'
            );
          } catch (profileErr) {
            console.warn('Direct profile fetch warning:', profileErr.message);
          }
        }

        if (!isMounted) return;

        if (!activeProf) {
          setIsLoading(false);
          navigate('/onboarding', { replace: true });
          return;
        }

        setProfile(activeProf);

        // 2. Fetch deterministic skill gap analysis with timeout protection, passing activeProf
        let result = null;
        try {
          result = await withTimeout(
            getUserSkillGapAnalysis(userId, activeProf),
            8000,
            'Skill gap analysis request timed out after 8s'
          );
        } catch (analysisErr) {
          console.warn('Skill gap analysis live fetch error (falling back to cached calculation):', analysisErr.message);

          // Graceful degradation: compute score locally from cached skills
          const cachedSkills = (() => {
            try {
              const str = localStorage.getItem(`skillsync_skills_${userId}`);
              return str ? JSON.parse(str) : [];
            } catch (e) {
              return [];
            }
          })();

          const targetRole = activeProf.role || 'Frontend Developer';
          const required = getRequiredSkillsForRole(targetRole);
          const scoringResult = calculateScore(cachedSkills, required);

          result = {
            profile: activeProf,
            role: targetRole,
            segment: activeProf.segment || 'Software',
            userSkills: cachedSkills,
            requiredSkills: required,
            ...scoringResult,
          };

          setLoadError(
            analysisErr.message?.toLowerCase().includes('timed out')
              ? t('dashboard.timeoutNotice', {
                  defaultValue: 'Live database connection timed out after 8s. Showing cached offline data.',
                })
              : t('dashboard.offlineNotice', {
                  defaultValue: 'Database connection issue. Showing cached offline data.',
                })
          );
        }

        if (!isMounted) return;

        if (result) {
          setAnalysis(result);

          // Save score to history if changed (non-blocking)
          saveScoreIfChanged(userId, result.score).catch((err) =>
            console.warn('Score history save error:', err)
          );

          // Generate tailored recommendations based on segment
          if (activeProf.segment === 'Trade') {
            const tradeResult = generateTradeRecommendations(result.missingSkills, activeProf);
            setRecommendations(tradeResult.recommendations || []);
            setGovtPortals(tradeResult.govtPortals || []);
            setRecNotice(tradeResult.notice || null);
            setRecDisclaimer(tradeResult.disclaimer || null);
          } else {
            const courseResult = generateCourseRecommendations(
              result.missingSkills,
              result.risingMissing,
              activeProf.role
            );
            setRecommendations(courseResult || []);
            setGovtPortals([]);
            setRecNotice(null);
            setRecDisclaimer(null);
          }
        } else {
          setLoadError(
            t('dashboard.failedToAnalyze', {
              defaultValue: 'Unable to load skill readiness analysis. Please check connection and try again.',
            })
          );
        }
      } catch (err) {
        console.error('Dashboard data load error:', err);
        if (isMounted) {
          setLoadError(
            err.message ||
              t('dashboard.genericError', {
                defaultValue: 'Failed to load readiness data. Connection timed out or server unavailable.',
              })
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, retryCount]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userEmail = user?.email || 'user@example.com';

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#F4F6F8',
          gap: '1rem',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#0E4A32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px -4px rgba(14, 74, 50, 0.3)',
          }}
        >
          <Loader2 size={28} className="animate-spin" color="#34D399" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            {t('dashboard.loadingTitle')}
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', margin: '4px 0 0 0' }}>
            {t('dashboard.loadingSubtitle')}
          </p>
        </div>
      </div>
    );
  }

  // Dedicated Error Screen if loading failed completely and no analysis could be computed
  if (!isLoading && loadError && !analysis) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#F4F6F8',
          padding: '1.5rem',
          gap: '1.25rem',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.25)',
          }}
        >
          <AlertTriangle size={30} color="#DC2626" />
        </div>
        <div style={{ textAlign: 'center', maxWidth: '440px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
            {t('dashboard.connectionErrorTitle', { defaultValue: 'Connection Timeout' })}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
            {loadError}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: '#0E4A32',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(14, 74, 50, 0.25)',
            }}
          >
            <RefreshCw size={16} />
            {t('common.retry', { defaultValue: 'Retry Connection' })}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            {t('common.logout', { defaultValue: 'Sign Out' })}
          </button>
        </div>
      </div>
    );
  }

  // Live scoring data
  const liveScore = analysis?.score ?? 0;
  const liveLabel = profile?.role
    ? `${profile.role} ${t('dashboard.readinessIndex')}`
    : t('dashboard.readinessIndex');

  const filterQuery = searchQuery.trim().toLowerCase();
  const rawMatchedSkills = analysis?.matchedSkills || [];
  const rawMissingSkills = analysis?.missingSkills || [];

  const matchedSkills = filterQuery
    ? rawMatchedSkills.filter((s) => {
        const canonical = s.toLowerCase();
        const translated = getSkillLabel(s, i18n.language).toLowerCase();
        return canonical.includes(filterQuery) || translated.includes(filterQuery);
      })
    : rawMatchedSkills;

  const missingSkills = filterQuery
    ? rawMissingSkills.filter((s) => {
        const canonical = s.toLowerCase();
        const translated = getSkillLabel(s, i18n.language).toLowerCase();
        return canonical.includes(filterQuery) || translated.includes(filterQuery);
      })
    : rawMissingSkills;

  const filteredRecommendations = filterQuery
    ? recommendations.filter((r) => {
        const matchTitle = r.title?.toLowerCase().includes(filterQuery);
        const matchDesc = r.description?.toLowerCase().includes(filterQuery);
        const matchCovered =
          r.skillsCovered &&
          r.skillsCovered.some(
            (s) =>
              s.toLowerCase().includes(filterQuery) ||
              getSkillLabel(s, i18n.language).toLowerCase().includes(filterQuery)
          );
        const matchOffered =
          r.skillsOffered &&
          r.skillsOffered.some(
            (s) =>
              s.toLowerCase().includes(filterQuery) ||
              getSkillLabel(s, i18n.language).toLowerCase().includes(filterQuery)
          );
        return matchTitle || matchDesc || matchCovered || matchOffered;
      })
    : recommendations;

  const filteredGovtPortals = filterQuery
    ? govtPortals.filter((p) => {
        const matchTitle = p.title?.toLowerCase().includes(filterQuery);
        const matchDesc = p.description?.toLowerCase().includes(filterQuery);
        const matchTag = p.relevanceTag?.toLowerCase().includes(filterQuery);
        return matchTitle || matchDesc || matchTag;
      })
    : govtPortals;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F4F6F8',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#111827',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Left Sidebar (Desktop Static) */}
      <Sidebar
        onLogout={handleLogout}
        userAvatar={userAvatar}
        onSelectItem={(item) => {
          if (item === 'Profile') navigate('/edit-profile');
        }}
      />

      {/* 1b. Mobile Sidebar Drawer & Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <Sidebar
        isMobile={true}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        userAvatar={userAvatar}
        onSelectItem={(item) => {
          if (item === 'Profile') navigate('/edit-profile');
        }}
      />

      {/* 2. Main Content Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Top Bar (Donezo search bar, notifications, user profile) */}
        <header
          className="dashboard-header"
          style={{
            height: '76px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Left: Mobile Hamburger & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '420px', minWidth: 0, marginRight: '0.75rem' }}>
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label={t('nav.toggleNavigation')}
              className="show-tablet-mobile"
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                color: '#111827',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '0.65rem',
                flexShrink: 0,
              }}
            >
              <Menu size={20} />
            </button>

            {/* Search Bar with ⌘F Badge */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '360px',
                minWidth: 0,
              }}
            >
              <Search
                size={17}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                }}
              />
              <input
                type="text"
                aria-label={t('dashboard.searchPlaceholder')}
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 3rem 0.6rem 2.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  fontSize: '0.85rem',
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 150ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.borderColor = '#0E4A32';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 74, 50, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#F9FAFB';
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span
                className="hide-mobile"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#9CA3AF',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                ⌘F
              </span>
            </div>
          </div>

          {/* Right Header Elements: LanguageSwitcher, Mail, Bell, Profile, Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            {/* Language Switcher */}
            <LanguageSwitcher variant="light" compact />

            {/* Mail Icon Button & Dropdown */}
            <div className="header-popover-container hide-mobile" style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Messages"
                title="Messages coming soon"
                onClick={() => setActiveHeaderPopover((prev) => (prev === 'mail' ? null : 'mail'))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: activeHeaderPopover === 'mail' ? '#F3F4F6' : '#FFFFFF',
                  border: activeHeaderPopover === 'mail' ? '1px solid #10B981' : '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeHeaderPopover === 'mail' ? '#10B981' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (activeHeaderPopover !== 'mail') e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (activeHeaderPopover !== 'mail') e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <Mail size={18} />
              </button>

              {activeHeaderPopover === 'mail' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '230px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '0.875rem 1rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    zIndex: 50,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: '#ECFDF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#059669',
                      }}
                    >
                      <Mail size={13} />
                    </div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#111827' }}>
                      Messages
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>
                    Mail and direct messaging are coming soon.
                  </p>
                </div>
              )}
            </div>

            {/* Notification Bell & Dropdown */}
            <div className="header-popover-container" style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Notifications"
                title="Notifications coming soon"
                onClick={() => setActiveHeaderPopover((prev) => (prev === 'notifications' ? null : 'notifications'))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: activeHeaderPopover === 'notifications' ? '#F3F4F6' : '#FFFFFF',
                  border: activeHeaderPopover === 'notifications' ? '1px solid #10B981' : '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeHeaderPopover === 'notifications' ? '#10B981' : '#4B5563',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (activeHeaderPopover !== 'notifications') e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (activeHeaderPopover !== 'notifications') e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <Bell size={18} />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#10B981',
                  }}
                />
              </button>

              {activeHeaderPopover === 'notifications' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '0.875rem 1rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    zIndex: 50,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: '#ECFDF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#059669',
                      }}
                    >
                      <Bell size={13} />
                    </div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#111827' }}>
                      Notifications
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>
                    Notifications coming soon.
                  </p>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div
              onClick={() => navigate('/edit-profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                paddingLeft: '0.25rem',
                cursor: 'pointer',
                borderRadius: '8px',
                padding: '4px 8px',
                transition: 'background 150ms ease',
              }}
              title="View & Edit Profile"
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <img
                src={userAvatar}
                alt={userName}
                style={{
                  width: '38px',
                  height: '38px',
                  minWidth: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #E5E7EB',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', lineHeight: 1.2, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </span>
                <span className="hide-mobile" style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.2 }}>
                  {userEmail}
                </span>
              </div>
            </div>

            {/* Styled Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t('nav.logout')}
              style={{
                marginLeft: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                color: '#EF4444',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '38px',
                transition: 'all 150ms ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF2F2';
                e.currentTarget.style.borderColor = '#FCA5A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <LogOut size={15} />
              <span className="hide-mobile">{t('nav.logout')}</span>
            </button>
          </div>
        </header>

        {/* 3. Main Dashboard Workspace */}
        <main
          className="dashboard-main-canvas"
          style={{
            flex: 1,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Offline / Timeout Notice Banner if analysis loaded from cached fallback */}
          {loadError && analysis && (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                color: '#92400E',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
                <span>{loadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #D97706',
                  background: '#FFFFFF',
                  color: '#92400E',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RefreshCw size={14} />
                {t('common.retry', { defaultValue: 'Retry' })}
              </button>
            </div>
          )}

          {/* Dashboard Title & Welcome Section (Donezo header style) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
                {t('dashboard.title')}
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
                {t('dashboard.welcome', { name: userName })}
              </p>
            </div>

            {/* Action Buttons: + Add Target Role & Export Data */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/edit-profile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  background: '#0E4A32',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(14, 74, 50, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#15803D')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0E4A32')}
              >
                <Plus size={16} />
                <span>{t('dashboard.updateTargetRole')}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  background: '#FFFFFF',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                <Download size={15} />
                <span>{t('dashboard.exportReport')}</span>
              </button>
            </div>
          </div>

          {/* Panel 1: SkillGapPanel (Donezo stat-card row at top) */}
          <SkillGapPanel
            matchedSkills={matchedSkills}
            missingSkills={missingSkills}
            onOpenMatched={() => setActiveSkillModal('matched')}
            onOpenMissing={() => setActiveSkillModal('missing')}
          />

          {/* Panel 2: SkillRoadmap (Step-by-step roadmap.sh inspired path) */}
          <SkillRoadmap
            role={effectiveProfile?.role || 'Target Role'}
            steps={roadmapSteps}
          />

          {/* Panel 3: ScoreSimulator (What-If Interactive Sandbox) */}
          <ScoreSimulator
            currentScore={liveScore}
            userSkills={analysis?.userSkills || []}
            requiredSkills={analysis?.requiredSkills || []}
            missingSkills={rawMissingSkills}
            missingDetails={analysis?.missingDetails || []}
          />

          {/* Panels 3 & 4: ScoreCard (Project Progress donut) + RecommendationPanel (Project list) */}
          <div className="dashboard-panels-grid">
            <ScoreCard score={liveScore} label={liveLabel} />
            <RecommendationPanel
              recommendations={filteredRecommendations}
              notice={recNotice}
              disclaimer={recDisclaimer}
              govtPortals={filteredGovtPortals}
            />
          </div>

          {/* Skill Detail Modal */}
          <SkillDetailModal
            isOpen={Boolean(activeSkillModal)}
            type={activeSkillModal}
            onClose={() => setActiveSkillModal(null)}
            analysis={analysis}
            role={effectiveProfile?.role}
            segment={effectiveProfile?.segment}
            userLocation={effectiveProfile?.location}
          />
        </main>
      </div>
    </div>
  );
}
