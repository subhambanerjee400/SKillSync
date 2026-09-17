import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../lib/userRoles';
import { getUserProfile } from '../lib/profile';
import {
  User,
  Building2,
  Factory,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  LogOut,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user, userRoles, switchActiveRole, logout, userName, userAvatar } = useAuth();

  const handleSelectRole = async (chosenRole) => {
    switchActiveRole(chosenRole);

    if (chosenRole === USER_ROLES.INSTITUTION) {
      navigate('/institution-dashboard', { replace: true });
    } else if (chosenRole === USER_ROLES.INDUSTRY_PARTNER) {
      navigate('/industry-dashboard', { replace: true });
    } else {
      // For job_seeker, check if onboarding needed
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile && (profile.id || profile.role || profile.name)) {
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch (e) { }
      }
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #061B14 0%, #0A2E22 50%, #061811 100%)',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.25rem clamp(1.25rem, 5vw, 3rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            }}
          >
            <ShieldCheck size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
              SkillSync
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Multi-Role Workspace Selector
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '0.35rem 0.75rem 0.35rem 0.4rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E2E8F0' }}>
              {userName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              cursor: 'pointer',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F8FAFC';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Choice Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem clamp(1rem, 4vw, 2rem)',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} /> One Account · Multiple Verified Roles
          </span>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 0.75rem 0',
              color: '#FFFFFF',
            }}
          >
            Continue your session as...
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: '#94A3B8',
              margin: 0,
              maxWidth: '620px',
              lineHeight: 1.5,
            }}
          >
            Your verified SkillSync account holds multiple access workspaces. Select the workspace you want to operate in for this session. You can switch anytime.
          </p>
        </div>

        {/* Three Role Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            width: '100%',
          }}
        >
          {/* 1. Job Seeker Card */}
          <div
            id="role-card-job-seeker"
            onClick={() => handleSelectRole(USER_ROLES.JOB_SEEKER)}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10B981';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  marginBottom: '1.25rem',
                }}
              >
                <User size={28} />
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#34D399',
                  marginBottom: '0.25rem',
                }}
              >
                Individual Candidate
              </div>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  margin: '0 0 0.75rem 0',
                  color: '#FFFFFF',
                }}
              >
                Job Seeker
              </h2>
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  margin: '0 0 1.5rem 0',
                }}
              >
                Access personalized skill gap analyses, readiness roadmaps, course recommendations, and career pathway bridges.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <Target size={15} color="#10B981" />
                  <span>Live 0–100 Readiness Score</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <TrendingUp size={15} color="#10B981" />
                  <span>Curated ITI & Polytechnic pathways</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#34D399',
                fontWeight: 600,
                fontSize: '0.92rem',
              }}
            >
              <span>Continue as Job Seeker</span>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* 2. Institution Card */}
          <div
            id="role-card-institution"
            onClick={() => handleSelectRole(USER_ROLES.INSTITUTION)}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0284C7';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(2, 132, 199, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(2, 132, 199, 0.15)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  marginBottom: '1.25rem',
                }}
              >
                <Building2 size={28} />
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#38BDF8',
                  marginBottom: '0.25rem',
                }}
              >
                Educational & Training Org
              </div>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  margin: '0 0 0.75rem 0',
                  color: '#FFFFFF',
                }}
              >
                Training Institution
              </h2>
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  margin: '0 0 1.5rem 0',
                }}
              >
                Report emerging training curriculum skills, review regional talent benchmarks, and track trainee competencies.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <TrendingUp size={15} color="#38BDF8" />
                  <span>Report emerging curriculum skills</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <Users size={15} color="#38BDF8" />
                  <span>Cohort readiness telemetry</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#38BDF8',
                fontWeight: 600,
                fontSize: '0.92rem',
              }}
            >
              <span>Continue as Institution</span>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* 3. Industry Partner Card */}
          <div
            id="role-card-industry"
            onClick={() => handleSelectRole(USER_ROLES.INDUSTRY_PARTNER)}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#A855F7';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(168, 85, 247, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C084FC',
                  marginBottom: '1.25rem',
                }}
              >
                <Factory size={28} />
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#C084FC',
                  marginBottom: '0.25rem',
                }}
              >
                Hiring & Corporate Partner
              </div>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  margin: '0 0 0.75rem 0',
                  color: '#FFFFFF',
                }}
              >
                Industry Partner
              </h2>
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  margin: '0 0 1.5rem 0',
                }}
              >
                Report skills in hiring demand, broadcast openings, and explore calibrated candidate talent pipelines.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <Briefcase size={15} color="#C084FC" />
                  <span>Report in-demand hiring skills</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <Target size={15} color="#C084FC" />
                  <span>Candidate competency discovery</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#C084FC',
                fontWeight: 600,
                fontSize: '0.92rem',
              }}
            >
              <span>Continue as Industry Partner</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
