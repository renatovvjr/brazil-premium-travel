import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const manifestPath = path.join(root, 'src', 'locales', 'manifests', 'source.en-AU.json')
const i18nPath = path.join(root, 'src', 'i18n.jsx')
const outputDirectory = path.join(root, 'src', 'locales', 'generated')

const localeTargets = {
  'pt-BR': 'pt',
  'zh-Hans': 'zh',
  fr: 'fr',
  ar: 'ar',
  ja: 'ja',
  ko: 'ko',
  it: 'it',
  es: 'es',
  tr: 'tr',
  de: 'de',
}

const protectedBrandPhrases = [
  'Grand Carnaval Journey',
  'Rio & Bahia Carnaval Escape',
  'Rio & Minas Carnaval Heritage',
  'Curated Brazil All-Inclusive',
  'Curated Brazil Signature',
  'Curated Brazil Travel',
  'Brazil Signature Journey',
  'Carnaval Collection 2027',
  'Curated Brazil',
].sort((a, b) => b.length - a.length)

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : fallback
}

const locale = argument('--locale')
const port = Number(argument('--port', '9224'))
const batchSize = Number(argument('--batch-size', '20'))
const force = process.argv.includes('--force')
const targetLanguage = localeTargets[locale]
if (!targetLanguage) throw new Error(`Unsupported --locale. Use one of: ${Object.keys(localeTargets).join(', ')}`)

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const i18nSource = fs.readFileSync(i18nPath, 'utf8').replaceAll('\r\n', '\n')

function block(startMarker, endMarker) {
  const start = i18nSource.indexOf(startMarker)
  const end = i18nSource.indexOf(endMarker, start + startMarker.length)
  if (start < 0 || end < 0) throw new Error(`Could not read interface block ${startMarker}`)
  const values = {}
  for (const match of i18nSource.slice(start, end).matchAll(/^\s{4}'([^']+)':\s*'((?:\\'|[^'])*)'/gm)) {
    values[match[1]] = match[2].replaceAll("\\'", "'")
  }
  return values
}

const englishInterface = block("  'en-AU': {", "  'pt-BR': {")
const existingInterface = locale === 'pt-BR'
  ? block("  'pt-BR': {", '  es: {')
  : locale === 'es'
    ? block('  es: {', '\n}\n\nexport const translationResources')
    : {}

const outputPath = path.join(outputDirectory, `${locale}.json`)
let output = {
  schemaVersion: 1,
  locale,
  sourceLocale: 'en-AU',
  translationVersion: manifest.translationVersion,
  sourceManifestHash: manifest.sourceHash,
  complete: false,
  entryCount: manifest.stringCount,
  interfaceKeyCount: Object.keys(englishInterface).length,
  translations: {},
  interface: { ...existingInterface },
  sourceTranslations: {},
}

if (!force && fs.existsSync(outputPath)) {
  const saved = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  if (saved.sourceManifestHash === manifest.sourceHash && saved.locale === locale) output = saved
}

fs.mkdirSync(outputDirectory, { recursive: true })

function save() {
  output.sourceTranslations = Object.fromEntries(manifest.entries
    .filter((entry) => output.translations[entry.id])
    .map((entry) => [entry.source, output.translations[entry.id]]))
  output.complete = Object.keys(output.translations).length === manifest.stringCount
    && Object.keys(output.interface).length === Object.keys(englishInterface).length
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
}

function protectText(source, lockedTokens = []) {
  const replacements = []
  const values = [
    ...lockedTokens.map((token) => token.value),
    ...protectedBrandPhrases,
    ...(source.match(/\{[^{}]+\}/g) || []),
    ...(source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []),
    ...(source.match(/https?:\/\/[^\s]+/gi) || []),
  ]

  const protectedValues = [...new Set(values)]
    .filter((item) => item && source.includes(item))
    .sort((a, b) => b.length - a.length)
  const segments = []
  let cursor = 0

  while (cursor < source.length) {
    const match = protectedValues
      .map((value) => ({ value, index: source.indexOf(value, cursor) }))
      .filter(({ index }) => index >= 0)
      .sort((a, b) => a.index - b.index || b.value.length - a.value.length)[0]

    if (!match) {
      segments.push({ protected: false, value: source.slice(cursor) })
      break
    }
    if (match.index > cursor) segments.push({ protected: false, value: source.slice(cursor, match.index) })
    segments.push({ protected: true, value: match.value })
    cursor = match.index + match.value.length
  }
  if (!source.length) segments.push({ protected: false, value: '' })

  const text = segments.map((segment) => {
    if (!segment.protected) return segment.value
    const marker = `\uE000${replacements.length.toString(36)}\uE001`
    replacements.push({ marker, value: segment.value })
    return marker
  }).join('')
  return { text, replacements, segments }
}

function restoreText(translated, replacements) {
  let value = translated
  for (const replacement of replacements) {
    if (!value.includes(replacement.marker)) {
      throw new Error(`Translation dropped protected token ${JSON.stringify(replacement.value)}`)
    }
    value = value.replace(replacement.marker, replacement.value)
  }
  if (/[\uE000\uE001]/u.test(value)) throw new Error('Translation returned an unknown protected marker')
  return value.trim()
}

function preserveWhitespace(original, translated) {
  const leading = original.match(/^\s*/u)?.[0] || ''
  const trailing = original.match(/\s*$/u)?.[0] || ''
  return `${leading}${translated.trim()}${trailing}`
}

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json())
const page = targets.find((target) => target.type === 'page' && /^https:\/\//.test(target.url))
  || targets.find((target) => target.type === 'page' && /^http:\/\/127\.0\.0\.1/.test(target.url))
if (!page) throw new Error(`No Chrome page target found on port ${port}.`)

const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  const handler = pending.get(message.id)
  if (!handler) return
  pending.delete(message.id)
  handler(message)
})

function command(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => pending.set(id, resolve))
}

async function evaluate(expression) {
  const response = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.error || response.result?.exceptionDetails) {
    const details = response.result?.exceptionDetails
    throw new Error(
      response.error?.message
      || details?.exception?.description
      || details?.text
      || 'Chrome evaluation failed.',
    )
  }
  return response.result?.result?.value
}

const translatorKey = `__curatedBrazilTranslator_${targetLanguage.replaceAll('-', '_')}`
const setup = await evaluate(`(async () => ({
  availability: await Translator.availability(${JSON.stringify({ sourceLanguage: 'en', targetLanguage })})
}))()`)
await evaluate(`(() => {
  if (globalThis[${JSON.stringify(translatorKey)}]) return;
  const button = document.createElement('button');
  button.id = '__curated_brazil_translator_consent';
  button.textContent = 'Enable local translation';
  button.style.cssText = 'position:fixed;inset:0 auto auto 0;width:240px;height:80px;z-index:2147483647';
  button.addEventListener('click', () => {
    globalThis[${JSON.stringify(translatorKey)}] = Translator.create(${JSON.stringify({ sourceLanguage: 'en', targetLanguage })});
  }, { once: true });
  document.body.appendChild(button);
})()`)
await command('Page.bringToFront')
await command('Emulation.setFocusEmulationEnabled', { enabled: true })
await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: 20, y: 20, button: 'left', clickCount: 1 })
await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 20, y: 20, button: 'left', clickCount: 1 })
await evaluate(`(async () => {
  if (!globalThis[${JSON.stringify(translatorKey)}]) throw new Error('Translator consent click did not fire.');
  globalThis[${JSON.stringify(translatorKey)}] = await globalThis[${JSON.stringify(translatorKey)}];
  document.getElementById('__curated_brazil_translator_consent')?.remove();
  return true;
})()`)
console.log(`${locale}: translator ${setup.availability}.`)

async function translateBatch(items) {
  const prepared = items.map((item) => {
    const protectedValue = protectText(item.source, item.lockedTokens)
    return { ...item, ...protectedValue }
  })
  const browserItems = prepared.map((item) => ({ key: item.key, text: item.text }))
  const translated = await evaluate(`(async () => {
    const translator = globalThis[${JSON.stringify(translatorKey)}];
    const items = ${JSON.stringify(browserItems)};
    const result = {};
    for (const item of items) result[item.key] = await translator.translate(item.text);
    return result;
  })()`)
  const result = {}
  for (const item of prepared) {
    try {
      result[item.key] = restoreText(translated[item.key], item.replacements)
      continue
    } catch (error) {
      if (!item.replacements.length) throw error
      console.warn(`${locale}: protected-token fallback for ${item.key}: ${error.message}`)
    }

    const translatableSegments = item.segments
      .map((segment, index) => ({ ...segment, key: `${item.key}:${index}` }))
      .filter((segment) => !segment.protected && /\p{L}/u.test(segment.value))
    const segmentTranslations = translatableSegments.length
      ? await evaluate(`(async () => {
          const translator = globalThis[${JSON.stringify(translatorKey)}];
          const items = ${JSON.stringify(translatableSegments)};
          const result = {};
          for (const item of items) result[item.key] = await translator.translate(item.value.trim());
          return result;
        })()`)
      : {}
    result[item.key] = item.segments.map((segment, index) => segment.protected
      ? segment.value
      : preserveWhitespace(segment.value, segmentTranslations[`${item.key}:${index}`] || segment.value)).join('').trim()
  }
  return result
}

const manifestQueue = manifest.entries
  .filter((entry) => !output.translations[entry.id])
  .map((entry) => ({ key: entry.id, source: entry.source, lockedTokens: entry.lockedTokens }))

for (let index = 0; index < manifestQueue.length; index += batchSize) {
  const batch = manifestQueue.slice(index, index + batchSize)
  Object.assign(output.translations, await translateBatch(batch))
  save()
  console.log(`${locale}: ${Object.keys(output.translations).length}/${manifest.stringCount} content strings.`)
}

const interfaceQueue = Object.entries(englishInterface)
  .filter(([key]) => !output.interface[key])
  .map(([key, source]) => ({ key, source, lockedTokens: [] }))

for (let index = 0; index < interfaceQueue.length; index += batchSize) {
  const batch = interfaceQueue.slice(index, index + batchSize)
  Object.assign(output.interface, await translateBatch(batch))
  save()
  console.log(`${locale}: ${Object.keys(output.interface).length}/${Object.keys(englishInterface).length} interface keys.`)
}

save()
socket.close()
console.log(`${locale}: ${output.complete ? 'complete' : 'incomplete'} static resource saved to ${path.relative(root, outputPath)}.`)
