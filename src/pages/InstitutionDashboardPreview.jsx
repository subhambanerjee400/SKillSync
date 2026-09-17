import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  LogOut,
  TrendingUp,
  Users,
  Info,
  PlusCircle,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import RoleSwitcher from '../components/RoleSwitcher';
import { INSTITUTION_CANDIDATES, INSTITUTION_SKILL_GAPS, INSTITUTION_TRENDS } from '../data/institutionDemoData';

const panelStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '1.25rem',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
};

const INITIAL_EMERGING_SKILLS = [
  { id: 1, name: 'Solar PV Installation & Microgrid Maintenance', trade: 'Electrician', trend: 'Rising', trainees: 85 },
  { id: 2, name: 'EV Powertrain Diagnostics & BMS', trade: 'Automotive', trend: 'Rising', trainees: 64 },
  { id: 3, name: 'PLC Automation & Ladder Logic', trade: 'Electrical', trend: 'Rising', trainees: 52 },
  { id: 4, name: 'CNC Multi-Axis G-Code Programming', trade: 'Fitter / Machinist', trend: 'Stable', trainees: 44 },
  { id: 5, name: 'Manual Arc Pipe Welding (2G/3G)', trade: 'Welder', trend: 'Declining', trainees: 22 },
];

export default function InstitutionDashboardPreview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Emerging skills state
  const [emergingSkills, setEmergingSkills] = useState(INITIAL_EMERGING_SKILLS);
  const [skillName, setSkillName] = useState('');
  const [trade, setTrade] = useState('Electrician');
  const [trend, setTrend] = useState('Rising');
  const [traineeEstimate, setTraineeEstimate] = useState('30');
  const [toastMessage, setToastMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleReportSkill = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const newSkill = {
      id: Date.now(),
      name: skillName.trim(),
      trade,
      trend,
      trainees: parseInt(traineeEstimate, 10) || 20,
    };

    setEmergingSkills([newSkill, ...emergingSkills]);
    setSkillName('');
    setToastMessage(`Emerging skill "${newSkill.name}" reported successfully! Thank you for contributing to SkillSync's curriculum insights.`);

    setTimeout(() => {
      setToastMessage('');
    }, 5000);
  };

  const renderTrendBadge = (status) => {
    if (status === 'Rising') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            background: '#ECFDF5',
            color: '#059669',
            fontSize: '0.76rem',
            fontWeight: 700,
          }}
        >
          <ArrowUpRight size={13} />
          Rising
        </span>
      );
    }
    if (status === 'Stable') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            background: '#F1F5F9',
            color: '#475569',
            fontSize: '0.76rem',
            fontWeight: 700,
          }}
        >
          <Minus size={13} />
          Stable
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: '#FEF2F2',
          color: '#DC2626',
          fontSize: '0.76rem',
          fontWeight: 700,
        }}
      >
        <ArrowDownRight size={13} />
        Declining
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            background: '#064E3B',
            color: '#ECFDF5',
            padding: '0.9rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.86rem',
            fontWeight: 600,
            maxWidth: '440px',
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0 }} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#A7F3D0',
              cursor: 'pointer',
              marginLeft: 'auto',
              fontWeight: 700,
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem clamp(1rem, 4vw, 3rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: '#0e4a32',
            }}
          >
            <Building2 size={19} color="#fff" />
          </span>
          <strong>SkillSync</strong>
          <span style={{ color: '#64748b' }}>Institution portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <RoleSwitcher variant="light" />
          <button
            type="button"
            onClick={handleLogout}
            style={{
              color: '#475569',
              display: 'inline-flex',
              gap: '0.4rem',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '2rem clamp(1rem, 4vw, 2.5rem)' }}>
        {/* Mandatory Notice Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.5rem',
            color: '#1E40AF',
            fontSize: '0.88rem',
            fontWeight: 500,
            lineHeight: 1.45,
          }}
        >
          <Info size={19} color="#2563EB" style={{ flexShrink: 0 }} />
          <span>
            Data reported here will help refine SkillSync&apos;s scoring engine for job seekers — full integration coming soon.
          </span>
        </div>

        {/* Page Title & Context */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              Curriculum & Analytics
            </span>
            <h1 style={{ margin: '0.25rem 0', fontSize: '1.8rem' }}>Institution / Organization Portal</h1>
            <p style={{ margin: 0, color: '#64748b' }}>
              Institution workspace for {user?.user_metadata?.institution_name || user?.user_metadata?.full_name || 'your institution/organization'}.
            </p>
          </div>
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '0.35rem 0.65rem',
              borderRadius: 999,
              background: '#ecfdf5',
              color: '#047857',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            Vocational Partner
          </span>
        </div>

        {/* Summary Metric Cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Total Trainees Enrolled</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>348</strong>
            <span style={{ color: '#047857', fontSize: '0.8rem', fontWeight: 600 }}>+18% this academic cycle</span>
          </div>
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Vocational Courses Offered</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>14 Trades</strong>
            <span style={{ color: '#0284C7', fontSize: '0.8rem', fontWeight: 600 }}>ITI & Polytechnic Affiliated</span>
          </div>
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Average Candidate Readiness</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>74%</strong>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Across verified job trades</span>
          </div>
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Emerging Skills Monitored</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>{emergingSkills.length}</strong>
            <span style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: 600 }}>Active reporting feed</span>
          </div>
        </section>

        {/* Emerging Skills Section (Core Theme) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.85fr)',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
          className="institution-emerging-grid"
        >
          {/* Emerging Skills You're Training For Table */}
          <section style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={18} color="#047857" />
                  Emerging Skills You&apos;re Training For
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                  Forward-looking competencies your curriculum is actively developing.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {emergingSkills.length} Reported
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Skill Name</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Trade</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Trend</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Trainees</th>
                  </tr>
                </thead>
                <tbody>
                  {emergingSkills.map((sk) => (
                    <tr key={sk.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#1E293B' }}>
                        {sk.name}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>
                        <span style={{ background: '#F8FAFC', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                          {sk.trade}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {renderTrendBadge(sk.trend)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                        {sk.trainees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Report a New Emerging Skill Form */}
          <section style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <PlusCircle size={18} color="#0e4a32" />
              Report a New Emerging Skill
            </h2>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.82rem' }}>
              Log a high-growth skill your institute plans to teach or is piloting.
            </p>

            <form onSubmit={handleReportSkill} style={{ display: 'grid', gap: '0.85rem' }}>
              <div>
                <label
                  htmlFor="inst-skill-name"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                >
                  Skill Name *
                </label>
                <input
                  id="inst-skill-name"
                  type="text"
                  required
                  placeholder="e.g. Battery Management Systems (BMS)"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label
                    htmlFor="inst-trade-select"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                  >
                    Vocational Trade
                  </label>
                  <select
                    id="inst-trade-select"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.65rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Fitter / Machinist">Fitter / Machinist</option>
                    <option value="Welder">Welder</option>
                    <option value="Automotive">Automotive / EV</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Solar & Renewables">Solar & Renewables</option>
                    <option value="Industrial IoT">Industrial IoT</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inst-trend-select"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                  >
                    Trend *
                  </label>
                  <select
                    id="inst-trend-select"
                    value={trend}
                    onChange={(e) => setTrend(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.65rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Rising">Rising (High Growth)</option>
                    <option value="Stable">Stable</option>
                    <option value="Declining">Declining</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="inst-trainees-input"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                >
                  Estimated Trainees
                </label>
                <input
                  id="inst-trainees-input"
                  type="number"
                  min="1"
                  max="1000"
                  value={traineeEstimate}
                  onChange={(e) => setTraineeEstimate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  background: '#0E4A32',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#093724';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0E4A32';
                }}
              >
                <PlusCircle size={16} />
                Report Emerging Skill
              </button>
            </form>
          </section>
        </div>

        {/* Existing Mock Curriculum & Candidate Data */}
        <section style={{ ...panelStyle, marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginTop: 0 }}>Aggregate Skill Gaps by Role</h2>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {INSTITUTION_SKILL_GAPS.map((gap) => (
              <div
                key={gap.skill}
                className="institution-gap-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(160px, 1fr) 2fr auto',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <span>
                  <strong>{gap.role}</strong>
                  <small style={{ display: 'block', color: '#64748b' }}>{gap.region}</small>
                </span>
                <div style={{ height: 9, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${gap.missingRate}%`, height: '100%', background: '#f59e0b' }} />
                </div>
                <span style={{ fontWeight: 700 }}>{gap.missingRate}% missing {gap.skill}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="institution-split-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)',
            gap: '1rem',
          }}
        >
          <div style={panelStyle}>
            <h2 style={{ fontSize: '1.05rem', marginTop: 0, display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              <Users size={18} color="#0e4a32" /> Candidates Near You
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '-0.4rem' }}>
              Anonymized preview data only.
            </p>
            {INSTITUTION_CANDIDATES.map((candidate) => (
              <div
                key={candidate.id}
                style={{
                  padding: '0.8rem 0',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <span>
                  <strong>{candidate.label}</strong>
                  <small style={{ display: 'block', color: '#64748b' }}>
                    {candidate.role} · {candidate.location}
                  </small>
                </span>
                <strong style={{ color: candidate.readiness >= 75 ? '#047857' : '#b45309' }}>
                  {candidate.readiness}% ready
                </strong>
              </div>
            ))}
          </div>

          <div style={panelStyle}>
            <h2 style={{ fontSize: '1.05rem', marginTop: 0, display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              <TrendingUp size={18} color="#0e4a32" /> Skill Trends
            </h2>
            {INSTITUTION_TRENDS.map((t) => (
              <div key={t.skill} style={{ padding: '0.8rem 0', borderTop: '1px solid #f1f5f9' }}>
                <strong>{t.skill}</strong>
                <small
                  style={{
                    display: 'block',
                    color: t.status.includes('High') ? '#b45309' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  {t.status}
                </small>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.35rem 0 0' }}>{t.note}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
