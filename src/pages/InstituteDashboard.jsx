import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import {
  INSTITUTE_DEPARTMENT_DATA,
  INSTITUTE_CURRICULUM_GAPS,
} from '../data/demoData';
import {
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle,
  FileCheck,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  BookMarked,
  Sparkles,
} from 'lucide-react';

export default function InstituteDashboard() {
  const { user } = useAuth();
  const [curriculumScore, setCurriculumScore] = useState(78);
  const [gaps, setGaps] = useState(INSTITUTE_CURRICULUM_GAPS);
  const [departments, setDepartments] = useState(INSTITUTE_DEPARTMENT_DATA);
  const [approvedGaps, setApprovedGaps] = useState({});

  const handleApproveRevision = (gapId) => {
    setApprovedGaps((prev) => ({ ...prev, [gapId]: true }));
    setCurriculumScore((prev) => Math.min(100, prev + 2));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner / Institute Hero */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-success">Accreditation & Curriculum Suite</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {user?.accreditation || 'ABET & NBA Tier-1 Verified'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              {user?.name || 'Apex Institute of Technology'}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '700px' }}>
              Real-time curriculum alignment against 2026 hiring partner tech stacks. Aggregate telemetry covers <strong>1,420 students</strong> across 4 engineering departments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => alert('Exporting curriculum accreditation mapping report (ABET Format)...')}
              className="btn-secondary"
            >
              <FileCheck size={16} />
              <span>Export ABET Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Curriculum Market Alignment"
          value={`${curriculumScore}%`}
          trend="+5% YoY"
          trendPositive={true}
          icon={TrendingUp}
          color="emerald"
          progress={curriculumScore}
          subtitle="Benchmarked against 48 hiring partners"
        />
        <StatCard
          title="Placement Readiness Index"
          value="83%"
          trend="+8% from 2025"
          trendPositive={true}
          icon={Award}
          color="indigo"
          progress={83}
          subtitle="420 ready to hire immediately"
        />
        <StatCard
          title="Total Enrolled Students"
          value="1,420"
          trend="4 Cohorts"
          trendPositive={true}
          icon={Users}
          color="cyan"
          progress={100}
          subtitle="92% active assessment participation"
        />
        <StatCard
          title="Identified Syllabus Gaps"
          value="4 Modules"
          trend="2 Critical"
          trendPositive={false}
          icon={AlertTriangle}
          color="amber"
          progress={45}
          subtitle="Docker & LLM architectures pending"
        />
      </div>

      {/* Department-Wise Alignment Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Departmental Alignment Performance
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Curriculum compliance scores indexed against contemporary industry demand
            </p>
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#34D399', fontWeight: 700 }}>
            Average: 79.8% Compliance
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                <th style={{ padding: '0.75rem 1rem' }}>Students</th>
                <th style={{ padding: '0.75rem 1rem' }}>Market Alignment</th>
                <th style={{ padding: '0.75rem 1rem' }}>Primary Skill Gap</th>
                <th style={{ padding: '0.75rem 1rem' }}>Annual Trend</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.dept}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.875rem',
                    transition: 'background 0.2s',
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {dept.dept}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {dept.students} Students
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '120px', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${dept.alignmentScore}%`,
                            height: '100%',
                            background: dept.alignmentScore >= 80 ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #F59E0B, #EF4444)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 800, color: dept.alignmentScore >= 80 ? '#34D399' : '#FBBF24' }}>
                        {dept.alignmentScore}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#FDA4AF', fontWeight: 500 }}>
                    {dept.topGap}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: dept.trend.startsWith('+') ? '#34D399' : '#FB7185' }}>
                    {dept.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identified Critical Curriculum Gaps & Resolution Recommendations */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Identified Curriculum Discrepancies & Recommendations
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Discovered from recent job postings by partnered employers vs active syllabus documents
            </p>
          </div>
          <span className="badge badge-warning">Actionable Gaps</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {gaps.map((gap) => {
            const isApproved = approvedGaps[gap.id];
            return (
              <div
                key={gap.id}
                className="glass-panel"
                style={{
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isApproved ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                  borderColor: isApproved ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: gap.severity === 'Critical' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: gap.severity === 'Critical' ? '#FB7185' : '#FBBF24',
                        border: `1px solid ${gap.severity === 'Critical' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      }}
                    >
                      {gap.severity} Discrepancy
                    </span>

                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FB7185' }}>
                      {gap.gapSize}% Deficit
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {gap.subject}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Target Course: <strong>{gap.affectedCourse}</strong>
                  </p>

                  {/* Demand vs Coverage Dual Bar */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#38BDF8', fontWeight: 600 }}>Industry Demand: {gap.industryDemand}%</span>
                      <span style={{ color: '#94A3B8', fontWeight: 600 }}>Current Syllabus: {gap.curriculumCoverage}%</span>
                    </div>
                    <div style={{ height: '7px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${gap.curriculumCoverage}%`, background: '#6366F1' }} />
                      <div style={{ width: `${gap.gapSize}%`, background: 'rgba(244, 63, 94, 0.8)' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    <strong style={{ color: '#F8FAFC' }}>Syllabus Recommendation:</strong> {gap.recommendation}
                  </div>
                </div>

                <button
                  onClick={() => handleApproveRevision(gap.id)}
                  disabled={isApproved}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'var(--grad-primary)',
                    color: isApproved ? '#34D399' : '#fff',
                    border: isApproved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: isApproved ? 'default' : 'pointer',
                  }}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle size={15} />
                      Curriculum Update Queued (+2% Alignment)
                    </>
                  ) : (
                    <>
                      <PlusCircle size={15} />
                      Adopt Module Revision in Syllabus
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
