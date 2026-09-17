// ============================================================================
// SkillSync Preset Avatars & Helper Functions
// ============================================================================

/**
 * Deterministic color picker based on user name string
 */
const PALETTES = [
  { bg: '#0E4A32', accent: '#34D399', text: '#FFFFFF' }, // Emerald
  { bg: '#1E3A8A', accent: '#60A5FA', text: '#FFFFFF' }, // Blue
  { bg: '#4C1D95', accent: '#A78BFA', text: '#FFFFFF' }, // Purple
  { bg: '#78350F', accent: '#FBBF24', text: '#FFFFFF' }, // Amber
  { bg: '#164E63', accent: '#22D3EE', text: '#FFFFFF' }, // Cyan
  { bg: '#881337', accent: '#FB7185', text: '#FFFFFF' }, // Rose
  { bg: '#134E4A', accent: '#2DD4BF', text: '#FFFFFF' }, // Teal
  { bg: '#312E81', accent: '#818CF8', text: '#FFFFFF' }, // Indigo
];

export function getInitials(name = 'User') {
  const clean = (name || 'User').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getInitialsAvatar(name = 'User') {
  const initials = getInitials(name);
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const palette = PALETTES[Math.abs(hash) % PALETTES.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg}"/>
        <stop offset="100%" stop-color="${palette.accent}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#g)"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <text x="50" y="55" dominant-baseline="middle" text-anchor="middle" fill="${palette.text}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="800" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 10 Curated, Colorful Preset Vector Avatars
export const PRESET_AVATARS = [
  {
    id: 'avatar-solar-pro',
    name: 'Solar Specialist',
    category: 'Trade',
    bg: '#0E4A32',
    accent: '#34D399',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0E4A32"/>
            <stop offset="100%" stop-color="#10B981"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg1)"/>
        <!-- Face base -->
        <circle cx="50" cy="46" r="22" fill="#FDE047"/>
        <!-- Helmet/Cap -->
        <path d="M26 42 C26 26, 74 26, 74 42 Z" fill="#047857"/>
        <rect x="22" y="40" width="56" height="6" rx="3" fill="#065F46"/>
        <circle cx="50" cy="34" r="5" fill="#34D399"/>
        <!-- Eyes -->
        <circle cx="42" cy="48" r="3" fill="#0F172A"/>
        <circle cx="58" cy="48" r="3" fill="#0F172A"/>
        <!-- Smile -->
        <path d="M44 56 Q50 62 56 56" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Torso / Jacket -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#064E3B"/>
        <path d="M43 68 L50 78 L57 68 Z" fill="#34D399"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-electric-spark',
    name: 'Electric Master',
    category: 'Trade',
    bg: '#1E3A8A',
    accent: '#60A5FA',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E3A8A"/>
            <stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg2)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FED7AA"/>
        <!-- Beanie / Cap -->
        <path d="M28 42 C28 27, 72 27, 72 42 Z" fill="#1D4ED8"/>
        <!-- Lightning emblem on cap -->
        <polygon points="50,28 46,36 51,36 48,43 55,34 50,34" fill="#FBBF24"/>
        <!-- Eyes & Brow -->
        <circle cx="42" cy="48" r="3" fill="#1E293B"/>
        <circle cx="58" cy="48" r="3" fill="#1E293B"/>
        <!-- Smile -->
        <path d="M44 56 Q50 61 56 56" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Work Vest -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#1E40AF"/>
        <line x1="38" y1="72" x2="38" y2="92" stroke="#FBBF24" stroke-width="3"/>
        <line x1="62" y1="72" x2="62" y2="92" stroke="#FBBF24" stroke-width="3"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-code-architect',
    name: 'Code Architect',
    category: 'Software',
    bg: '#4C1D95',
    accent: '#A78BFA',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4C1D95"/>
            <stop offset="100%" stop-color="#8B5CF6"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg3)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FDE68A"/>
        <!-- Hair -->
        <path d="M28 42 C26 24, 74 24, 72 42 C68 34, 32 34, 28 42 Z" fill="#312E81"/>
        <!-- Glasses -->
        <rect x="35" y="44" width="12" height="10" rx="3" fill="none" stroke="#6D28D9" stroke-width="2.5"/>
        <rect x="53" y="44" width="12" height="10" rx="3" fill="none" stroke="#6D28D9" stroke-width="2.5"/>
        <line x1="47" y1="49" x2="53" y2="49" stroke="#6D28D9" stroke-width="2.5"/>
        <circle cx="41" cy="49" r="2" fill="#1E1B4B"/>
        <circle cx="59" cy="49" r="2" fill="#1E1B4B"/>
        <!-- Smile -->
        <path d="M45 58 Q50 63 55 58" stroke="#1E1B4B" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Hoodie -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#2E1065"/>
        <!-- Code Bracket < / > on hoodie -->
        <path d="M42 77 L38 81 L42 85" fill="none" stroke="#C4B5FD" stroke-width="2" stroke-linecap="round"/>
        <path d="M58 77 L62 81 L58 85" fill="none" stroke="#C4B5FD" stroke-width="2" stroke-linecap="round"/>
        <line x1="53" y1="76" x2="47" y2="86" stroke="#C4B5FD" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-tech-visionary',
    name: 'Tech Visionary',
    category: 'Software',
    bg: '#164E63',
    accent: '#22D3EE',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#164E63"/>
            <stop offset="100%" stop-color="#06B6D4"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg4)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FECDD3"/>
        <!-- Modern haircut -->
        <path d="M26 38 C30 20, 68 20, 74 34 C64 26, 40 30, 26 38 Z" fill="#083344"/>
        <!-- Futuristic Visor -->
        <path d="M32 44 Q50 40 68 44 L66 52 Q50 48 34 52 Z" fill="#22D3EE" opacity="0.9"/>
        <line x1="38" y1="48" x2="62" y2="48" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,2"/>
        <!-- Smile -->
        <path d="M45 59 Q50 64 55 59" stroke="#083344" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Cyber Suit -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#0E7490"/>
        <circle cx="50" cy="79" r="4" fill="#67E8F9"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-craft-artisan',
    name: 'Craft Artisan',
    category: 'Trade',
    bg: '#78350F',
    accent: '#FBBF24',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350F"/>
            <stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg5)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FFEDD5"/>
        <!-- Hard Hat -->
        <path d="M26 40 C26 24, 74 24, 74 40 Z" fill="#F59E0B"/>
        <rect x="22" y="38" width="56" height="6" rx="3" fill="#D97706"/>
        <rect x="45" y="24" width="10" height="7" rx="2" fill="#B45309"/>
        <!-- Eyes & Smile -->
        <circle cx="42" cy="48" r="3" fill="#451A03"/>
        <circle cx="58" cy="48" r="3" fill="#451A03"/>
        <path d="M44 56 Q50 61 56 56" stroke="#451A03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Worker Shirt -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#92400E"/>
        <path d="M44 68 L50 78 L56 68 Z" fill="#FDE68A"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-cloud-pioneer',
    name: 'Cloud Pioneer',
    category: 'Software',
    bg: '#1E40AF',
    accent: '#38BDF8',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E40AF"/>
            <stop offset="100%" stop-color="#0284C7"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg6)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FEF08A"/>
        <!-- Headband -->
        <rect x="27" y="34" width="46" height="8" rx="4" fill="#38BDF8"/>
        <!-- Hair top -->
        <path d="M30 34 C35 18, 65 18, 70 34 Z" fill="#1E293B"/>
        <!-- Eyes -->
        <circle cx="42" cy="48" r="3" fill="#0F172A"/>
        <circle cx="58" cy="48" r="3" fill="#0F172A"/>
        <!-- Smile -->
        <path d="M45 57 Q50 62 55 57" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Tech Collar -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#0369A1"/>
        <circle cx="50" cy="80" r="5" fill="#BAE6FD"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-ev-specialist',
    name: 'EV Specialist',
    category: 'Trade',
    bg: '#047857',
    accent: '#6EE7B7',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064E3B"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg7)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FED7AA"/>
        <!-- Visor Cap -->
        <path d="M28 38 C32 24, 68 24, 72 38 Z" fill="#0F172A"/>
        <path d="M22 38 Q50 34 78 38 L74 44 Q50 40 26 44 Z" fill="#10B981"/>
        <!-- Eyes & Smile -->
        <circle cx="42" cy="49" r="3" fill="#064E3B"/>
        <circle cx="58" cy="49" r="3" fill="#064E3B"/>
        <path d="M45 57 Q50 62 55 57" stroke="#064E3B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Uniform with green EV plug symbol -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#065F46"/>
        <circle cx="50" cy="79" r="4" fill="#A7F3D0"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-data-explorer',
    name: 'Data Explorer',
    category: 'Software',
    bg: '#881337',
    accent: '#FB7185',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#881337"/>
            <stop offset="100%" stop-color="#E11D48"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg8)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FCE7F3"/>
        <!-- Stylish Hair -->
        <path d="M28 36 C32 18, 72 20, 72 38 C62 30, 36 32, 28 36 Z" fill="#4C0519"/>
        <!-- Round Glasses -->
        <circle cx="41" cy="48" r="7" fill="none" stroke="#9F1239" stroke-width="2"/>
        <circle cx="59" cy="48" r="7" fill="none" stroke="#9F1239" stroke-width="2"/>
        <line x1="48" y1="48" x2="52" y2="48" stroke="#9F1239" stroke-width="2"/>
        <circle cx="41" cy="48" r="2" fill="#4C0519"/>
        <circle cx="59" cy="48" r="2" fill="#4C0519"/>
        <!-- Smile -->
        <path d="M45 58 Q50 63 55 58" stroke="#4C0519" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Jacket -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#9F1239"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-telecom-engineer',
    name: 'Network Specialist',
    category: 'Trade',
    bg: '#0F766E',
    accent: '#2DD4BF',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg9" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#134E4A"/>
            <stop offset="100%" stop-color="#0D9488"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg9)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FEF3C7"/>
        <!-- Headset / Communicator -->
        <path d="M26 44 C26 22, 74 22, 74 44" fill="none" stroke="#115E59" stroke-width="4"/>
        <rect x="23" y="42" width="7" height="12" rx="3" fill="#14B8A6"/>
        <rect x="70" y="42" width="7" height="12" rx="3" fill="#14B8A6"/>
        <path d="M26 50 L36 58" stroke="#14B8A6" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Eyes & Smile -->
        <circle cx="43" cy="48" r="3" fill="#134E4A"/>
        <circle cx="57" cy="48" r="3" fill="#134E4A"/>
        <path d="M45 56 Q50 61 55 56" stroke="#134E4A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Vest -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#115E59"/>
        <circle cx="50" cy="79" r="4" fill="#99F6E4"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-ac-refrig-pro',
    name: 'HVAC Specialist',
    category: 'Trade',
    bg: '#1E293B',
    accent: '#94A3B8',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="bg10" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0F172A"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="50" fill="url(#bg10)"/>
        <!-- Head -->
        <circle cx="50" cy="46" r="22" fill="#FFE4E6"/>
        <!-- Safety Cap -->
        <path d="M28 40 C28 26, 72 26, 72 40 Z" fill="#64748B"/>
        <rect x="24" y="38" width="52" height="5" rx="2" fill="#94A3B8"/>
        <!-- Protective Eyewear -->
        <rect x="34" y="44" width="32" height="9" rx="3" fill="rgba(56, 189, 248, 0.4)" stroke="#38BDF8" stroke-width="1.5"/>
        <!-- Smile -->
        <path d="M45 58 Q50 62 55 58" stroke="#1E293B" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Work Jacket -->
        <path d="M24 92 C24 74, 34 68, 50 68 C66 68, 76 74, 76 92 Z" fill="#1E293B"/>
        <line x1="40" y1="72" x2="40" y2="92" stroke="#38BDF8" stroke-width="2.5"/>
        <line x1="60" y1="72" x2="60" y2="92" stroke="#38BDF8" stroke-width="2.5"/>
      </svg>
    `)}`,
  },
];

/**
 * Resolves an avatar URL:
 * - If preset ID (e.g. 'avatar-solar-pro'), returns that preset's SVG data URI.
 * - If valid URL (http or data:), returns as is.
 * - Otherwise falls back to initials avatar with deterministic colors.
 */
export function getAvatarUrl(avatarUrlOrId, userName = 'User') {
  if (avatarUrlOrId) {
    const trimmed = String(avatarUrlOrId).trim();
    const foundPreset = PRESET_AVATARS.find((p) => p.id === trimmed);
    if (foundPreset) return foundPreset.url;
    if (trimmed.startsWith('http') || trimmed.startsWith('data:image')) {
      return trimmed;
    }
  }
  return getInitialsAvatar(userName);
}
