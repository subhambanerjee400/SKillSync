import React, { useState } from 'react';
import { Clock, Award, Star, ExternalLink, Check, Sparkles, BookOpen } from 'lucide-react';

export default function RecommendationCard({
  course,
  onEnroll,
}) {
  const [isEnrolled, setIsEnrolled] = useState(course.enrolled || false);

  const handleEnrollClick = (e) => {
    e.preventDefault();
    setIsEnrolled(!isEnrolled);
    if (onEnroll) onEnroll(course, !isEnrolled);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        background: isEnrolled
          ? 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 70%)'
          : 'var(--bg-card)',
        borderColor: isEnrolled ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)',
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#A5B4FC',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Sparkles size={12} />
            {course.badge || 'Recommended'}
          </span>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={13} fill="#FBBF24" color="#FBBF24" />
            <strong style={{ color: 'var(--text-primary)' }}>{course.rating}</strong>
          </span>
        </div>

        {/* Title & Provider */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.35 }}>
          {course.title}
        </h4>
        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <BookOpen size={14} color="var(--primary-light)" />
          {course.provider}
        </p>

        {/* Gap Reduction Metric */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 0.85rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Skill
            </span>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {course.skillTarget}
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#34D399',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            {course.gapReduction}
          </span>
        </div>

        {/* Meta tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} />
            {course.duration}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Award size={13} />
            {course.level}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleEnrollClick}
        style={{
          width: '100%',
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 600,
          background: isEnrolled ? 'rgba(16, 185, 129, 0.15)' : 'var(--grad-primary)',
          color: isEnrolled ? '#34D399' : '#fff',
          border: isEnrolled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: isEnrolled ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {isEnrolled ? (
          <>
            <Check size={16} strokeWidth={2.5} />
            Enrolled (In Progress)
          </>
        ) : (
          <>
            <span>Start Learning Pathway</span>
            <ExternalLink size={14} />
          </>
        )}
      </button>
    </div>
  );
}
