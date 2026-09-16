import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getUserProfile, getUserSkills } from '../lib/profile';
import { calculateScore, saveScoreIfChanged } from '../lib/scoring';
import { getRequiredSkillsForRole, ROLE_REQUIRED_SKILLS } from '../data/demoData';
import LocationAutocomplete from '../components/LocationAutocomplete';
import {
  ArrowLeft,
  Code,
  Wrench,
  Briefcase,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Save,
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

const getRoleSkills = (role) => [
  ...new Set([
    ...(SUGGESTED_SKILLS[role] || []),
    ...(ROLE_REQUIRED_SKILLS[role] || []).map(({ name }) => name),
  ]),
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile data
  const [profile, setProfile] = useState(null);
  const [segment, setSegment] = useState('Software');
  const [role, setRole] = useState('Frontend Developer');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [initialSkills, setInitialSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Load user profile and existing skills
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user?.id) return;
      setIsLoading(true);

      try {
        const [profileData, userSkillsData] = await Promise.all([
          getUserProfile(user.id),
          getUserSkills(user.id),
        ]);

        if (!isMounted) return;

        if (profileData) {
          setProfile(profileData);
          if (profileData.segment) setSegment(profileData.segment);
          if (profileData.role) setRole(profileData.role);
          if (profileData.location) setLocation(profileData.location);
        }

        if (Array.isArray(userSkillsData)) {
          const activeRole = profileData?.role || role;
          const allowedSkills = new Set(getRoleSkills(activeRole));
          setSkills(userSkillsData.filter((skill) => allowedSkills.has(skill)));
          setInitialSkills(userSkillsData);
        }
      } catch (err) {
        console.error('Error fetching edit profile data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Adjust default role when segment toggles
  const handleSegmentChange = (newSegment) => {
    setSegment(newSegment);
    if (newSegment === 'Software') {
      setRole('Frontend Developer');
    } else {
      setRole('Electrician');
    }
    setSkills([]);
    setCustomSkillInput('');
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSkills([]);
    setCustomSkillInput('');
  };

  // Toggle skill selection
  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  // Add custom skill
  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (skills.length === 0) {
      setErrorMsg('Please select or add at least one skill.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update profiles table
      const updatedProfile = {
        ...(profile || {}),
        id: user.id,
        role,
        segment,
        location: location.trim(),
      };

      console.log('[EditProfile] Updating profile role, segment, location:', { role, segment, location: location.trim() });
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role, segment, location: location.trim() })
        .eq('id', user.id);

      if (profileError) {
        console.warn('[EditProfile] Supabase profile update error:', profileError.message);
      }

      // 2. Remove skills that were deselected
      const removedSkills = initialSkills.filter((s) => !skills.includes(s));
      if (removedSkills.length > 0) {
        console.log('[EditProfile] Removing deselected skills from user_skills:', removedSkills);
        const { error: deleteError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id)
          .in('skill_name', removedSkills);

        if (deleteError) {
          console.warn('[EditProfile] Supabase skills delete error:', deleteError.message);
        }
      }

      // 3. Upsert current active skills
      if (skills.length > 0) {
        const skillRows = skills.map((s) => ({
          user_id: user.id,
          skill_name: s.trim(),
        }));

        console.log('[EditProfile] Upserting user_skills:', skillRows);
        const { error: skillsError } = await supabase
          .from('user_skills')
          .upsert(skillRows, { onConflict: 'user_id, skill_name' });

        if (skillsError) {
          console.warn('[EditProfile] Supabase skills upsert error:', skillsError.message);
        }
      }

      // 4. Recalculate readiness score with updated role and skills
      let requiredSkills = getRequiredSkillsForRole(role);
      if (!requiredSkills || requiredSkills.length === 0) {
        requiredSkills = ROLE_REQUIRED_SKILLS['Frontend Developer'] || [];
      }
      const scoringResult = calculateScore(skills, requiredSkills);
      console.log('[EditProfile] Recalculated readiness score:', scoringResult.score);

      // 5. Save new score to score_history (deduping if score unchanged)
      await saveScoreIfChanged(user.id, scoringResult.score);

      // 6. Update local storage cache
      localStorage.setItem(`skillsync_profile_${user.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem(`skillsync_skills_${user.id}`, JSON.stringify(skills));
      console.log('[EditProfile] Local storage synced. Navigating to /dashboard...');

      // 7. Return to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[EditProfile] Error saving profile changes:', err);
      // Fallback: save to local storage and proceed
      const fallbackProfile = {
        ...(profile || {}),
        id: user.id,
        role,
        segment,
        location: location.trim(),
      };
      localStorage.setItem(`skillsync_profile_${user.id}`, JSON.stringify(fallbackProfile));
      localStorage.setItem(`skillsync_skills_${user.id}`, JSON.stringify(skills));
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
          Loading profile details...
        </span>
      </div>
    );
  }

  const roleSuggestions = getRoleSkills(role);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#0E4A32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Sparkles size={20} color="#34D399" />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Skill<span style={{ color: '#0E4A32' }}>Sync</span>
            </span>
            <span
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#10b981',
                background: '#ecfdf5',
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              Edit Profile
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1rem)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e2e8f0',
            padding: 'clamp(1.25rem, 4vw, 2rem)',
          }}
        >
          {/* Header Title */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 0.35rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              Update Target Role & Skills
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Change your career track or add newly acquired skills. Your readiness score and personalized roadmap will automatically recalculate.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. Industry Segment */}
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

            {/* 2. Target Role / Trade */}
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
                  onChange={(e) => handleRoleChange(e.target.value)}
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
                    onClick={() => handleRoleChange(roleOption)}
                    style={{
                      minHeight: '44px',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.8rem',
                      fontWeight: role === roleOption ? 700 : 500,
                      borderRadius: '8px',
                      border: role === roleOption ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                      background: role === roleOption ? '#f0fdf4' : '#ffffff',
                      color: role === roleOption ? '#065f46' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      textAlign: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Location */}
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
                Location (City) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Search or enter city (e.g. Bengaluru, Delhi)..."
                required
              />
            </div>

            {/* 4. Skills Management */}
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
                  Your Skills <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                  {skills.length} active
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
                  No skills selected yet. Choose from suggestions below or add custom skills.
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
                    padding: '0.55rem 0.85rem',
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
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
                  flex: 2,
                  minHeight: '44px',
                  padding: '0.8rem',
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
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
