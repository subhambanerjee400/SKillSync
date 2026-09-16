import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function ScoreCard({ score = 84, label = 'Frontend Developer readiness' }) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Arc calculations for circular donut ring matching Donezo's "Project Progress"
  const radius = 68;
  const stroke = 18;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Segment proportions
  const completedOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #F0F2F5',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Readiness Score
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '2px 0 0 0' }}>
            Deterministic skill-demand index
          </p>
        </div>
        <button
          type="button"
          style={{
            color: '#9CA3AF',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Donut Chart Canvas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0.75rem 0',
        }}
      >
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <pattern id="diagonalHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#D1D5DB" strokeWidth="2.5" />
              </pattern>
            </defs>

            {/* Inactive / Pending Background Segment */}
            <circle
              stroke="#E5E7EB"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Pattern overlay for pending */}
            <circle
              stroke="url(#diagonalHatch)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * 0.4}
              opacity={0.6}
            />

            {/* Secondary Active Track Segment */}
            <circle
              stroke="#15803D"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference - ((clampedScore + 8) / 100) * circumference}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
              opacity={0.3}
            />

            {/* Primary Dark Green Segment */}
            <circle
              stroke="#0E4A32"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={completedOffset}
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Value and Label */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {clampedScore}%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginTop: '4px' }}>
              Readiness
            </span>
          </div>
        </div>

        {/* Legend row matching Donezo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4B5563', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0E4A32' }} />
            <span>Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4B5563', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#15803D' }} />
            <span>In Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4B5563', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D1D5DB' }} />
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Readiness Label Footer */}
      <div
        style={{
          borderTop: '1px solid #F3F4F6',
          paddingTop: '0.85rem',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
          {label}
        </span>
      </div>
    </div>
  );
}
