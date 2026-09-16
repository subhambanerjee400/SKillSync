import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import LocationAutocomplete from '../components/LocationAutocomplete';
import {
  Code,
  Wrench,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  MapPin,
  Briefcase,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const SUGGESTED_SKILLS = {
  'Frontend Developer': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'TypeScript',
    'Git',
    'Tailwind CSS',
    'REST APIs',
    'Responsive Design',
    'Web Performance',
    'Cloud Fundamentals (AWS/Vercel/Netlify deployment)',
    'CI/CD Basics',
  ],
  Electrician: [
    'Wiring & Cabling',
    'Circuit Testing',
    'Conduit Bending',
    'Electrical Codes & OSHA',
    'Blueprint Reading',
    'Multimeter Diagnostics',
    'AC/DC Power Systems',
    'Transformer Installation',
  ],
  Plumber: [
    'Pipe Fitting',
    'Soldering & Brazing',
    'Drain & Sewer Cleaning',
    'Plumbing Code Compliance',
    'Blueprint Reading',
    'Leak Detection',
    'Fixture Installation',
    'Water Heater Maintenance',
  ],
  'Data Analyst': [
    'MS Excel',
    'SQL',
    'Data Visualization (Power BI/Tableau)',
    'Python for Data Analysis',
    'Statistics Basics',
    'Manual Data Entry',
  ],
  'EV Technician': [
    'Basic Automotive Mechanics',
    'Traditional Engine Repair',
    'EV Battery Systems',
    'Electric Motor Maintenance',
    'Charging Infrastructure Basics',
    'Electrical Safety',
  ],
  'UI/UX Designer': [
    'Photoshop/Illustrator',
    'Wireframing',
    'Figma',
    'User Research',
    'Prototyping',
    'Design Systems',
  ],
  'Digital Marketing Specialist': [
    'Traditional Advertising',
    'Social Media Posting',
    'SEO',
    'Performance Marketing (Google/Meta Ads)',
    'Analytics Tools (GA4)',
    'AI Marketing Tools',
  ],
  'Blockchain Developer': [
    'JavaScript/TypeScript',
    'Solidity',
    'Smart Contract Development',
    'Web3.js / Ethers.js',
    'Blockchain Fundamentals',
    'Security Auditing Basics',
  ],
};

const EXPERIENCE_OPTIONS = [
  'Beginner (0-1 yrs)',
  'Junior (1-2 yrs)',
  'Mid-Level (3-5 yrs)',
  'Senior (5+ yrs)',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('Software'); // 'Software' | 'Trade'
  const [role, setRole] = useState('Frontend Developer');
  const [experience, setExperience] = useState('Beginner (0-1 yrs)');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // 1. Returning user check: If user already has a profile row, skip onboarding and go straight to /dashboard
  useEffect(() => {
    let isMounted = true;

    async function checkExistingProfile() {
      if (!user?.id) {
        setIsCheckingProfile(false);
        return;
      }

      // Prefill initial name if available from metadata
      const initialName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (user.email ? user.email.split('@')[0] : '');
      if (initialName) {
        setName(initialName);
      }

      try {
        // Query Supabase profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', user.id)
          .maybeSingle();

        if (data && data.id) {
          if (isMounted) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.warn('Checking profile error:', err);
      }

      // Check fallback localStorage
      const cached = localStorage.getItem(`skillsync_profile_${user.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id === user.id) {
            if (isMounted) {
              navigate('/dashboard', { replace: true });
              return;
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      if (isMounted) {
        setIsCheckingProfile(false);
      }
    }

    checkExistingProfile();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  // Adjust default role when segment toggles
  const handleSegmentChange = (newSegment) => {
    setSegment(newSegment);
    if (newSegment === 'Software') {
      setRole('Frontend Developer');
    } else {
      setRole('Electrician');
    }
  };

  // Add / Remove skills
  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Submit onboarding
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    console.log('[Onboarding] Submit triggered. Validating inputs...', {
      userId: user?.id,
      name,
      location,
      skills,
      segment,
      role,
      experience,
    });

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      console.warn('[Onboarding] Validation failed: Missing name.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter your location.');
      console.warn('[Onboarding] Validation failed: Missing location.');
      return;
    }
    if (skills.length === 0) {
      setErrorMsg('Please select or add at least one current skill.');
      console.warn('[Onboarding] Validation failed: No skills selected.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        id: user.id,
        name: name.trim(),
        segment,
        role,
        experience,
        location: location.trim(),
      };

      // 1. Save profile to Supabase
      console.log('[Onboarding] [1/2] Calling Supabase profiles upsert...', profileData);
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        console.error('[Onboarding] ❌ Supabase profile save error:', profileError);
      } else {
        console.log('[Onboarding] ✅ Supabase profile save SUCCESS:', profileResult || profileData);
      }

      // 2. Save each selected skill as a separate row in user_skills
      if (skills.length > 0) {
        const skillRows = skills.map((s) => ({
          user_id: user.id,
          skill_name: s.trim(),
        }));

        console.log('[Onboarding] [2/2] Calling Supabase user_skills upsert...', skillRows);
        const { data: skillsResult, error: skillsError } = await supabase
          .from('user_skills')
          .upsert(skillRows, { onConflict: 'user_id, skill_name' });

        if (skillsError) {
          console.error('[Onboarding] ❌ Supabase user_skills save error:', skillsError);
        } else {
          console.log('[Onboarding] ✅ Supabase user_skills save SUCCESS:', skillsResult || skillRows);
        }
      }

      // Save to localStorage for instant local reliability
      localStorage.setItem(`skillsync_profile_${user.id}`, JSON.stringify(profileData));
      localStorage.setItem(`skillsync_skills_${user.id}`, JSON.stringify(skills));
      console.log('[Onboarding] Saved to localStorage. Navigating to /dashboard...');

      // Navigate to /dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[Onboarding] ❌ Unexpected error in handleSubmit:', err);
      // Fallback: save locally and navigate
      localStorage.setItem(
        `skillsync_profile_${user.id}`,
        JSON.stringify({
          id: user.id,
          name: name.trim(),
          segment,
          role,
          experience,
          location: location.trim(),
        })
      );
      localStorage.setItem(`skillsync_skills_${user.id}`, JSON.stringify(skills));
      console.log('[Onboarding] Fallback saved to localStorage. Navigating to /dashboard...');
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingProfile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#64748b',
          gap: '0.75rem',
        }}
      >
        <Loader2 size={28} className="animate-spin" color="#10b981" />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
          Checking your profile...
        </span>
      </div>
    );
  }

  const roleSuggestions = SUGGESTED_SKILLS[role] || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1rem)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
          padding: 'clamp(1.25rem, 4vw, 2.5rem)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#10b981',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={24} />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to SkillSync
          </h1>
          <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
            Let's set up your profile to tailor your skill readiness pathway.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  fontSize: '0.9rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>

          {/* 2. Segment (Software / Trade) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              Industry Segment <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => handleSegmentChange('Software')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  minHeight: '44px',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: segment === 'Software' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: segment === 'Software' ? '#ecfdf5' : '#ffffff',
                  color: segment === 'Software' ? '#065f46' : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Code size={18} color={segment === 'Software' ? '#10b981' : 'currentColor'} />
                <span>Software</span>
              </button>

              <button
                type="button"
                onClick={() => handleSegmentChange('Trade')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  minHeight: '44px',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: segment === 'Trade' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: segment === 'Trade' ? '#ecfdf5' : '#ffffff',
                  color: segment === 'Trade' ? '#065f46' : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Wrench size={18} color={segment === 'Trade' ? '#10b981' : 'currentColor'} />
                <span>Trade</span>
              </button>
            </div>
          </div>

          {/* 3. Target Role / Trade */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              Target Role / Trade <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
              <Briefcase
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  fontSize: '0.9rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {segment === 'Software' ? (
                  <>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                    <option value="Blockchain Developer">Blockchain Developer</option>
                  </>
                ) : (
                  <>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="EV Technician">EV Technician</option>
                  </>
                )}
              </select>
            </div>

            {/* Quick-select pill buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {(segment === 'Software'
                ? [
                  'Frontend Developer',
                  'Data Analyst',
                  'UI/UX Designer',
                  'Digital Marketing Specialist',
                  'Blockchain Developer',
                ]
                : ['Electrician', 'Plumber', 'EV Technician']
              ).map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setRole(roleOption)}
                  style={{
                    minHeight: '44px',
                    padding: '0.5rem 0.5rem',
                    borderRadius: '8px',
                    border: role === roleOption ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: role === roleOption ? '#ecfdf5' : '#ffffff',
                    color: role === roleOption ? '#065f46' : '#64748b',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Experience */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              Experience Level <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Clock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  fontSize: '0.9rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Location */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              Location <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              placeholder="Search or enter city (e.g. Bengaluru, Delhi)..."
              required
            />
          </div>

          {/* 6. Current Skills */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.4rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                Current Skills <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                {skills.length} selected
              </span>
            </div>

            {/* Selected Skills Chips */}
            {skills.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  minHeight: '44px',
                }}
              >
                {skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      background: '#10b981',
                      color: '#ffffff',
                      borderRadius: '16px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ wordBreak: 'break-word' }}>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '0.65rem',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  fontSize: '0.8125rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Select from suggested skills below or type your own skills.
              </div>
            )}

            {/* Custom Skill Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', minWidth: 0, maxWidth: '100%' }}>
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder="Add custom skill (press Enter)..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: '44px',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  outline: 'none',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  minHeight: '44px',
                  padding: '0.55rem 0.95rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>

            {/* Suggested skill chips */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '0.4rem',
                }}
              >
                Suggested for {role}:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minWidth: 0, maxWidth: '100%' }}>
                {roleSuggestions.map((suggestion) => {
                  const isSelected = skills.includes(suggestion);
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => toggleSkill(suggestion)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '16px',
                        border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0',
                        background: isSelected ? '#ecfdf5' : '#ffffff',
                        color: isSelected ? '#065f46' : '#475569',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.1s ease',
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        textAlign: 'left',
                        boxSizing: 'border-box',
                      }}
                    >
                      {isSelected && <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />}
                      <span style={{ wordBreak: 'break-word' }}>{suggestion}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              minHeight: '44px',
              marginTop: '0.75rem',
              padding: '0.85rem',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Continue to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
