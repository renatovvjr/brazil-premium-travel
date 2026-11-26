import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { localeCatalog } from '../src/locales/catalog.js'

const root = process.cwd()
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'locales', 'manifests', 'source.en-AU.json'), 'utf8'))
const i18nSource = fs.readFileSync(path.join(root, 'src', 'i18n.jsx'), 'utf8').replaceAll('\r\n', '\n')
const requiredLocales = ['en-AU', 'en-NZ', 'pt-BR', 'es', 'fr', 'it', 'ja', 'ko', 'de', 'tr', 'zh-Hans', 'ar']

function keysBetween(startMarker, endMarker) {
  const start = i18nSource.indexOf(startMarker)
  const end = i18nSource.indexOf(endMarker, start + startMarker.length)
  if (start < 0 || end < 0) throw new Error(`Could not read translation block: ${startMarker}`)
  return new Set([...i18nSource.slice(start, end).matchAll(/^\s{4}'([^']+)':/gm)].map((match) => match[1]))
}

const interfaceKeys = keysBetween("  'en-AU': {", "  'pt-BR': {")
const entryById = new Map(manifest.entries.map((entry) => [entry.id, entry]))
const rows = []
const failures = []

for (const locale of requiredLocales) {
  const metadata = localeCatalog.find((item) => item.code === locale)
  const flagPath = metadata && path.join(root, 'public', 'flags', `${metadata.country}.svg`)
  if (!metadata?.selectable) failures.push(`${locale}: required locale is not selectable`)
  if (!flagPath || !fs.existsSync(flagPath)) failures.push(`${locale}: flag is missing`)

  if (locale === 'en-AU' || locale === 'en-NZ') {
    rows.push({ locale, content: `${manifest.stringCount}/${manifest.stringCount}`, interface: `${interfaceKeys.size}/${interfaceKeys.size}`, protected: 'authoritative' })
    continue
  }

  const resourcePath = path.join(root, 'src', 'locales', 'generated', `${locale}.json`)
  if (!fs.existsSync(resourcePath)) {
    failures.push(`${locale}: generated resource is missing`)
    rows.push({ locale, content: 'missing', interface: 'missing', protected: 'unchecked' })
    continue
  }

  const resource = JSON.parse(fs.readFileSync(resourcePath, 'utf8'))
  const translatedIds = Object.keys(resource.translations || {})
  const translatedInterface = Object.keys(resource.interface || {})
  const translatedValues = translatedIds.map((id) => resource.translations[id])
  let protectedFailures = 0

  if (!resource.complete) failures.push(`${locale}: resource is not marked complete`)
  if (resource.sourceManifestHash !== manifest.sourceHash) failures.push(`${locale}: source manifest hash is stale`)
  if (translatedIds.length !== manifest.stringCount) failures.push(`${locale}: expected ${manifest.stringCount} content strings, found ${translatedIds.length}`)
  const translationFrequencies = translatedValues.reduce((counts, value) => counts.set(value, (counts.get(value) || 0) + 1), new Map())
  const highestDuplicateCount = Math.max(0, ...translationFrequencies.values())
  if (translationFrequencies.size < manifest.stringCount * 0.55) failures.push(`${locale}: translation diversity is implausibly low (${translationFrequencies.size} unique values)`)
  if (highestDuplicateCount > manifest.stringCount * 0.08) failures.push(`${locale}: one translation value is repeated ${highestDuplicateCount} times`)
  const undefinedTranslations = translatedValues.filter((value) => /^(?:undefined|indefinido|non défini|non definito|未定義|정의되지 않음|nicht definiert|tanımlanmamış|未定义|غير محدد)$/iu.test(value))
  if (undefinedTranslations.length > 2) failures.push(`${locale}: ${undefinedTranslations.length} invalid undefined translations`)
  for (const key of interfaceKeys) if (!resource.interface?.[key]) failures.push(`${locale}: interface key ${key} is missing`)

  for (const [id, translated] of Object.entries(resource.translations || {})) {
    const entry = entryById.get(id)
    if (!entry) {
      failures.push(`${locale}: unknown manifest id ${id}`)
      continue
    }
    for (const token of entry.lockedTokens || []) {
      if (!translated.includes(token.value)) protectedFailures += 1
    }
    if (resource.sourceTranslations?.[entry.source] !== translated) failures.push(`${locale}: source map mismatch for ${id}`)
  }
  if (protectedFailures) failures.push(`${locale}: ${protectedFailures} protected commercial token(s) changed`)

  rows.push({
    locale,
    content: `${translatedIds.length}/${manifest.stringCount}`,
    interface: `${translatedInterface.filter((key) => interfaceKeys.has(key)).length}/${interfaceKeys.size}`,
    protected: protectedFailures ? `${protectedFailures} failed` : 'ok',
  })
}

if (localeCatalog.length !== 32) failures.push(`Expected 32 catalogue locales, found ${localeCatalog.length}`)
const unexpectedSelectable = localeCatalog.filter((locale) => locale.selectable && !requiredLocales.includes(locale.code))
if (unexpectedSelectable.length) failures.push(`Unexpected selectable locale(s): ${unexpectedSelectable.map((locale) => locale.code).join(', ')}`)

console.table(rows)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Validated ${requiredLocales.length} selectable locales against ${manifest.stringCount} public strings and ${interfaceKeys.size} interface keys.`)
