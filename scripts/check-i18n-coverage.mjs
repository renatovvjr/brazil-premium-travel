import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { localeCatalog } from '../src/locales/catalog.js'
import { reviewResources } from '../src/locales/reviewResources.js'

const root = process.cwd()
const i18nSource = fs.readFileSync(path.join(root, 'src', 'i18n.jsx'), 'utf8')

function keysBetween(startMarker, endMarker) {
  const start = i18nSource.indexOf(startMarker)
  const end = i18nSource.indexOf(endMarker, start + startMarker.length)
  if (start < 0 || end < 0) throw new Error(`Could not read translation block: ${startMarker}`)
  return new Set([...i18nSource.slice(start, end).matchAll(/^\s{4}'([^']+)':/gm)].map((match) => match[1]))
}

const sourceKeys = keysBetween("  'en-AU': {", "  'pt-BR': {")
const resourceKeys = {
  'en-AU': sourceKeys,
  'en-NZ': sourceKeys,
  'pt-BR': keysBetween("  'pt-BR': {", '  es: {'),
  es: keysBetween('  es: {', '\n}\n\nexport const translationResources'),
  ...Object.fromEntries(Object.entries(reviewResources).map(([locale, resource]) => [locale, new Set(Object.keys(resource))])),
}

if (localeCatalog.length !== 32) throw new Error(`Expected 32 locales, found ${localeCatalog.length}`)

const rows = localeCatalog.map((locale) => {
  const keys = resourceKeys[locale.code] || new Set()
  const translated = [...sourceKeys].filter((key) => keys.has(key)).length
  const coverage = Math.round((translated / sourceKeys.size) * 100)
  const flagPath = path.join(root, 'public', 'flags', `${locale.country}.svg`)
  return {
    locale: locale.code,
    state: locale.selectable ? (locale.reviewRequired ? 'available-review' : 'available') : 'review',
    coverage: `${coverage}%`,
    translated: `${translated}/${sourceKeys.size}`,
    flag: fs.existsSync(flagPath) ? 'ok' : 'missing',
  }
})

console.table(rows)

const invalidAvailable = rows.filter((row) => localeCatalog.find((locale) => locale.code === row.locale)?.selectable && (row.coverage !== '100%' || row.flag !== 'ok'))
const missingFlags = rows.filter((row) => row.flag !== 'ok')

if (invalidAvailable.length || missingFlags.length) {
  console.error('Translation coverage validation failed.')
  process.exit(1)
}

console.log(`Validated ${rows.length} locales; ${localeCatalog.filter((locale) => locale.selectable).length} selectable and ${localeCatalog.filter((locale) => !locale.selectable).length} held for professional review.`)
