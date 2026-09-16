import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import { INDUSTRY_TALENT_POOL } from '../data/demoData';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

export default function IndustryDashboard() {
  const { user } = useAuth();
  const [talent, setTalent] = useState(INDUSTRY_TALENT_POOL);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [invitedCandidates, setInvitedCandidates] = useState({});
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [jobCreatedSuccess, setJobCreatedSuccess] = useState(false);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('AI Full Stack Resident');
  const [newJobDept, setNewJobDept] = useState('Machine Learning Core');
  const [newJobSalary, setNewJobSalary] = useState('$115,000 - $140,000');
  const [newJobSkills, setNewJobSkills] = useState('React, Python, Gemini API, Docker');

  const allSkills = ['All', 'React', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'Kubernetes'];

  const filteredTalent = talent.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.roleTarget.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.institute.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill =
      selectedSkillFilter === 'All' ||
      candidate.verifiedSkills.some((s) => s.toLowerCase().includes(selectedSkillFilter.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  const handleInvite = (candidateId) => {
    setInvitedCandidates((prev) => ({ ...prev, [candidateId]: true }));
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    setJobCreatedSuccess(true);
    setTimeout(() => {
      setShowPostJobModal(false);
      setJobCreatedSuccess(false);
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner / Industry Hero */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-cyan">Talent & Competency Pipeline</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {user?.industryType || 'Enterprise AI & Cloud Systems'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              {user?.name || 'Nova Systems Tech'}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '680px' }}>
              Direct access to verified student talent matching your open tech stacks. Your requirements are directly feedback-looped to <strong>48 university curricula</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowPostJobModal(true)}
              className="btn-primary"
            >
              <PlusCircle size={16} />
              <span>Post New Role & Skills</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Active Role Postings"
          value="5 Roles"
          trend="2 Urgent"
          trendPositive={true}
          icon={Briefcase}
          color="cyan"
          progress={100}
          subtitle="AI Full Stack, DevOps, Data Engineer"
        />
        <StatCard
          title="Screened Candidate Pool"
          value="342 Talent"
          trend="+38 this week"
          trendPositive={true}
          icon={Users}
          color="indigo"
          progress={88}
          subtitle="Pre-verified across partner universities"
        />
        <StatCard
          title="Average Match Precision"
          value="87.4%"
          trend="+4.2% YoY"
          trendPositive={true}
          icon={Award}
          color="emerald"
          progress={87}
          subtitle="Zero-waste interviewing pipeline"
        />
        <StatCard
          title="Curriculum Feedback Reach"
          value="48 Colleges"
          trend="Live Sync"
          trendPositive={true}
          icon={TrendingUp}
          color="purple"
          progress={96}
          subtitle="Direct syllabus adjustment broadcast"
        />
      </div>

      {/* Emerging Demand Broadcast / Market Feed */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.8) 80%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A5B4FC',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Broadcasting 2026 Skill Demand to Partner Universities
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Top requested hiring skills this quarter: <strong>Gemini Live API, Docker K8s, TypeScript Architecture, and pgvector</strong>.
            </p>
          </div>
        </div>

        <span className="badge badge-primary">Syllabus Sync Active</span>
      </div>

      {/* Talent Discovery Directory */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Verified Talent Pipeline
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Candidates pre-calibrated against your required engineering competencies
            </p>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates..."
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Skill Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {allSkills.map((sk) => (
                <button
                  key={sk}
                  onClick={() => setSelectedSkillFilter(sk)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: selectedSkillFilter === sk ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedSkillFilter === sk ? '#38BDF8' : 'var(--text-muted)',
                    border: `1px solid ${selectedSkillFilter === sk ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}`,
                  }}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredTalent.map((cand) => {
            const isInvited = invitedCandidates[cand.id];

            return (
              <div
                key={cand.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {cand.name}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {cand.institute} • {cand.gradYear}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34D399',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {cand.alignmentScore}% Match
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#A5B4FC', marginBottom: '0.5rem' }}>
                    Target: {cand.roleTarget} (GPA: {cand.gpa})
                  </div>

                  {/* Verified Skills */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                      Verified Competencies:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {cand.verifiedSkills.map((sk) => (
                        <span
                          key={sk}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#C7D2FE',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600 }}>
                    {cand.status}
                  </span>

                  <button
                    onClick={() => handleInvite(cand.id)}
                    disabled={isInvited}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      background: isInvited ? 'rgba(16, 185, 129, 0.2)' : 'var(--grad-primary)',
                      color: isInvited ? '#34D399' : '#fff',
                      border: isInvited ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: isInvited ? 'default' : 'pointer',
                    }}
                  >
                    {isInvited ? (
                      <>
                        <CheckCircle2 size={14} />
                        Interview Invited
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Schedule Screening
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostJobModal && (
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
              onClick={() => setShowPostJobModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            {jobCreatedSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid #10B981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={30} color="#34D399" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Role Broadcasted Live!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Your requirement has been published. Matching students are being notified and partner institute syllabi have been updated with this demand signal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateJob}>
                <span className="badge badge-cyan" style={{ marginBottom: '0.65rem' }}>Create Requirement</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Post Open Role & Skill Weights
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Define requirements to trigger automated candidate matching and broadcast demand to engineering colleges.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Position Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Department / Team
                    </label>
                    <input
                      type="text"
                      required
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Salary Range
                    </label>
                    <input
                      type="text"
                      required
                      value={newJobSalary}
                      onChange={(e) => setNewJobSalary(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Required Competencies (Comma Separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={newJobSkills}
                      onChange={(e) => setNewJobSkills(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '0.75rem', padding: '0.75rem' }}
                  >
                    <Sparkles size={16} />
                    <span>Publish Role & Signal Curriculum Demand</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
