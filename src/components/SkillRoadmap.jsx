import React from 'react';
import { Check, Compass, Zap, ArrowRight, TrendingUp, Circle } from 'lucide-react';

export default function SkillRoadmap({ role = 'Role', steps = [] }) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const totalCount = steps.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        border: '1px solid #F0F2F5',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* 1. Header & Progress Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#0E4A32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(14, 74, 50, 0.2)',
            }}
          >
            <Compass size={20} color="#34D399" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Skill Roadmap
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: '#F0FDF4',
                  color: '#0E4A32',
                  border: '1px solid #DCFCE7',
                }}
              >
                {role} Path
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
              Step-by-step progression to full role readiness (ordered by impact & market demand)
            </p>
          </div>
        </div>

        {/* Progress Pill / Stat */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, width: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>
              {doneCount}/{totalCount}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
              Steps Mastered ({progressPct}%)
            </span>
          </div>
          {/* Progress Bar Track */}
          <div
            style={{
              width: '100%',
              minWidth: '120px',
              height: '6px',
              borderRadius: '9999px',
              background: '#E5E7EB',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                borderRadius: '9999px',
                background: '#0E4A32',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Legend Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '0.5rem 0.85rem',
          borderRadius: '10px',
          background: '#F9FAFB',
          border: '1px solid #F3F4F6',
          fontSize: '0.75rem',
          color: '#4B5563',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#0E4A32',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={11} strokeWidth={3} />
          </span>
          <span>Mastered</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#10B981',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={11} />
          </span>
          <span style={{ color: '#065F46' }}>Next Target (Highest Impact)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#E5E7EB',
              color: '#6B7280',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
            }}
          >
            #
          </span>
          <span style={{ color: '#6B7280' }}>Upcoming Milestone</span>
        </div>
      </div>

      {/* 3. Step Timeline Path */}
      <div
        className="roadmap-step-grid"
        style={{
          position: 'relative',
        }}
      >
        {steps.map((step, idx) => {
          const isDone = step.status === 'done';
          const isNext = step.status === 'next';
          const isUpcoming = step.status === 'upcoming';
          const isRising = step.demandStatus === 'rising';

          return (
            <div
              key={step.skill}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1rem',
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
                borderRadius: '14px',
                border: isNext
                  ? '2px solid #0E4A32'
                  : isDone
                    ? '1px solid #BBF7D0'
                    : '1px solid #E5E7EB',
                background: isNext
                  ? 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)'
                  : isDone
                    ? '#F9FDFB'
                    : '#FAFAFA',
                boxShadow: isNext
                  ? '0 6px 18px -2px rgba(14, 74, 50, 0.15)'
                  : 'none',
                opacity: isUpcoming ? 0.8 : 1,
                transition: 'all 150ms ease',
              }}
            >
              {/* Top Node & Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', minWidth: 0, flexWrap: 'wrap', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  {/* Circle Node */}
                  <div
                    className={isNext ? 'pulse-ring' : ''}
                    style={{
                      width: '26px',
                      height: '26px',
                      minWidth: '26px',
                      borderRadius: '50%',
                      background: isDone ? '#0E4A32' : isNext ? '#10B981' : '#E5E7EB',
                      color: isDone || isNext ? '#FFFFFF' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? (
                      <Check size={14} strokeWidth={3} />
                    ) : isNext ? (
                      <Zap size={13} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isDone ? '#0E4A32' : isNext ? '#065F46' : '#9CA3AF',
                    }}
                  >
                    {isDone ? 'Completed' : isNext ? 'Focus Next' : `Step ${idx + 1}`}
                  </span>
                </div>

                {/* Priority Weight Badge */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: isNext ? '#DCFCE7' : isDone ? '#F0FDF4' : '#F3F4F6',
                    color: isNext ? '#065F46' : isDone ? '#0E4A32' : '#6B7280',
                    flexShrink: 0,
                  }}
                  title={`Critical demand weight: ${step.weight}/10`}
                >
                  wt: {step.weight}
                </span>
              </div>

              {/* Skill Name */}
              <div style={{ margin: '0.25rem 0 0.5rem 0', minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isDone ? '#111827' : isNext ? '#0E4A32' : '#4B5563',
                    margin: 0,
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {step.skill}
                </h4>
              </div>

              {/* Trajectory / Demand Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
                {isRising ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#059669',
                      background: '#ECFDF5',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    <TrendingUp size={11} />
                    <span>Rising Demand</span>
                  </span>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                    {step.demandStatus}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
