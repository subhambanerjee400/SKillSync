import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../lib/profile';
import { getUserSkillGapAnalysis, saveScoreIfChanged } from '../lib/scoring';
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
import { generateRoadmap } from '../lib/roadmap';
import { Search, Bell, Mail, Plus, LogOut, Download, Loader2, Sparkles, Menu } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recNotice, setRecNotice] = useState(null);
  const [activeSkillModal, setActiveSkillModal] = useState(null); // 'matched' | 'missing' | null
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const roadmapSteps = useMemo(() => {
    if (!analysis) return [];
    return generateRoadmap(
      analysis.matchedSkills || [],
      analysis.missingSkills || [],
      analysis.requiredSkills || []
    );
  }, [analysis]);

  // Fetch profile, calculate live score, and generate recommendations
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const p = await getUserProfile(user.id);
        if (!isMounted) return;

        if (!p) {
          navigate('/onboarding', { replace: true });
          return;
        }

        setProfile(p);

        // Fetch deterministic skill gap analysis
        const result = await getUserSkillGapAnalysis(user.id);
        if (!isMounted) return;

        setAnalysis(result);

        // Save score to history if changed (non-blocking)
        saveScoreIfChanged(user.id, result.score).catch((err) =>
          console.warn('Score history save error:', err)
        );

        // Generate tailored recommendations based on segment
        if (p.segment === 'Trade') {
          const tradeResult = generateTradeRecommendations(result.missingSkills, p);
          setRecommendations(tradeResult.recommendations || []);
          setRecNotice(tradeResult.notice || null);
        } else {
          const courseResult = generateCourseRecommendations(
            result.missingSkills,
            result.risingMissing,
            p.role
          );
          setRecommendations(courseResult || []);
          setRecNotice(null);
        }
      } catch (err) {
        console.error('Dashboard data load error:', err);
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
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.full_name ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Member');

  const userEmail = user?.email || 'user@example.com';
  const userAvatar =
    user?.avatar_url ||
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

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
            Analyzing Skill Readiness...
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#6B7280', margin: '4px 0 0 0' }}>
            Auditing competency matrix and tailored learning pathways
          </p>
        </div>
      </div>
    );
  }

  // Live scoring data
  const liveScore = analysis?.score ?? 0;
  const liveLabel = profile?.role
    ? `${profile.role} Readiness`
    : 'Readiness Index';

  const filterQuery = searchQuery.trim().toLowerCase();
  const rawMatchedSkills = analysis?.matchedSkills || [];
  const rawMissingSkills = analysis?.missingSkills || [];

  const matchedSkills = filterQuery
    ? rawMatchedSkills.filter((s) => s.toLowerCase().includes(filterQuery))
    : rawMatchedSkills;

  const missingSkills = filterQuery
    ? rawMissingSkills.filter((s) => s.toLowerCase().includes(filterQuery))
    : rawMissingSkills;

  const filteredRecommendations = filterQuery
    ? recommendations.filter(
      (r) =>
        r.title?.toLowerCase().includes(filterQuery) ||
        r.description?.toLowerCase().includes(filterQuery) ||
        (r.skillsCovered && r.skillsCovered.some((s) => s.toLowerCase().includes(filterQuery))) ||
        (r.skillsOffered && r.skillsOffered.some((s) => s.toLowerCase().includes(filterQuery)))
    )
    : recommendations;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F4F6F8',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#111827',
      }}
    >
      {/* 1. Left Sidebar (Desktop Static) */}
      <Sidebar onLogout={handleLogout} />

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
      />

      {/* 2. Main Content Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
          }}
        >
          {/* Left: Mobile Hamburger & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '420px', minWidth: 0, marginRight: '1rem' }}>
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open navigation drawer"
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
                aria-label="Search skills, roles, or recommendations"
                placeholder="Search skill or role..."
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

          {/* Right Header Elements: Mail, Bell, Profile, Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            {/* Mail Icon Button (hidden on narrow screens) */}
            <button
              type="button"
              aria-label="Messages"
              className="hide-mobile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <Mail size={18} />
            </button>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              aria-label="Notifications"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
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

            {/* User Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.25rem' }}>
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
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
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
              aria-label="Log out"
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
              <span className="hide-mobile">Logout</span>
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
          {/* Dashboard Title & Welcome Section (Donezo header style) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
                Dashboard
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
                Welcome back, {userName}! Plan, prioritize, and accomplish your skill alignment with ease.
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
                <span>Update Target Role</span>
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
                <span>Export Report</span>
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
            role={profile?.role || 'Target Role'}
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
            />
          </div>

          {/* Skill Detail Modal */}
          <SkillDetailModal
            isOpen={Boolean(activeSkillModal)}
            type={activeSkillModal}
            onClose={() => setActiveSkillModal(null)}
            analysis={analysis}
            role={profile?.role}
            segment={profile?.segment}
            userLocation={profile?.location}
          />
        </main>
      </div>
    </div>
  );
}
