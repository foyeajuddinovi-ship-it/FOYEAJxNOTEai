
import { Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'USA / UK', native: 'English', icon: '🇺🇸' },
  { code: 'bn', name: 'Bangladesh', native: 'বাংলা', icon: '🇧🇩' },
  { code: 'ja', name: 'Japan', native: '日本語', icon: '🇯🇵' },
  { code: 'zh', name: 'China', native: '中文', icon: '🇨🇳' },
  { code: 'ur', name: 'Pakistan', native: 'اردو', icon: '🇵🇰' },
  { code: 'ar', name: 'Saudi Arabia', native: 'العربية', icon: '🇸🇦' },
  { code: 'fr', name: 'France', native: 'Français', icon: '🇫🇷' },
  { code: 'de', name: 'Germany', native: 'Deutsch', icon: '🇩🇪' },
  { code: 'es', name: 'Spain', native: 'Español', icon: '🇪🇸' },
  { code: 'it', name: 'Italy', native: 'Italiano', icon: '🇮🇹' },
  { code: 'ko', name: 'South Korea', native: '한국어', icon: '🇰🇷' },
  { code: 'tr', name: 'Turkey', native: 'Türkçe', icon: '🇹🇷' },
];

export const DEFAULT_FORMATTING = {
  bold: false,
  italic: false,
  underline: false,
  fontSize: 17,
  alignment: 'left' as const,
};
