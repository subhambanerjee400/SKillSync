import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { INSTITUTION_CANDIDATES, INSTITUTION_SKILL_GAPS, INSTITUTION_TRENDS } from '../data/institutionDemoData';

const panelStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' };

export default function InstitutionDashboardPreview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem clamp(1rem, 4vw, 3rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}><span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#0e4a32' }}><Building2 size={19} color="#fff" /></span><strong>SkillBridge</strong><span style={{ color: '#64748b' }}>Institution portal</span></div>
        <button type="button" onClick={handleLogout} style={{ color: '#475569', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}><LogOut size={16} />Sign out</button>
      </header>
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '2rem clamp(1rem, 4vw, 2.5rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Preview data</span><h1 style={{ margin: '0.25rem 0', fontSize: '1.8rem' }}>Regional skill-gap overview</h1><p style={{ margin: 0, color: '#64748b' }}>Read-only demo for {user?.user_metadata?.full_name || 'your institution'} — no candidate records are queried.</p></div>
          <span style={{ alignSelf: 'flex-start', padding: '0.35rem 0.65rem', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: '0.78rem', fontWeight: 700 }}>Demo / preview</span>
        </div>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div style={panelStyle}><span style={{ color: '#64748b', fontSize: '0.82rem' }}>Registered preview candidates</span><strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>148</strong><span style={{ color: '#047857', fontSize: '0.8rem' }}>+12% this month</span></div>
          <div style={panelStyle}><span style={{ color: '#64748b', fontSize: '0.82rem' }}>Average readiness</span><strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>74%</strong><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Across 6 active roles</span></div>
          <div style={panelStyle}><span style={{ color: '#64748b', fontSize: '0.82rem' }}>High-priority gaps</span><strong style={{ display: 'block', fontSize: '1.8rem', marginTop: '0.35rem' }}>3</strong><span style={{ color: '#b45309', fontSize: '0.8rem' }}>Needs curriculum attention</span></div>
        </section>
        <section style={{ ...panelStyle, marginBottom: '1rem' }}><h2 style={{ fontSize: '1.05rem', marginTop: 0 }}>Aggregate skill gaps by role</h2><div style={{ display: 'grid', gap: '0.8rem' }}>{INSTITUTION_SKILL_GAPS.map((gap) => <div key={gap.skill} className="institution-gap-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 2fr auto', gap: '1rem', alignItems: 'center' }}><span><strong>{gap.role}</strong><small style={{ display: 'block', color: '#64748b' }}>{gap.region}</small></span><div style={{ height: 9, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${gap.missingRate}%`, height: '100%', background: '#f59e0b' }} /></div><span style={{ fontWeight: 700 }}>{gap.missingRate}% missing {gap.skill}</span></div>)}</div></section>
        <section className="institution-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, .75fr)', gap: '1rem' }}>
          <div style={panelStyle}><h2 style={{ fontSize: '1.05rem', marginTop: 0, display: 'flex', gap: '.45rem', alignItems: 'center' }}><Users size={18} color="#0e4a32" /> Candidates near you</h2><p style={{ color: '#64748b', fontSize: '.82rem', marginTop: '-.4rem' }}>Anonymized preview data only.</p>{INSTITUTION_CANDIDATES.map((candidate) => <div key={candidate.id} style={{ padding: '.8rem 0', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span><strong>{candidate.label}</strong><small style={{ display: 'block', color: '#64748b' }}>{candidate.role} · {candidate.location}</small></span><strong style={{ color: candidate.readiness >= 75 ? '#047857' : '#b45309' }}>{candidate.readiness}% ready</strong></div>)}</div>
          <div style={panelStyle}><h2 style={{ fontSize: '1.05rem', marginTop: 0, display: 'flex', gap: '.45rem', alignItems: 'center' }}><TrendingUp size={18} color="#0e4a32" /> Skill trends</h2>{INSTITUTION_TRENDS.map((trend) => <div key={trend.skill} style={{ padding: '.8rem 0', borderTop: '1px solid #f1f5f9' }}><strong>{trend.skill}</strong><small style={{ display: 'block', color: trend.status.includes('High') ? '#b45309' : '#64748b', fontWeight: 700 }}>{trend.status}</small><p style={{ color: '#64748b', fontSize: '.8rem', margin: '.35rem 0 0' }}>{trend.note}</p></div>)}</div>
        </section>
      </main>
    </div>
  );
}
