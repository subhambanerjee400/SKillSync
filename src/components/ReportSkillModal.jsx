import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Building2,
  Briefcase,
  TrendingUp,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function ReportSkillModal({
  isOpen,
  onClose,
  role = 'institution', // 'institution' | 'industry_partner'
  onSubmit,
}) {
  const isInstitution = role === 'institution';

  // Institution form state
  const [instSkillName, setInstSkillName] = useState('');
  const [instTrade, setInstTrade] = useState('Electrician');
  const [instTrend, setInstTrend] = useState('Rising');
  const [instTrainees, setInstTrainees] = useState('30');
  const [instPartners, setInstPartners] = useState('');
  const [instStatus, setInstStatus] = useState('Pilot / Elective');
  const [instNotes, setInstNotes] = useState('');

  // Industry Partner form state
  const [indSkillName, setIndSkillName] = useState('');
  const [indSector, setIndSector] = useState('Industrial Automation & Robotics');
  const [indTrend, setIndTrend] = useState('Rising');
  const [indOpenings, setIndOpenings] = useState('15');
  const [indExp, setIndExp] = useState('Entry / Fresh ITI Graduate');
  const [indInstitutes, setIndInstitutes] = useState('');
  const [indNotes, setIndNotes] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isInstitution) {
        setInstSkillName('');
        setInstTrade('Electrician');
        setInstTrend('Rising');
        setInstTrainees('30');
        setInstPartners('');
        setInstStatus('Pilot / Elective');
        setInstNotes('');
      } else {
        setIndSkillName('');
        setIndSector('Industrial Automation & Robotics');
        setIndTrend('Rising');
        setIndOpenings('15');
        setIndExp('Entry / Fresh ITI Graduate');
        setIndInstitutes('');
        setIndNotes('');
      }
    }
  }, [isOpen, isInstitution]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInstitution) {
      if (!instSkillName.trim()) return;
      const newSkill = {
        id: Date.now(),
        name: instSkillName.trim(),
        trade: instTrade,
        trend: instTrend,
        trainees: parseInt(instTrainees, 10) || 0,
        partners: instPartners.trim(),
        status: instStatus,
        notes: instNotes.trim(),
      };
      if (onSubmit) onSubmit(newSkill);
    } else {
      if (!indSkillName.trim()) return;
      const newSkill = {
        id: Date.now(),
        name: indSkillName.trim(),
        sector: indSector,
        trend: indTrend,
        openings: parseInt(indOpenings, 10) || 0,
        experienceLevel: indExp,
        targetInstitutes: indInstitutes.trim(),
        notes: indNotes.trim(),
      };
      if (onSubmit) onSubmit(newSkill);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-skill-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          color: '#0F172A',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(15, 23, 42, 0.08)',
          border: '1px solid #CBD5E1',
          position: 'relative',
          zIndex: 10000,
          opacity: 1,
          overflow: 'hidden',
          animation: 'fadeIn 180ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            background: isInstitution
              ? 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)'
              : 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                background: isInstitution ? '#047857' : '#7E22CE',
                color: '#FFFFFF',
                flexShrink: 0,
                marginTop: '0.1rem',
              }}
            >
              {isInstitution ? <Building2 size={20} /> : <Briefcase size={20} />}
            </span>
            <div>
              <h2
                id="report-skill-modal-title"
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  lineHeight: 1.3,
                }}
              >
                {isInstitution ? 'Report a New Emerging Skill' : 'Report an Emerging Skill in Demand'}
              </h2>
              <p
                style={{
                  margin: '0.35rem 0 0',
                  color: '#475569',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                }}
              >
                {isInstitution
                  ? 'Log a high-growth skill your institute plans to teach or is piloting to inform regional curriculum calibration.'
                  : 'Tell SkillSync what skills your enterprise struggles to find in regional applicants to guide vocational training.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E2E8F0';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {isInstitution ? (
            /* Institution Form Fields */
            <>
              <div>
                <label
                  htmlFor="modal-inst-skill-name"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Skill Name *
                </label>
                <input
                  id="modal-inst-skill-name"
                  type="text"
                  required
                  placeholder="e.g. Battery Management Systems (BMS) Diagnostics"
                  value={instSkillName}
                  onChange={(e) => setInstSkillName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label
                    htmlFor="modal-inst-trade"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Vocational Trade
                  </label>
                  <select
                    id="modal-inst-trade"
                    value={instTrade}
                    onChange={(e) => setInstTrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Fitter / Machinist">Fitter / Machinist</option>
                    <option value="Welder">Welder</option>
                    <option value="Automotive / EV">Automotive / EV</option>
                    <option value="Industrial Electronics">Industrial Electronics</option>
                    <option value="Other Emerging Field">Other Emerging Field</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="modal-inst-trend"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Growth / Demand Trend
                  </label>
                  <select
                    id="modal-inst-trend"
                    value={instTrend}
                    onChange={(e) => setInstTrend(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  >
                    <option value="Rising">Rising Demand (High Priority)</option>
                    <option value="Stable">Stable / Core Curriculum</option>
                    <option value="Declining">Declining / Phasing Out</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label
                    htmlFor="modal-inst-trainees"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Current Trainees Enrolled
                  </label>
                  <input
                    id="modal-inst-trainees"
                    type="number"
                    min="0"
                    max="5000"
                    value={instTrainees}
                    onChange={(e) => setInstTrainees(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-inst-status"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Curriculum Status
                  </label>
                  <select
                    id="modal-inst-status"
                    value={instStatus}
                    onChange={(e) => setInstStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  >
                    <option value="Active Course">Active Course</option>
                    <option value="Pilot / Elective">Pilot / Elective Module</option>
                    <option value="Under Curriculum Committee Review">Under Committee Review</option>
                    <option value="Proposed for Next Academic Year">Proposed Next Academic Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-inst-partners"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Target Industry Partners (Optional)
                </label>
                <input
                  id="modal-inst-partners"
                  type="text"
                  placeholder="e.g. WBSEDCL, Tata Power, Tata Motors, L&T"
                  value={instPartners}
                  onChange={(e) => setInstPartners(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="modal-inst-notes"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Additional Context & Syllabus Notes (Optional)
                </label>
                <textarea
                  id="modal-inst-notes"
                  rows={3}
                  placeholder="Describe lab equipment required, industry apprenticeship tie-ups, or certifications provided."
                  value={instNotes}
                  onChange={(e) => setInstNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            </>
          ) : (
            /* Industry Partner Form Fields */
            <>
              <div>
                <label
                  htmlFor="modal-ind-skill-name"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Skill / Competency Name *
                </label>
                <input
                  id="modal-ind-skill-name"
                  type="text"
                  required
                  placeholder="e.g. PLC Automation & SCADA Diagnostics"
                  value={indSkillName}
                  onChange={(e) => setIndSkillName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label
                    htmlFor="modal-ind-sector"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Industry Sector
                  </label>
                  <select
                    id="modal-ind-sector"
                    value={indSector}
                    onChange={(e) => setIndSector(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  >
                    <option value="Green Energy & EV">Green Energy & EV</option>
                    <option value="Industrial Automation & Robotics">Industrial Automation & Robotics</option>
                    <option value="Advanced Manufacturing & CNC">Advanced Manufacturing & CNC</option>
                    <option value="Construction & Heavy Machinery">Construction & Heavy Machinery</option>
                    <option value="IT & Embedded Electronics">IT & Embedded Electronics</option>
                    <option value="Logistics & Cold Chain">Logistics & Cold Chain</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="modal-ind-trend"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Urgency / Demand Trend
                  </label>
                  <select
                    id="modal-ind-trend"
                    value={indTrend}
                    onChange={(e) => setIndTrend(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  >
                    <option value="Rising">Rising Rapidly (Critical Talent Gap)</option>
                    <option value="Stable">Stable / Ongoing Hiring Need</option>
                    <option value="Declining">Declining / Gradual Phaseout</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label
                    htmlFor="modal-ind-openings"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Immediate Openings / Open Positions
                  </label>
                  <input
                    id="modal-ind-openings"
                    type="number"
                    min="1"
                    max="1000"
                    value={indOpenings}
                    onChange={(e) => setIndOpenings(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-ind-exp"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                  >
                    Minimum Experience Required
                  </label>
                  <select
                    id="modal-ind-exp"
                    value={indExp}
                    onChange={(e) => setIndExp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  >
                    <option value="Entry / Fresh ITI Graduate">Entry / Fresh ITI Graduate</option>
                    <option value="1-2 Years Apprenticeship">1-2 Years Apprenticeship</option>
                    <option value="3-5 Years Experienced Technician">3-5 Years Experienced Technician</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-ind-institutes"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Target Partner Training Institutions (Optional)
                </label>
                <input
                  id="modal-ind-institutes"
                  type="text"
                  placeholder="e.g. Govt ITI Tollygunge, Howrah Homes ITI, Ramakrishna Mission"
                  value={indInstitutes}
                  onChange={(e) => setIndInstitutes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="modal-ind-notes"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Competency Specification & Hiring Notes (Optional)
                </label>
                <textarea
                  id="modal-ind-notes"
                  rows={3}
                  placeholder="Specific test requirements, expected tool proficiencies, or upcoming plant commissioning roles."
                  value={indNotes}
                  onChange={(e) => setIndNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            </>
          )}

          {/* Modal Action Buttons */}
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: isInstitution ? '#047857' : '#7E22CE',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isInstitution
                  ? '0 4px 12px rgba(4, 120, 87, 0.25)'
                  : '0 4px 12px rgba(126, 34, 206, 0.25)',
              }}
            >
              <PlusCircle size={17} />
              {isInstitution ? 'Report Emerging Skill' : 'Report In-Demand Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
