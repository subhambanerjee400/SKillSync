import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import SkillChart from '../components/SkillChart';
import RecommendationCard from '../components/RecommendationCard';
import JobCard from '../components/JobCard';
import {
  STUDENT_SKILL_RADAR,
  STUDENT_RECOMMENDATIONS,
  MATCHED_JOBS,
} from '../data/demoData';
import {
  Target,
  Award,
  Zap,
  Briefcase,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  RefreshCw,
  PlayCircle,
  X,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack AI Engineer');
  const [radarData, setRadarData] = useState(STUDENT_SKILL_RADAR);
  const [recommendations, setRecommendations] = useState(STUDENT_RECOMMENDATIONS);
  const [jobs, setJobs] = useState(MATCHED_JOBS);
  const [alignmentScore, setAlignmentScore] = useState(84);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentSuccess, setAssessmentSuccess] = useState(false);

  // Target role presets with custom skill weights
  const TARGET_ROLES = [
    { label: 'Full Stack AI Engineer', id: 'Full Stack AI Engineer' },
    { label: 'Cloud & DevOps Architect', id: 'Cloud & DevOps Architect' },
    { label: 'Data Science & MLOps', id: 'Data Science & MLOps' },
  ];

  const handleRoleChange = (newRole) => {
    setTargetRole(newRole);
    if (newRole === 'Cloud & DevOps Architect') {
      setAlignmentScore(72);
      setRadarData(
        STUDENT_SKILL_RADAR.map((item) => {
          if (item.category === 'DevOps') return { ...item, industry: 95 };
          if (item.category === 'Frontend') return { ...item, industry: 60 };
          return item;
        })
      );
    } else if (newRole === 'Data Science & MLOps') {
      setAlignmentScore(79);
      setRadarData(
        STUDENT_SKILL_RADAR.map((item) => {
          if (item.category === 'Data & AI') return { ...item, industry: 95 };
          if (item.category === 'Frontend') return { ...item, industry: 50 };
          return item;
        })
      );
    } else {
      setAlignmentScore(84);
      setRadarData(STUDENT_SKILL_RADAR);
    }
  };

  const handleRunAssessment = () => {
    // Simulate completing a Docker & Containers verification challenge
    setRadarData((prev) =>
      prev.map((item) => {
        if (item.skill === 'Docker & Containers') {
          return { ...item, student: 78 };
        }
        return item;
      })
    );
    setAlignmentScore((prev) => Math.min(100, prev + 5));
    setAssessmentSuccess(true);
    setTimeout(() => {
      setShowAssessmentModal(false);
      setAssessmentSuccess(false);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner / Student Hero */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '-60px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">Student Intelligence Hub</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {user?.institute || 'Apex Institute of Technology'} • {user?.department || 'CS & Engineering'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Alex'}!
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '650px' }}>
              Your personalized curriculum gap analysis against 2026 hiring standards. Close <strong>Docker & LLM Orchestration</strong> to reach 96% role alignment.
            </p>
          </div>

          {/* Quick Target Role Switcher & Assessment Trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} color="var(--primary-light)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Active Target Role
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {TARGET_ROLES.map((roleOption) => (
                <button
                  key={roleOption.id}
                  onClick={() => handleRoleChange(roleOption.id)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: targetRole === roleOption.id ? 700 : 500,
                    background: targetRole === roleOption.id ? 'var(--primary)' : 'rgba(30, 41, 59, 0.7)',
                    color: targetRole === roleOption.id ? '#fff' : 'var(--text-secondary)',
                    border: targetRole === roleOption.id ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  }}
                >
                  {roleOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Overall Role Alignment"
          value={`${alignmentScore}%`}
          trend="+6% this mo"
          trendPositive={true}
          icon={Target}
          color="indigo"
          progress={alignmentScore}
          subtitle={`Calibrated against ${targetRole}`}
        />
        <StatCard
          title="Verified Competencies"
          value="6 / 8"
          trend="2 In Review"
          trendPositive={true}
          icon={Award}
          color="emerald"
          progress={75}
          subtitle="Proctored & GitHub repo verified"
        />
        <StatCard
          title="High-Match Opportunities"
          value="4 Roles"
          trend="92% Top Match"
          trendPositive={true}
          icon={Briefcase}
          color="cyan"
          progress={92}
          subtitle="Nova Systems, Pulsewave & more"
        />
        <StatCard
          title="Active Upskilling"
          value="2 Courses"
          trend="64% Completed"
          trendPositive={true}
          icon={Zap}
          color="purple"
          progress={64}
          subtitle="Targeting Docker & LLM orchestration"
        />
      </div>

      {/* Main Alignment Matrix & Assessment Callout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Radar & Gap Analysis Visualizer */}
        <div style={{ gridColumn: 'span 2' }}>
          <SkillChart
            data={radarData}
            title={`${targetRole} - Competency Breakdown`}
            subtitle="Real-time calibration: Student proficiency vs Industry benchmark vs University syllabus"
            showCurriculum={true}
          />
        </div>

        {/* Quick Skill Boost Assessment Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            background: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.8) 80%)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={20} color="#818CF8" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Skill Calibration Test
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Have you mastered <strong>Docker Containers & CI/CD</strong> through your projects or internships? Take an adaptive 5-minute simulation to verify your proficiency and boost your role match score by <strong>+5%</strong>.
          </p>

          <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Competency</span>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>Docker & Containers</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Potential Alignment</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>84% → 89% Overall</span>
            </div>
          </div>

          <button
            onClick={() => setShowAssessmentModal(true)}
            className="btn-primary"
            style={{ width: '100%', padding: '0.7rem' }}
          >
            <PlayCircle size={16} />
            <span>Launch Quick Assessment</span>
          </button>
        </div>
      </div>

      {/* Actionable Learning Pathways / Recommendations */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Targeted Upskilling Pathways
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Recommended specifically to bridge your largest competency deltas
            </p>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--primary-light)', fontWeight: 600 }}>
            {recommendations.length} Active Tracks
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {recommendations.map((course) => (
            <RecommendationCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Matched Job & Internship Opportunities */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Calibrated Job Matches
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Opportunities scored by exact overlap with your verified competency profile
            </p>
          </div>
          <span className="badge badge-success">Live Partner Pipeline</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>

      {/* Interactive Assessment Modal Simulation */}
      {showAssessmentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid var(--border-active)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowAssessmentModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            {assessmentSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid #10B981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={32} color="#34D399" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Assessment Verified!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Docker & Containers competency elevated to <strong>78%</strong>.<br />
                  Overall Role Alignment is now <strong>{alignmentScore}%</strong>.
                </p>
              </div>
            ) : (
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Micro-Verification</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Docker Multi-Stage Builds & Optimization
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Question 1 of 1: In a production multi-stage Dockerfile for a React/Node application, what is the primary architectural purpose of utilizing a builder stage?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {[
                    'To keep devDependencies, source maps, and compilers out of the final runtime container image, minimizing attack surface and image size.',
                    'To run unit tests in parallel across multiple CPU cores during CI.',
                    'To bypass Docker daemon caching for non-deterministic packages.',
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={handleRunAssessment}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Simulated Adaptive Exam</span>
                  <span>Timed: 03:45 remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
