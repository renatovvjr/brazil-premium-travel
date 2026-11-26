export const localeCatalog = [
  { code: 'en-AU', short: 'EN', country: 'au', name: 'English (Australia)', englishName: 'English (Australia)', selectable: true },
  { code: 'en-NZ', short: 'EN', country: 'nz', name: 'English (New Zealand)', englishName: 'English (New Zealand)', selectable: true, contentLocale: 'en-AU' },
  { code: 'pt-BR', short: 'PT', country: 'br', name: 'Português (Brasil)', englishName: 'Portuguese (Brazil)', selectable: true },
  { code: 'es', short: 'ES', country: 'es', name: 'Español', englishName: 'Spanish', selectable: true },
  { code: 'zh-Hans', short: '简', country: 'cn', name: '简体中文', englishName: 'Simplified Chinese', selectable: true },
  { code: 'zh-Hant', short: '繁', country: 'tw', name: '繁體中文', englishName: 'Traditional Chinese' },
  { code: 'yue', short: '粵', country: 'hk', name: '廣東話', englishName: 'Cantonese' },
  { code: 'hi', short: 'हि', country: 'in', name: 'हिन्दी', englishName: 'Hindi' },
  { code: 'pa', short: 'ਪੰ', country: 'in', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { code: 'vi', short: 'VI', country: 'vn', name: 'Tiếng Việt', englishName: 'Vietnamese' },
  { code: 'fil', short: 'FIL', country: 'ph', name: 'Filipino', englishName: 'Filipino' },
  { code: 'ko', short: '한', country: 'kr', name: '한국어', englishName: 'Korean', selectable: true },
  { code: 'ja', short: '日', country: 'jp', name: '日本語', englishName: 'Japanese', selectable: true },
  { code: 'ne', short: 'ने', country: 'np', name: 'नेपाली', englishName: 'Nepali' },
  { code: 'th', short: 'TH', country: 'th', name: 'ภาษาไทย', englishName: 'Thai' },
  { code: 'id', short: 'ID', country: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'ta', short: 'த', country: 'in', name: 'தமிழ்', englishName: 'Tamil' },
  { code: 'ur', short: 'اردو', country: 'pk', name: 'اردو', englishName: 'Urdu', direction: 'rtl' },
  { code: 'bn', short: 'বা', country: 'bd', name: 'বাংলা', englishName: 'Bengali' },
  { code: 'it', short: 'IT', country: 'it', name: 'Italiano', englishName: 'Italian', selectable: true },
  { code: 'el', short: 'ΕΛ', country: 'gr', name: 'Ελληνικά', englishName: 'Greek' },
  { code: 'fr', short: 'FR', country: 'fr', name: 'Français', englishName: 'French', selectable: true },
  { code: 'de', short: 'DE', country: 'de', name: 'Deutsch', englishName: 'German', selectable: true },
  { code: 'nl', short: 'NL', country: 'nl', name: 'Nederlands', englishName: 'Dutch' },
  { code: 'ru', short: 'РУ', country: 'ru', name: 'Русский', englishName: 'Russian' },
  { code: 'pl', short: 'PL', country: 'pl', name: 'Polski', englishName: 'Polish' },
  { code: 'ar', short: 'عر', country: 'sa', name: 'العربية', englishName: 'Arabic', direction: 'rtl', selectable: true },
  { code: 'tr', short: 'TR', country: 'tr', name: 'Türkçe', englishName: 'Turkish', selectable: true },
  { code: 'fa', short: 'فا', country: 'ir', name: 'فارسی', englishName: 'Persian', direction: 'rtl' },
  { code: 'af', short: 'AF', country: 'za', name: 'Afrikaans', englishName: 'Afrikaans' },
  { code: 'mi', short: 'MI', country: 'nz', name: 'Te Reo Māori', englishName: 'Māori' },
  { code: 'sm', short: 'SM', country: 'ws', name: 'Gagana Samoa', englishName: 'Samoan' },
]

export const localeByCode = Object.fromEntries(localeCatalog.map((locale) => [locale.code, locale]))

export const rtlLocales = new Set(localeCatalog.filter((locale) => locale.direction === 'rtl').map((locale) => locale.code))

export const countryLocaleMap = {
  AU: 'en-AU', NZ: 'en-NZ', BR: 'pt-BR', ES: 'es',
  CN: 'zh-Hans', TW: 'zh-Hant', HK: 'yue', IN: 'hi', VN: 'vi', PH: 'fil',
  KR: 'ko', JP: 'ja', NP: 'ne', TH: 'th', ID: 'id', PK: 'ur', BD: 'bn',
  IT: 'it', GR: 'el', FR: 'fr', DE: 'de', NL: 'nl', RU: 'ru', PL: 'pl',
  SA: 'ar', TR: 'tr', IR: 'fa', ZA: 'af', WS: 'sm',
}

export const spanishSpeakingCountries = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PY', 'SV', 'UY', 'VE',
])
