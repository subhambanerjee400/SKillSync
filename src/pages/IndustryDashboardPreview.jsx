import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LogOut,
  TrendingUp,
  Info,
  PlusCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  Search,
  Mail,
  Building,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import RoleSwitcher from '../components/RoleSwitcher';
import { BULK_HIRING_INSIGHTS } from '../data/industryDemoData';

const panelStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '1.25rem',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
};

const INITIAL_HIRING_SKILLS = [
  { id: 1, name: 'PLC Ladder Logic & SCADA Diagnostics', sector: 'Industrial Automation', trend: 'Rising', openings: 18 },
  { id: 2, name: 'High-Voltage Battery Pack Servicing', sector: 'EV Manufacturing', trend: 'Rising', openings: 14 },
  { id: 3, name: 'MIG / TIG Precision Aluminum Welding', sector: 'Fabrication', trend: 'Rising', openings: 12 },
  { id: 4, name: 'AutoCAD Electrical Schematic Design', sector: 'Electrical Engineering', trend: 'Stable', openings: 8 },
  { id: 5, name: 'Three-Phase Motor Rewinding & Testing', sector: 'Industrial Maintenance', trend: 'Stable', openings: 6 },
  { id: 6, name: 'Manual Lathe Operations', sector: 'Machining', trend: 'Declining', openings: 2 },
];

const DEMAND_CHART_DATA = [
  { skill: 'PLC & Industrial Automation', growth: 94, category: 'Automation' },
  { skill: 'EV Battery Assembly & Diagnostics', growth: 88, category: 'Automotive' },
  { skill: 'Solar PV Inverter Maintenance', growth: 82, category: 'Renewables' },
  { skill: 'Robotic Welding Cell Operation', growth: 76, category: 'Fabrication' },
  { skill: 'CNC 5-Axis Multi-Tasking', growth: 69, category: 'Precision Machining' },
];

export default function IndustryDashboardPreview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for bulk hiring selector
  const [selected, setSelected] = useState(0);
  const insight = useMemo(() => BULK_HIRING_INSIGHTS[selected], [selected]);

  // State for skills hiring for & reporting form
  const [hiringSkills, setHiringSkills] = useState(INITIAL_HIRING_SKILLS);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSector, setNewSector] = useState('Industrial Automation');
  const [newTrend, setNewTrend] = useState('Rising');
  const [newOpenings, setNewOpenings] = useState('10');
  const [toastMessage, setToastMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleReportDemand = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const reportedSkill = {
      id: Date.now(),
      name: newSkillName.trim(),
      sector: newSector,
      trend: newTrend,
      openings: parseInt(newOpenings, 10) || 5,
    };

    setHiringSkills([reportedSkill, ...hiringSkills]);
    setNewSkillName('');
    setToastMessage(`In-demand skill "${reportedSkill.name}" reported successfully! This will inform vocational training recommendations.`);

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

  const totalOpeningsCount = hiringSkills.reduce((acc, curr) => acc + curr.openings, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Success Toast */}
      {toastMessage && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            background: '#3B0764',
            color: '#FAF5FF',
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
          <CheckCircle2 size={18} color="#C084FC" style={{ flexShrink: 0 }} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#E9D5FF',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: '#581C87',
            }}
          >
            <Briefcase size={19} color="#fff" />
          </span>
          <strong>SkillSync</strong>
          <span style={{ color: '#64748b' }}>Industry Partner portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <RoleSwitcher variant="light" />
          <button
            type="button"
            onClick={handleLogout}
            style={{
              color: '#475569',
              display: 'inline-flex',
              gap: '.4rem',
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

      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '2rem clamp(1rem, 4vw, 2.5rem)' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#7E22CE', textTransform: 'uppercase' }}>
              Industry Hiring & Skills Demand
            </span>
            <h1 style={{ margin: '.25rem 0', fontSize: '1.8rem' }}>Industry Partner Dashboard</h1>
            <p style={{ margin: 0, color: '#64748b' }}>
              Demand-signal workspace for {user?.user_metadata?.company_name || user?.user_metadata?.full_name || 'your enterprise'}.
            </p>
          </div>
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '0.35rem 0.65rem',
              borderRadius: 999,
              background: '#FAF5FF',
              color: '#7E22CE',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: '1px solid #E9D5FF',
            }}
          >
            Hiring Partner
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
            <span style={{ color: '#64748b', fontSize: '.82rem' }}>Total Open Positions</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '.35rem', color: '#1E293B' }}>
              {totalOpeningsCount}
            </strong>
            <span style={{ color: '#7E22CE', fontSize: '.8rem', fontWeight: 600 }}>Across {hiringSkills.length} key trades</span>
          </div>
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '.82rem' }}>Qualified Regional Pool</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '.35rem', color: '#1E293B' }}>
              340+
            </strong>
            <span style={{ color: '#059669', fontSize: '.8rem', fontWeight: 600 }}>Active certified candidates</span>
          </div>
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '.82rem' }}>Hiring Demand Index</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '.35rem', color: '#1E293B' }}>
              86%
            </strong>
            <span style={{ color: '#2563EB', fontSize: '.8rem', fontWeight: 600 }}>High vocational absorption</span>
          </div>
          <div style={panelStyle}>
            <span style={{ color: '#64748b', fontSize: '.82rem' }}>Skills Reported to Engine</span>
            <strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '.35rem', color: '#1E293B' }}>
              {hiringSkills.length}
            </strong>
            <span style={{ color: '#047857', fontSize: '.8rem', fontWeight: 600 }}>Direct feedback channel</span>
          </div>
        </section>

        {/* Core Emerging Skills Demand Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.85fr)',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Skills We're Currently Hiring For Table */}
          <section style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={18} color="#7E22CE" />
                  Skills We&apos;re Currently Hiring For
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                  Demand signals submitted by your talent acquisition and engineering leads.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {hiringSkills.length} Skills Listed
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Skill Name</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Sector</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Trend</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Openings</th>
                  </tr>
                </thead>
                <tbody>
                  {hiringSkills.map((sk) => (
                    <tr key={sk.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#1E293B' }}>
                        {sk.name}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748B' }}>
                        <span style={{ background: '#FAF5FF', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid #E9D5FF', fontSize: '0.78rem', color: '#6B21A8' }}>
                          {sk.sector}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {renderTrendBadge(sk.trend)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                        {sk.openings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Report an Emerging Skill in Demand Form */}
          <section style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <PlusCircle size={18} color="#581C87" />
              Report an Emerging Skill in Demand
            </h2>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.82rem' }}>
              Tell SkillSync what skills your enterprise struggles to find in regional applicants.
            </p>

            <form onSubmit={handleReportDemand} style={{ display: 'grid', gap: '0.85rem' }}>
              <div>
                <label
                  htmlFor="ind-skill-name"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                >
                  Skill / Competency Name *
                </label>
                <input
                  id="ind-skill-name"
                  type="text"
                  required
                  placeholder="e.g. Substation SCADA & RTU Configuration"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
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
                    htmlFor="ind-sector-select"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                  >
                    Industry Sector
                  </label>
                  <select
                    id="ind-sector-select"
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
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
                    <option value="Industrial Automation">Industrial Automation</option>
                    <option value="EV Manufacturing">EV Manufacturing</option>
                    <option value="Fabrication">Fabrication & Welding</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ind-trend-select"
                    style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                  >
                    Demand Trend *
                  </label>
                  <select
                    id="ind-trend-select"
                    value={newTrend}
                    onChange={(e) => setNewTrend(e.target.value)}
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
                    <option value="Rising">Rising (Accelerating Need)</option>
                    <option value="Stable">Stable</option>
                    <option value="Declining">Declining</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ind-openings-input"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}
                >
                  Estimated Annual Openings
                </label>
                <input
                  id="ind-openings-input"
                  type="number"
                  min="1"
                  max="500"
                  value={newOpenings}
                  onChange={(e) => setNewOpenings(e.target.value)}
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
                  background: '#581C87',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#431407';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#581C87';
                }}
              >
                <PlusCircle size={16} />
                Report In-Demand Skill
              </button>
            </form>
          </section>
        </div>

        {/* Top Rising Skills Chart Reframed Around Emerging Hiring Demand */}
        <section style={{ ...panelStyle, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <BarChart3 size={19} color="#7E22CE" />
                Regional Emerging Skills Hiring Demand Index
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                Aggregated demand surge metrics from enterprise partners across eastern regional manufacturing corridors.
              </p>
            </div>
            <span style={{ fontSize: '0.76rem', background: '#F3E8FF', color: '#6B21A8', padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: 700 }}>
              Updated Q3 2026
            </span>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {DEMAND_CHART_DATA.map((item) => (
              <div key={item.skill} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr auto', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#1E293B', display: 'block' }}>{item.skill}</strong>
                  <small style={{ color: '#64748B', fontSize: '0.76rem' }}>{item.category}</small>
                </div>
                <div style={{ height: '10px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.growth}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #9333EA 0%, #C084FC 100%)',
                      borderRadius: '999px',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7E22CE', minWidth: '70px', textAlign: 'right' }}>
                  +{item.growth}% YoY
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Existing Supplementary Hiring Insights */}
        <section style={{ ...panelStyle, marginBottom: '1.5rem' }}>
          <label htmlFor="bulk-hiring-search" style={{ display: 'block', fontWeight: 700, fontSize: '.9rem', marginBottom: '.45rem' }}>
            Regional Role + Location Search
          </label>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 230, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <select
                id="bulk-hiring-search"
                value={selected}
                onChange={(event) => setSelected(Number(event.target.value))}
                style={{ width: '100%', padding: '.7rem .7rem .7rem 2rem', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}
              >
                {BULK_HIRING_INSIGHTS.map((item, index) => (
                  <option value={index} key={`${item.role}-${item.location}`}>
                    {item.role} · {item.location}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ padding: '.7rem .9rem', borderRadius: 8, background: '#ecfdf5', color: '#047857', fontWeight: 700 }}>
              Preview Result
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.9rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748b', fontSize: '.82rem' }}>Matched Candidates</span>
              <strong style={{ display: 'block', fontSize: '1.6rem', marginTop: '.25rem' }}>{insight.matchedCandidates}</strong>
              <small style={{ color: '#64748b' }}>Demo count for {insight.location}</small>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.9rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748b', fontSize: '.82rem' }}>Average Readiness</span>
              <strong style={{ display: 'block', fontSize: '1.6rem', marginTop: '.25rem' }}>{insight.averageReadiness}%</strong>
              <small style={{ color: '#047857' }}>Near-match candidate pool</small>
            </div>
          </div>
        </section>

        {/* Missing Skills Insights & Contact */}
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0, fontSize: '1.08rem' }}>Top Missing Skills Among Near Matches</h2>
          <p style={{ color: '#64748b', fontSize: '.84rem' }}>
            Use these insights to tune requirements or plan targeted training partnerships with local ITIs.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', margin: '1.1rem 0 1.4rem' }}>
            {insight.topMissingSkills.map((skill) => (
              <span key={skill} style={{ padding: '.45rem .7rem', borderRadius: 99, background: '#FAF5FF', color: '#6B21A8', fontWeight: 700, fontSize: '.82rem', border: '1px solid #E9D5FF' }}>
                {skill}
              </span>
            ))}
          </div>
          <button
            type="button"
            disabled
            title="Coming soon: candidate contact will be available in a future release."
            style={{
              padding: '.7rem 1rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              color: '#94a3b8',
              background: '#f8fafc',
              fontWeight: 700,
              cursor: 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.45rem',
            }}
          >
            <Mail size={16} /> Contact Candidates · Coming Soon
          </button>
        </section>
      </main>
    </div>
  );
}
