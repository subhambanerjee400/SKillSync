import React, { useState } from 'react';
import { Layers, BarChart3, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SkillChart({
  data = [],
  title = 'Skill Gap & Alignment Matrix',
  subtitle = 'Comparing student verified proficiency vs industry target standards',
  showCurriculum = true,
}) {
  const [viewMode, setViewMode] = useState('radar'); // 'radar' | 'bars'
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeSeries, setActiveSeries] = useState({
    student: true,
    industry: true,
    syllabus: showCurriculum,
  });

  const categories = ['all', ...new Set(data.map((d) => d.category).filter(Boolean))];

  const filteredData = activeCategory === 'all'
    ? data
    : data.filter((d) => d.category === activeCategory);

  // Radar Chart Calculations
  const size = 380;
  const center = size / 2;
  const radius = size * 0.38;
  const numPoints = filteredData.length || 1;
  const angleStep = (Math.PI * 2) / numPoints;

  const getCoordinates = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const getPolygonPoints = (key) => {
    return filteredData
      .map((item, i) => {
        const { x, y } = getCoordinates(item[key] || 0, i);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>

        {/* View mode toggle */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setViewMode('radar')}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: viewMode === 'radar' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'radar' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Layers size={15} />
            Radar View
          </button>
          <button
            onClick={() => setViewMode('bars')}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: viewMode === 'bars' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'bars' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <BarChart3 size={15} />
            Gap Bars
          </button>
        </div>
      </div>

      {/* Series Filter Checkboxes & Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
        }}
      >
        {/* Series Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              color: activeSeries.student ? '#818CF8' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={activeSeries.student}
              onChange={() => setActiveSeries((s) => ({ ...s, student: !s.student }))}
              style={{ accentColor: '#6366F1' }}
            />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366F1' }} />
            Current Proficiency
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              color: activeSeries.industry ? '#38BDF8' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={activeSeries.industry}
              onChange={() => setActiveSeries((s) => ({ ...s, industry: !s.industry }))}
              style={{ accentColor: '#06B6D4' }}
            />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06B6D4' }} />
            Industry Demand Target
          </label>

          {showCurriculum && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                color: activeSeries.syllabus ? '#34D399' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={activeSeries.syllabus}
                onChange={() => setActiveSeries((s) => ({ ...s, syllabus: !s.syllabus }))}
                style={{ accentColor: '#10B981' }}
              />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              Curriculum Syllabus
            </label>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 2 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: activeCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeCategory === cat ? '#A5B4FC' : 'var(--text-muted)',
                  border: `1px solid ${activeCategory === cat ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Visualization Canvas */}
      {viewMode === 'radar' ? (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '380px' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
            {/* Concentric benchmark rings */}
            {[25, 50, 75, 100].map((level) => {
              const r = (level / 100) * radius;
              return (
                <g key={level}>
                  <circle
                    cx={center}
                    cy={center}
                    r={r}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.12)"
                    strokeWidth="1"
                    strokeDasharray={level === 100 ? 'none' : '3 3'}
                  />
                  <text
                    x={center + 4}
                    y={center - r + 12}
                    fill="rgba(148, 163, 184, 0.4)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {/* Radial axis lines and labels */}
            {filteredData.map((item, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const lineEnd = getCoordinates(100, i);
              const labelRadius = radius + 24;
              const labelX = center + labelRadius * Math.cos(angle);
              const labelY = center + labelRadius * Math.sin(angle);

              return (
                <g key={item.skill || i}>
                  <line
                    x1={center}
                    y1={center}
                    x2={lineEnd.x}
                    y2={lineEnd.y}
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeWidth="1"
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--text-secondary)"
                    fontSize="11"
                    fontWeight="600"
                    style={{ cursor: 'default' }}
                  >
                    {item.skill}
                  </text>
                </g>
              );
            })}

            {/* Curriculum Area */}
            {showCurriculum && activeSeries.syllabus && (
              <polygon
                points={getPolygonPoints('syllabus')}
                fill="rgba(16, 185, 129, 0.1)"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            )}

            {/* Industry Requirement Polygon */}
            {activeSeries.industry && (
              <polygon
                points={getPolygonPoints('industry')}
                fill="rgba(6, 182, 212, 0.15)"
                stroke="#06B6D4"
                strokeWidth="2"
              />
            )}

            {/* Student Current Polygon */}
            {activeSeries.student && (
              <polygon
                points={getPolygonPoints('student')}
                fill="rgba(99, 102, 241, 0.3)"
                stroke="#6366F1"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))"
              />
            )}

            {/* Points & Interactive Tooltips */}
            {filteredData.map((item, i) => {
              const studentCoord = getCoordinates(item.student, i);
              const industryCoord = getCoordinates(item.industry, i);

              return (
                <g key={i}>
                  {activeSeries.industry && (
                    <circle
                      cx={industryCoord.x}
                      cy={industryCoord.y}
                      r="4.5"
                      fill="#06B6D4"
                      stroke="#0F172A"
                      strokeWidth="2"
                    />
                  )}
                  {activeSeries.student && (
                    <circle
                      cx={studentCoord.x}
                      cy={studentCoord.y}
                      r="5.5"
                      fill="#818CF8"
                      stroke="#0F172A"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={() => setHoveredPoint(item)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(10px)',
                minWidth: '200px',
                zIndex: 10,
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                {hoveredPoint.skill}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#818CF8' }}>
                  <span>Current:</span>
                  <strong>{hoveredPoint.student}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8' }}>
                  <span>Target:</span>
                  <strong>{hoveredPoint.industry}%</strong>
                </div>
                {showCurriculum && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399' }}>
                    <span>Syllabus:</span>
                    <strong>{hoveredPoint.syllabus}%</strong>
                  </div>
                )}
                <div
                  style={{
                    marginTop: '0.4rem',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    color: hoveredPoint.student >= hoveredPoint.industry ? '#34D399' : '#FB7185',
                  }}
                >
                  <span>Alignment Delta:</span>
                  <span>{hoveredPoint.student - hoveredPoint.industry > 0 ? `+${hoveredPoint.student - hoveredPoint.industry}%` : `${hoveredPoint.student - hoveredPoint.industry}%`}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Gap Bars Comparative View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '0.5rem' }}>
          {filteredData.map((item) => {
            const gap = item.industry - item.student;
            const isMet = gap <= 0;

            return (
              <div
                key={item.skill}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isMet ? (
                      <CheckCircle2 size={16} color="#34D399" />
                    ) : (
                      <AlertTriangle size={16} color="#FB7185" />
                    )}
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {item.skill}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.category})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        background: isMet ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: isMet ? '#34D399' : '#FB7185',
                        border: `1px solid ${isMet ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      }}
                    >
                      {isMet ? 'Target Met' : `${gap}% Gap to Bridge`}
                    </span>
                  </div>
                </div>

                {/* Comparative Double/Triple Progress Track */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {/* Current */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <span style={{ width: '80px', color: '#818CF8', fontWeight: 600 }}>Student: {item.student}%</span>
                    <div style={{ flex: 1, height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.student}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6366F1, #818CF8)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Industry Target */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <span style={{ width: '80px', color: '#38BDF8', fontWeight: 600 }}>Target: {item.industry}%</span>
                    <div style={{ flex: 1, height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.industry}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #06B6D4, #38BDF8)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Syllabus */}
                  {showCurriculum && item.syllabus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                      <span style={{ width: '80px', color: '#34D399', fontWeight: 600 }}>Syllabus: {item.syllabus}%</span>
                      <div style={{ flex: 1, height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${item.syllabus}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #10B981, #34D399)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
