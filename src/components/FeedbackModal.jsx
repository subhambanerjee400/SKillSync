import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  MessageSquare,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { submitFeedback, RELEVANCE_OPTIONS } from '../lib/feedback';

export default function FeedbackModal({
  isOpen,
  onClose,
  userId,
  userSkills = [],
  missingSkills = [],
  role = 'Target Role',
  onFeedbackSubmitted,
}) {
  const [overallRating, setOverallRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [relevanceRating, setRelevanceRating] = useState('Highly Relevant');
  const [selectedImproved, setSelectedImproved] = useState([]);
  const [selectedStillNeeded, setSelectedStillNeeded] = useState([]);
  const [customImproved, setCustomImproved] = useState('');
  const [customStillNeeded, setCustomStillNeeded] = useState('');
  const [writtenFeedback, setWrittenFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMsg('');
      setOverallRating(5);
      setRelevanceRating('Highly Relevant');
      // Pre-select first missing skill as initial target if available
      setSelectedStillNeeded(missingSkills.slice(0, 2));
      setSelectedImproved(userSkills.slice(0, 2));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleImprovedSkill = (skill) => {
    setSelectedImproved((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomImproved = (e) => {
    e.preventDefault();
    const clean = customImproved.trim();
    if (clean && !selectedImproved.includes(clean)) {
      setSelectedImproved((prev) => [...prev, clean]);
      setCustomImproved('');
    }
  };

  const toggleStillNeededSkill = (skill) => {
    setSelectedStillNeeded((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomStillNeeded = (e) => {
    e.preventDefault();
    const clean = customStillNeeded.trim();
    if (clean && !selectedStillNeeded.includes(clean)) {
      setSelectedStillNeeded((prev) => [...prev, clean]);
      setCustomStillNeeded('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!writtenFeedback.trim()) {
      setErrorMsg('Please write a short comment about your training or career recommendation experience.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        userId,
        overallRating,
        relevanceRating,
        skillsImproved: selectedImproved,
        skillsStillNeeded: selectedStillNeeded,
        writtenFeedback: writtenFeedback.trim(),
        suggestions: suggestions.trim() || null,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(result.data);
      }

      // Auto close after 2.2 seconds if user doesn't close manually
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: '1 - Needs Major Improvement',
    2: '2 - Below Expectations',
    3: '3 - Satisfactory / Average',
    4: '4 - Very Good',
    5: '5 - Outstanding / Highly Effective',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          animation: 'fadeIn 180ms ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAFAFA',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h2
                id="feedback-modal-title"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}
              >
                Share Recommendation Feedback
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                Your insights directly refine SkillSync training pathways for {role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {isSuccess ? (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <CheckCircle2 size={34} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Thank You for Your Feedback!
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', maxWidth: '380px', lineHeight: 1.5 }}>
                Your ratings and skill progress report have been saved. They will help tailor future pathway recommendations.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: '1rem',
                  padding: '0.65rem 1.75rem',
                  borderRadius: '10px',
                  background: '#0E4A32',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              {errorMsg && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    color: '#B91C1C',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Overall Rating (1-5 Stars) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                  1. Overall Experience Rating *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (hoverRating || overallRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          color: filled ? '#F59E0B' : '#CBD5E1',
                          transition: 'transform 100ms ease, color 150ms ease',
                        }}
                      >
                        <Star size={26} fill={filled ? '#F59E0B' : 'transparent'} />
                      </button>
                    );
                  })}
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginLeft: '0.5rem' }}>
                    {ratingDescriptions[hoverRating || overallRating]}
                  </span>
                </div>
              </div>

              {/* 2. Relevance of recommendation */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.3rem' }}>
                  2. How relevant was this to your recommended skill gap? *
                </label>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: '#64748B' }}>
                  Rate how well the recommended training or institutes aligned with your target trade/career.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {RELEVANCE_OPTIONS.map((opt) => {
                    const active = relevanceRating === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setRelevanceRating(opt)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: active ? 700 : 500,
                          border: active ? '1.5px solid #0E4A32' : '1px solid #E2E8F0',
                          background: active ? '#ECFDF5' : '#FFFFFF',
                          color: active ? '#065F46' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 120ms ease',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Skills they improved */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
                  3. Skills you improved through this training / pathway
                </label>
                <p style={{ margin: '0 0 0.45rem', fontSize: '0.78rem', color: '#64748B' }}>
                  Click to select competencies you strengthened, or type below to add custom skills.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {Array.from(new Set([...userSkills, ...selectedImproved])).map((s) => {
                    const sel = selectedImproved.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleImprovedSkill(s)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: sel ? 700 : 500,
                          background: sel ? '#ECFDF5' : '#F8FAFC',
                          color: sel ? '#047857' : '#64748B',
                          border: sel ? '1px solid #10B981' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                        }}
                      >
                        {sel ? '✓ ' : '+ '}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={customImproved}
                    onChange={(e) => setCustomImproved(e.target.value)}
                    placeholder="Add other skill improved..."
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCustomImproved(e);
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomImproved}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 4. Skills they still need to improve */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
                  4. Skills you still need to improve
                </label>
                <p style={{ margin: '0 0 0.45rem', fontSize: '0.78rem', color: '#64748B' }}>
                  Select residual gaps or future topics you want more courses/institutes recommended for.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {Array.from(new Set([...missingSkills, ...selectedStillNeeded])).map((s) => {
                    const sel = selectedStillNeeded.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleStillNeededSkill(s)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: sel ? 700 : 500,
                          background: sel ? '#FFF7ED' : '#F8FAFC',
                          color: sel ? '#C2410C' : '#64748B',
                          border: sel ? '1px solid #F97316' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                        }}
                      >
                        {sel ? '✓ ' : '+ '}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={customStillNeeded}
                    onChange={(e) => setCustomStillNeeded(e.target.value)}
                    placeholder="Add other skill still needed..."
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.75rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCustomStillNeeded(e);
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomStillNeeded}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 5. Short written feedback */}
              <div>
                <label
                  htmlFor="written-feedback-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.3rem' }}
                >
                  5. Short Written Feedback *
                </label>
                <textarea
                  id="written-feedback-input"
                  rows={3}
                  required
                  value={writtenFeedback}
                  onChange={(e) => setWrittenFeedback(e.target.value)}
                  placeholder="e.g. The solar panel installation training covered safety and hands-on wiring thoroughly. Would recommend adding more DC inverter troubleshooting practice."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* 6. Optional suggestions */}
              <div>
                <label
                  htmlFor="suggestions-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.3rem' }}
                >
                  6. Suggestions for Future Recommendations (Optional)
                </label>
                <textarea
                  id="suggestions-input"
                  rows={2}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="e.g. Include more weekend or evening batches for working apprentices."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Submit / Cancel buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    background: '#0E4A32',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(14, 74, 50, 0.25)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={15} />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
