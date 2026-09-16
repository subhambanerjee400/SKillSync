import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, Check, Plus, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { calculateScore } from '../lib/scoring';

export default function ScoreSimulator({
  currentScore = 0,
  userSkills = [],
  requiredSkills = [],
  missingSkills = [],
  missingDetails = [],
}) {
  // Local set of skill names that the user has toggled "on" in the simulation
  const [simulatedSkills, setSimulatedSkills] = useState(() => new Set());

  // Count-up animation state for the displayed simulated score
  const [displayedScore, setDisplayedScore] = useState(currentScore);
  const animRef = useRef(null);

  // Map of skill name to details (weight, demandStatus) for quick lookup
  const detailsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(missingDetails)) {
      missingDetails.forEach((d) => {
        if (d && d.name) map.set(d.name.trim().toLowerCase(), d);
      });
    }
    return map;
  }, [missingDetails]);

  // Compute live simulated score deterministically using existing calculateScore()
  const targetSimulatedScore = useMemo(() => {
    if (simulatedSkills.size === 0) {
      return currentScore;
    }
    // Combine real user skills with the temporary simulated additions
    const tempSkills = [...userSkills, ...Array.from(simulatedSkills)];
    const result = calculateScore(tempSkills, requiredSkills);
    return result.score;
  }, [simulatedSkills, userSkills, requiredSkills, currentScore]);

  // Smooth count-up / count-down animation whenever targetSimulatedScore changes
  useEffect(() => {
    const startValue = displayedScore;
    const endValue = targetSimulatedScore;
    if (startValue === endValue) return;

    const duration = 400; // ms
    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * ease);
      setDisplayedScore(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayedScore(endValue);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetSimulatedScore]);

  // Reset displayedScore if currentScore changes externally (e.g. role switch)
  useEffect(() => {
    if (simulatedSkills.size === 0) {
      setDisplayedScore(currentScore);
    }
  }, [currentScore, simulatedSkills.size]);

  // Toggle skill on/off
  const toggleSkill = (skill) => {
    setSimulatedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  // Clear all simulated skills
  const handleReset = () => {
    setSimulatedSkills(new Set());
  };

  const delta = displayedScore - currentScore;
  const isSimulating = simulatedSkills.size > 0;

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
      {/* 1. Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#F0FDF4',
              color: '#0E4A32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(14, 74, 50, 0.1)',
            }}
          >
            <Sparkles size={20} color="#0E4A32" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Score Simulator
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: isSimulating ? '#ECFDF5' : '#F3F4F6',
                  color: isSimulating ? '#059669' : '#6B7280',
                  border: isSimulating ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                }}
              >
                {isSimulating ? 'Sandbox Active' : 'What-If Mode'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
              Try it: see how your score changes as you learn new skills
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          disabled={!isSimulating}
          aria-label="Reset simulation to real score"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            minHeight: '44px',
            padding: '0.45rem 1rem',
            borderRadius: '9999px',
            border: '1px solid #E5E7EB',
            background: isSimulating ? '#FFFFFF' : '#F9FAFB',
            color: isSimulating ? '#374151' : '#9CA3AF',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: isSimulating ? 'pointer' : 'not-allowed',
            transition: 'all 150ms ease',
            opacity: isSimulating ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (isSimulating) {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }
          }}
          onMouseLeave={(e) => {
            if (isSimulating) {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }
          }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* 2. Score Projection Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: 'clamp(0.85rem, 2vw, 1.25rem)',
          borderRadius: '14px',
          background: isSimulating ? 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)' : '#F9FAFB',
          border: isSimulating ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
          transition: 'all 200ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Current Score */}
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Real Score
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
              {currentScore}%
            </span>
          </div>

          <ArrowRight size={18} color="#9CA3AF" />

          {/* Simulated Score */}
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: isSimulating ? '#065F46' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Simulated Score
            </span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: isSimulating ? '#0E4A32' : '#6B7280',
                lineHeight: 1.1,
                transition: 'color 150ms ease',
              }}
            >
              {displayedScore}%
            </span>
          </div>
        </div>

        {/* Delta Callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSimulating ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                background: '#0E4A32',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(14, 74, 50, 0.25)',
              }}
            >
              <TrendingUp size={14} color="#34D399" />
              <span>+{delta}% Potential Increase</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic' }}>
              Click missing skills below to project readiness gain
            </span>
          )}
        </div>
      </div>

      {/* 3. Missing Skills Interactive Toggle Pills */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
            Toggle Skills to Simulate Mastery ({simulatedSkills.size} of {missingSkills.length} selected):
          </span>
        </div>

        {missingSkills.length === 0 ? (
          <div
            style={{
              padding: '1.25rem',
              textAlign: 'center',
              borderRadius: '12px',
              background: '#F9FAFB',
              border: '1px dashed #E5E7EB',
              color: '#059669',
              fontSize: '0.825rem',
              fontWeight: 600,
            }}
          >
            🎉 You have already acquired all core required skills for this role!
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingSkills.map((skill) => {
              const isSelected = simulatedSkills.has(skill);
              const detail = detailsMap.get(skill.trim().toLowerCase());
              const isRising = detail?.demandStatus === 'rising';
              const weight = detail?.weight;

              return (
                <button
                  key={skill}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    minHeight: '44px',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '9999px',
                    border: isSelected ? '1.5px solid #0E4A32' : '1px solid #E5E7EB',
                    background: isSelected ? '#0E4A32' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 3px 10px rgba(14, 74, 50, 0.2)'
                      : '0 1px 3px rgba(0, 0, 0, 0.02)',
                    transition: 'all 150ms ease',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#0E4A32';
                      e.currentTarget.style.background = '#F0FDF4';
                      e.currentTarget.style.color = '#0E4A32';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                >
                  {/* Icon indicator */}
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#FFFFFF' : '#6B7280',
                    }}
                  >
                    {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                  </span>

                  <span>{skill}</span>

                  {/* Weight / Rising pill */}
                  {weight !== undefined && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.22)' : '#F3F4F6',
                        color: isSelected ? '#A7F3D0' : '#6B7280',
                      }}
                    >
                      {isRising ? `+${weight} (rising)` : `+${weight}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Footnote Disclaimer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid #F3F4F6',
          fontSize: '0.75rem',
          color: '#9CA3AF',
        }}
      >
        <Info size={13} style={{ flexShrink: 0 }} />
        <span>
          Purely illustrative client-side sandbox. Simulating skills does not write to your profile or historical records.
        </span>
      </div>
    </div>
  );
}
