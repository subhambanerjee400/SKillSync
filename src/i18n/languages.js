/**
 * Supported language configurations for SkillSync.
 * To add a new language in the future:
 * 1. Add its code and native script label here.
 * 2. Create the corresponding JSON file in src/i18n/locales/<code>.json.
 * 3. Import and register it in src/i18n/index.js.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

export const DEFAULT_LANGUAGE = 'en';
