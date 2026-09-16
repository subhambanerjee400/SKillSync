import React, { useState } from 'react';
import { MapPin, DollarSign, CheckCircle, AlertCircle, Send, Briefcase } from 'lucide-react';

export default function JobCard({
  job,
  onApply,
}) {
  const [applied, setApplied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getMatchScoreColor = (score) => {
    if (score >= 90) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.4)' };
    if (score >= 80) return { bg: 'rgba(6, 182, 212, 0.15)', text: '#38BDF8', border: 'rgba(6, 182, 212, 0.4)' };
    return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.4)' };
  };

  const scoreStyle = getMatchScoreColor(job.matchScore);

  const handleApply = (e) => {
    e.preventDefault();
    setApplied(true);
    if (onApply) onApply(job);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.35rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      <div>
        {/* Header: Company & Match Score Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: job.logoBg || '#6366F1',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9375rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                flexShrink: 0,
              }}
            >
              {job.logoText || 'CO'}
            </div>
            <div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                {job.title}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{job.company}</p>
            </div>
          </div>

          {/* Match Score Gauge */}
          <div
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: scoreStyle.bg,
              border: `1px solid ${scoreStyle.border}`,
              color: scoreStyle.text,
              fontSize: '0.8125rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
            }}
          >
            <span>{job.matchScore}% Match</span>
          </div>
        </div>

        {/* Job Attributes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={14} />
            {job.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Briefcase size={14} />
            {job.type}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-light)', fontWeight: 600 }}>
            <DollarSign size={14} />
            {job.salary}
          </span>
        </div>

        {/* Skill Alignment Breakdown */}
        <div style={{ marginBottom: '1.25rem' }}>
          {/* Matched Skills */}
          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
              <CheckCircle size={12} />
              Matched Competencies ({job.matchedSkills?.length || 0})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {job.matchedSkills?.map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#6EE7B7',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing / Gap Skills */}
          {job.missingSkills && job.missingSkills.length > 0 && (
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FB7185', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                <AlertCircle size={12} />
                Missing Required Skills ({job.missingSkills.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {job.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(244, 63, 94, 0.12)',
                      color: '#FDA4AF',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Details & Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Posted {job.postedAgo} • {job.applicants} applicants
        </span>

        <button
          onClick={handleApply}
          disabled={applied}
          style={{
            padding: '0.5rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            background: applied ? 'rgba(16, 185, 129, 0.2)' : 'var(--grad-primary)',
            color: applied ? '#34D399' : '#fff',
            border: applied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: applied ? 'none' : '0 2px 10px rgba(99, 102, 241, 0.3)',
            cursor: applied ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {applied ? (
            <>
              <CheckCircle size={14} />
              Applied with Profile
            </>
          ) : (
            <>
              <span>Instant Apply</span>
              <Send size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
