import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  color = 'indigo',
  progress = null,
}) {
  const colorMap = {
    indigo: {
      border: 'rgba(99, 102, 241, 0.25)',
      glow: 'rgba(99, 102, 241, 0.15)',
      iconBg: 'rgba(99, 102, 241, 0.12)',
      iconColor: '#818CF8',
      barColor: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
    },
    cyan: {
      border: 'rgba(6, 182, 212, 0.25)',
      glow: 'rgba(6, 182, 212, 0.15)',
      iconBg: 'rgba(6, 182, 212, 0.12)',
      iconColor: '#38BDF8',
      barColor: 'linear-gradient(90deg, #06B6D4, #3B82F6)',
    },
    emerald: {
      border: 'rgba(16, 185, 129, 0.25)',
      glow: 'rgba(16, 185, 129, 0.15)',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#34D399',
      barColor: 'linear-gradient(90deg, #10B981, #059669)',
    },
    purple: {
      border: 'rgba(139, 92, 246, 0.25)',
      glow: 'rgba(139, 92, 246, 0.15)',
      iconBg: 'rgba(139, 92, 246, 0.12)',
      iconColor: '#C084FC',
      barColor: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.25)',
      glow: 'rgba(245, 158, 11, 0.15)',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: '#FBBF24',
      barColor: 'linear-gradient(90deg, #F59E0B, #EF4444)',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.35rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 90% 10%, ${scheme.glow} 0%, rgba(15, 23, 42, 0.7) 70%)`,
        borderColor: scheme.border,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginTop: '0.35rem' }}>
            <h3 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {value}
            </h3>
            {trend && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.15rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: trendPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: trendPositive ? '#34D399' : '#FB7185',
                  border: `1px solid ${trendPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                }}
              >
                {trendPositive ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
                {trend}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: scheme.iconBg,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: scheme.iconColor,
              flexShrink: 0,
            }}
          >
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}
      </div>

      {progress !== null && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                height: '100%',
                background: scheme.barColor,
                borderRadius: '999px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: progress !== null ? '0.5rem' : '0.25rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
