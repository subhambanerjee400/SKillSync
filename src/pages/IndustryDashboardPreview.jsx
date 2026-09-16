import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, LogOut, Mail, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BULK_HIRING_INSIGHTS } from '../data/industryDemoData';

const panelStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' };

export default function IndustryDashboardPreview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const insight = useMemo(() => BULK_HIRING_INSIGHTS[selected], [selected]);
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem clamp(1rem, 4vw, 3rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}><span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#0e4a32' }}><BriefcaseBusiness size={19} color="#fff" /></span><strong>SkillSync</strong><span style={{ color: '#64748b' }}>Employer portal</span></div><button type="button" onClick={handleLogout} style={{ color: '#475569', display: 'inline-flex', gap: '.4rem', alignItems: 'center' }}><LogOut size={16} />Sign out</button></header>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '2rem clamp(1rem, 4vw, 2.5rem)' }}>
        <div style={{ marginBottom: '1.5rem' }}><span style={{ fontSize: '.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Preview data</span><h1 style={{ margin: '.25rem 0', fontSize: '1.8rem' }}>Bulk hiring insight</h1><p style={{ margin: 0, color: '#64748b' }}>Read-only demo for {user?.user_metadata?.full_name || 'your organization'} — no real candidates are contacted.</p></div>
        <section style={{ ...panelStyle, marginBottom: '1rem' }}><label htmlFor="bulk-hiring-search" style={{ display: 'block', fontWeight: 700, fontSize: '.9rem', marginBottom: '.45rem' }}>Role + location search</label><div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}><div style={{ flex: 1, minWidth: 230, position: 'relative' }}><Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} /><select id="bulk-hiring-search" value={selected} onChange={(event) => setSelected(Number(event.target.value))} style={{ width: '100%', padding: '.7rem .7rem .7rem 2rem', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}>{BULK_HIRING_INSIGHTS.map((item, index) => <option value={index} key={`${item.role}-${item.location}`}>{item.role} · {item.location}</option>)}</select></div><span style={{ padding: '.7rem .9rem', borderRadius: 8, background: '#ecfdf5', color: '#047857', fontWeight: 700 }}>Preview result</span></div></section>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1rem' }}><div style={panelStyle}><span style={{ color: '#64748b', fontSize: '.82rem' }}>Matched candidates</span><strong style={{ display: 'block', fontSize: '2rem', marginTop: '.35rem' }}>{insight.matchedCandidates}</strong><small style={{ color: '#64748b' }}>Demo count for {insight.location}</small></div><div style={panelStyle}><span style={{ color: '#64748b', fontSize: '.82rem' }}>Average readiness</span><strong style={{ display: 'block', fontSize: '2rem', marginTop: '.35rem' }}>{insight.averageReadiness}%</strong><small style={{ color: '#047857' }}>Near-match pool</small></div></section>
        <section style={panelStyle}><h2 style={{ marginTop: 0, fontSize: '1.08rem' }}>Top missing skills among near matches</h2><p style={{ color: '#64748b', fontSize: '.84rem' }}>Use these insights to tune requirements or plan targeted training partnerships.</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', margin: '1.1rem 0 1.4rem' }}>{insight.topMissingSkills.map((skill) => <span key={skill} style={{ padding: '.45rem .7rem', borderRadius: 99, background: '#fff7ed', color: '#b45309', fontWeight: 700, fontSize: '.82rem' }}>{skill}</span>)}</div><button type="button" disabled title="Coming soon: candidate contact will be available in a future release." style={{ padding: '.7rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', color: '#94a3b8', background: '#f8fafc', fontWeight: 700, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}><Mail size={16} />Contact candidates · Coming soon</button></section>
      </main>
    </div>
  );
}
