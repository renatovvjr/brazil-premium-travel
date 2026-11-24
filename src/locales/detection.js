import { countryLocaleMap, localeCatalog, spanishSpeakingCountries } from './catalog.js'

export function normaliseLocale(value, country = '') {
  if (!value) return null
  const candidate = String(value).trim().replace('_', '-').toLowerCase()
  const exact = localeCatalog.find((locale) => locale.code.toLowerCase() === candidate)
  if (exact) return exact.code

  if (candidate === 'tl' || candidate.startsWith('tl-')) return 'fil'
  if (candidate === 'cmn' || candidate.startsWith('cmn-')) return 'zh-Hans'
  if (candidate === 'zh' || candidate === 'zh-cn' || candidate === 'zh-sg' || candidate.includes('hans')) return 'zh-Hans'
  if (candidate === 'zh-tw' || candidate === 'zh-mo' || candidate.includes('hant')) return 'zh-Hant'
  if (candidate === 'zh-hk') return 'yue'
  if (candidate === 'pt' || candidate.startsWith('pt-')) return 'pt-BR'
  if (candidate === 'es' || candidate.startsWith('es-')) return 'es'
  if (candidate === 'en' || candidate.startsWith('en-')) return String(country).toUpperCase() === 'NZ' ? 'en-NZ' : country ? 'en-AU' : null

  const base = candidate.split('-')[0]
  const baseMatch = localeCatalog.find((locale) => locale.code.toLowerCase() === base)
  return baseMatch?.code || null
}

export function localeFromCountry(value) {
  const country = String(value || '').toUpperCase()
  if (spanishSpeakingCountries.has(country)) return 'es'
  return countryLocaleMap[country] || null
}

export function resolveLocale({ saved, browserLanguages = [], country = '' }) {
  const savedLocale = normaliseLocale(saved, country)
  if (savedLocale && localeCatalog.find((locale) => locale.code === savedLocale)?.selectable) return savedLocale

  for (const browserLocale of browserLanguages) {
    const supported = normaliseLocale(browserLocale, country)
    if (supported && localeCatalog.find((locale) => locale.code === supported)?.selectable) return supported
    if (/^en(?:-|$)/i.test(browserLocale) && !country) return null
  }

  const countryLocale = localeFromCountry(country)
  return localeCatalog.find((locale) => locale.code === countryLocale)?.selectable ? countryLocale : (country ? 'en-AU' : null)
}
