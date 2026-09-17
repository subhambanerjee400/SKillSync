import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSkillLabel } from '../i18n/skillLabels';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getUserProfile, getUserSkills } from '../lib/profile';
import { calculateScore, saveScoreIfChanged } from '../lib/scoring';
import { getRequiredSkillsForRole, ROLE_REQUIRED_SKILLS } from '../data/demoData';
import LocationAutocomplete from '../components/LocationAutocomplete';
import LanguageSwitcher from '../components/LanguageSwitcher';
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
  Pencil,
  Camera,
  Check,
  Star,
  MessageSquare,
} from 'lucide-react';
import { getUserFeedbackHistory } from '../lib/feedback';
import { PRESET_AVATARS, getAvatarUrl } from '../data/avatars';

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile data
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');

  const [segment, setSegment] = useState('Software');
  const [role, setRole] = useState('Frontend Developer');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [initialSkills, setInitialSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // User feedback history state
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

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
          const initialName =
            profileData.name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.name ||
            (user.email ? user.email.split('@')[0] : '');
          setName(initialName);
          setUsernameInput(initialName);
          setAvatarUrl(profileData.avatar_url || user.user_metadata?.avatar_url || user.avatar_url || '');

          if (profileData.segment) setSegment(profileData.segment);
          if (profileData.role) setRole(profileData.role);
          if (profileData.location) setLocation(profileData.location);
        } else {
          const initialName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.name ||
            (user.email ? user.email.split('@')[0] : '');
          setName(initialName);
          setUsernameInput(initialName);
          setAvatarUrl(user.user_metadata?.avatar_url || user.avatar_url || '');
        }

        if (Array.isArray(userSkillsData)) {
          const activeRole = profileData?.role || role;
          const allowedSkills = new Set(getRoleSkills(activeRole));
          setSkills(userSkillsData.filter((skill) => allowedSkills.has(skill)));
          setInitialSkills(userSkillsData.filter((skill) => allowedSkills.has(skill)));
        }

        // Load user's feedback history (isolated to active user)
        setLoadingFeedback(true);
        try {
          const historyRes = await getUserFeedbackHistory(user.id);
          const list = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);
          if (isMounted) {
            setFeedbackHistory(list);
          }
        } catch (feedErr) {
          console.warn('[EditProfile] Error loading feedback history:', feedErr);
        } finally {
          if (isMounted) setLoadingFeedback(false);
        }
      } catch (err) {
        console.error('[EditProfile] Error loading profile data:', err);
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

  // Handle segment toggle (defaults role to first in segment)
  const handleSegmentChange = (newSegment) => {
    setSegment(newSegment);
    const newRole = newSegment === 'Software' ? 'Frontend Developer' : 'Electrician';
    setRole(newRole);
    // Prune incompatible skills that do not exist in the new role
    const newAllowed = new Set(getRoleSkills(newRole));
    setSkills((prev) => prev.filter((s) => newAllowed.has(s)));
  };

  // Handle role select change
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Keep only skills valid for the newly selected role
    const newAllowed = new Set(getRoleSkills(newRole));
    setSkills((prev) => prev.filter((s) => newAllowed.has(s)));
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

  // Save username inline
  const handleSaveUsername = async (e) => {
    if (e) e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setUsernameError(t('editProfile.usernameRequired', 'Username cannot be empty.'));
      return;
    }
    setUsernameError('');
    setUsernameSaving(true);

    try {
      // 1. Update profiles table and shared AuthContext state
      const { error: updateErr } = await updateProfile({ name: trimmed });

      if (updateErr) {
        console.warn('[EditProfile] Supabase username update warning:', updateErr.message);
      }

      // 2. Best-effort update of Supabase auth user metadata
      try {
        await supabase.auth.updateUser({
          data: { name: trimmed, full_name: trimmed },
        });
      } catch (authErr) {}

      // 3. Update local state
      setName(trimmed);
      const updatedProfile = { ...(profile || {}), id: user.id, name: trimmed };
      setProfile(updatedProfile);

      setIsEditingUsername(false);
      setUsernameSuccess(t('editProfile.usernameUpdated', 'Username updated successfully!'));
      setTimeout(() => setUsernameSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving username:', err);
      setUsernameError(err.message || 'Failed to update username');
    } finally {
      setUsernameSaving(false);
    }
  };

  // Select preset avatar
  const handleSelectAvatar = async (presetIdOrUrl) => {
    setAvatarSaving(true);
    try {
      // 1. Update profiles table and shared AuthContext state
      const { error: updateErr } = await updateProfile({ avatar_url: presetIdOrUrl });

      if (updateErr) {
        console.warn('[EditProfile] Supabase avatar_url update warning:', updateErr.message);
      }

      // 2. Best-effort update of Supabase auth user metadata
      try {
        await supabase.auth.updateUser({
          data: { avatar_url: presetIdOrUrl, avatar: presetIdOrUrl },
        });
      } catch (authErr) {}

      // 3. Update local state
      setAvatarUrl(presetIdOrUrl);
      const updatedProfile = { ...(profile || {}), id: user.id, avatar_url: presetIdOrUrl };
      setProfile(updatedProfile);

      setIsAvatarModalOpen(false);
      setAvatarSuccess(t('editProfile.avatarUpdated', 'Avatar updated successfully!'));
      setTimeout(() => setAvatarSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving avatar:', err);
    } finally {
      setAvatarSaving(false);
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
      setErrorMsg(t('editProfile.errSkills'));
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
        name: (name || profile?.name || '').trim(),
        avatar_url: avatarUrl || profile?.avatar_url || null,
      };

      const updatePayload = {
        role,
        segment,
        location: location.trim(),
      };
      if (name && name.trim()) updatePayload.name = name.trim();
      if (avatarUrl) updatePayload.avatar_url = avatarUrl;

      console.log('[EditProfile] Updating profile:', updatePayload);
      const { error: profileError } = await updateProfile(updatePayload);

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
          {t('editProfile.loading')}
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
              {t('editProfile.badge')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LanguageSwitcher variant="light" compact />
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
            <span>{t('editProfile.backBtn')}</span>
          </button>
        </div>
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
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              border: '1px solid #e2e8f0',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              boxSizing: 'border-box',
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
              {t('editProfile.title')}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              {t('editProfile.subtitle')}
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

          {/* User Identity & Avatar Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
              border: '1px solid #DCFCE7',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            {/* Left: Avatar with Edit Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={getAvatarUrl(avatarUrl, name)}
                  alt={name || 'Avatar'}
                  style={{
                    width: '64px',
                    height: '64px',
                    minWidth: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 4px 12px rgba(14, 74, 50, 0.15)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  title={t('editProfile.chooseAvatar', 'Choose Avatar')}
                  aria-label={t('editProfile.chooseAvatar', 'Choose Avatar')}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#0E4A32',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* Middle: Username & Inline Edit Form */}
              <div style={{ minWidth: 0, flex: 1 }}>
                {isEditingUsername ? (
                  <form
                    onSubmit={handleSaveUsername}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}
                  >
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder={t('editProfile.usernamePlaceholder', 'Enter username')}
                      autoFocus
                      style={{
                        padding: '0.4rem 0.65rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1.5px solid #10B981',
                        outline: 'none',
                        color: '#0F172A',
                        minWidth: '150px',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={usernameSaving}
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: '#0E4A32',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {usernameSaving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        t('common.save', 'Save')
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingUsername(false);
                        setUsernameInput(name);
                        setUsernameError('');
                      }}
                      style={{
                        padding: '0.4rem 0.65rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h2
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        margin: 0,
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {name || t('editProfile.unnamedUser', 'User')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameInput(name);
                        setIsEditingUsername(true);
                      }}
                      title={t('editProfile.editUsername', 'Edit Username')}
                      aria-label={t('editProfile.editUsername', 'Edit Username')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0E4A32',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                )}

                {/* Subtitle Details */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                    fontSize: '0.775rem',
                    color: '#64748B',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </span>
                  <span>•</span>
                  <span style={{ fontWeight: 600, color: '#0E4A32' }}>{role}</span>
                </div>

                {/* Inline Username Error */}
                {usernameError && (
                  <p style={{ fontSize: '0.75rem', color: '#DC2626', margin: '4px 0 0 0', fontWeight: 600 }}>
                    {usernameError}
                  </p>
                )}

                {/* Success Confirmation Toast */}
                {(usernameSuccess || avatarSuccess) && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.35rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#DCFCE7',
                      color: '#065F46',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                    <span>{usernameSuccess || avatarSuccess}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Choose Avatar Action Button */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0E4A32';
                e.currentTarget.style.color = '#0E4A32';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <Sparkles size={14} color="#10B981" />
              <span>{t('editProfile.chooseAvatar', 'Choose Avatar')}</span>
            </button>
          </div>

          {/* Preset Avatar Selection Modal */}
          {isAvatarModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1rem',
                boxSizing: 'border-box',
              }}
              onClick={() => setIsAvatarModalOpen(false)}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  maxWidth: '520px',
                  width: '100%',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #E2E8F0',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                      {t('editProfile.avatarModalTitle', 'Choose Your Avatar')}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                      {t('editProfile.avatarModalSubtitle', 'Select a preset avatar to represent your profile across SkillSync.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Grid of Preset Avatars */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = avatarUrl === preset.id || avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectAvatar(preset.id)}
                        disabled={avatarSaving}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '0.75rem 0.5rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #10B981' : '1px solid #E2E8F0',
                          background: isSelected ? '#F0FDF4' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#94A3B8';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                      >
                        {isSelected && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#10B981',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                        <img
                          src={preset.url}
                          alt={preset.name}
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            marginBottom: '0.5rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isSelected ? '#065F46' : '#1E293B',
                            textAlign: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {preset.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: preset.category === 'Trade' ? '#047857' : '#6D28D9',
                            background: preset.category === 'Trade' ? '#ECFDF5' : '#F5F3FF',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            marginTop: '4px',
                          }}
                        >
                          {preset.category}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Option to revert to initials-based avatar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '1rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectAvatar('')}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t('editProfile.useInitials', 'Reset to Initials Avatar')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#0E4A32',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t('common.done', 'Done')}
                  </button>
                </div>
              </div>
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
                {t('onboarding.industrySegment')} <span style={{ color: '#ef4444' }}>*</span>
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
                  <span>{t('onboarding.software')}</span>
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
                  <span>{t('onboarding.trade')}</span>
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
                {t('onboarding.targetRole')} <span style={{ color: '#ef4444' }}>*</span>
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
                {t('onboarding.location')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder={t('onboarding.locationPlaceholder')}
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
                  {t('onboarding.currentSkills')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                  {skills.length} {t('editProfile.activeCount')}
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
                      <span style={{ wordBreak: 'break-word' }}>{getSkillLabel(skill, i18n.language)}</span>
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
                  {t('editProfile.noSkillsSelected')}
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
                  placeholder={t('onboarding.addCustomSkillPlaceholder')}
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
                  <span>{t('onboarding.addBtn')}</span>
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
                  {t('onboarding.suggestedForRole', { role })}
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
                        <span style={{ wordBreak: 'break-word' }}>{getSkillLabel(suggestion, i18n.language)}</span>
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
                {t('common.cancel')}
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
                    <span>{t('editProfile.savingChanges')}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{t('editProfile.saveChanges')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User Feedback History Section */}
        <div
          id="user-feedback-history-section"
          style={{
            width: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e2e8f0',
            padding: 'clamp(1.25rem, 4vw, 2rem)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 0.25rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <MessageSquare size={19} color="#0E4A32" />
                Your Feedback History
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                Past reviews and skill feedback you&apos;ve shared with SkillSync.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#047857',
                background: '#ecfdf5',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
              }}
            >
              {feedbackHistory.length} {feedbackHistory.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          {loadingFeedback ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 0',
                color: '#64748b',
                gap: '0.5rem',
              }}
            >
              <Loader2 size={20} className="animate-spin" color="#10b981" />
              <span style={{ fontSize: '0.85rem' }}>Loading feedback history...</span>
            </div>
          ) : feedbackHistory.length === 0 ? (
            <div
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  color: '#64748b',
                }}
              >
                <MessageSquare size={18} />
              </div>
              <p style={{ margin: '0 0 0.4rem 0', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                No feedback submitted yet
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', maxWidth: '380px', marginInline: 'auto' }}>
                Share your experience with courses and skill recommendations from your Dashboard to see your reviews listed here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedbackHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1.1rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <Star
                          key={starVal}
                          size={16}
                          fill={starVal <= (item.overall_rating || 0) ? '#f59e0b' : 'none'}
                          color={starVal <= (item.overall_rating || 0) ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginLeft: '0.35rem' }}>
                        {item.overall_rating}/5
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {item.relevance_rating && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #dbeafe',
                          }}
                        >
                          {item.relevance_rating}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {item.written_feedback && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#334155',
                        lineHeight: 1.5,
                        background: '#ffffff',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid #edf2f7',
                      }}
                    >
                      &ldquo;{item.written_feedback}&rdquo;
                    </p>
                  )}

                  {item.suggestions && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                      <strong>Suggestion:</strong> {item.suggestions}
                    </p>
                  )}

                  {((item.skills_improved && item.skills_improved.length > 0) ||
                    (item.skills_still_needed && item.skills_still_needed.length > 0)) && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        paddingTop: '0.35rem',
                        borderTop: '1px solid #e2e8f0',
                      }}
                    >
                      {item.skills_improved && item.skills_improved.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#047857' }}>
                            Skills Improved:
                          </span>
                          {item.skills_improved.map((skill) => (
                            <span
                              key={skill}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                background: '#ecfdf5',
                                color: '#065f46',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px',
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.skills_still_needed && item.skills_still_needed.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#b45309' }}>
                            Still Needed:
                          </span>
                          {item.skills_still_needed.map((skill) => (
                            <span
                              key={skill}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                background: '#fffbeb',
                                color: '#92400e',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px',
                                border: '1px solid #fde68a',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
);
}
