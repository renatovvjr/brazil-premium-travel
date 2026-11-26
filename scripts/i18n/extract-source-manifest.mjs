import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import parserModule from '@babel/parser'
import traverseModule from '@babel/traverse'

const { parse } = parserModule
const traverse = traverseModule.default
const root = process.cwd()
const sourceRoot = path.join(root, 'src')
const outputPath = path.join(sourceRoot, 'locales', 'manifests', 'source.en-AU.json')

const contentPropertyNames = new Set([
  'alt', 'answer', 'copy', 'description', 'eyebrow', 'heading', 'highlight', 'introduction',
  'label', 'message', 'name', 'note', 'question', 'subtitle', 'summary', 'tag', 'text', 'title',
])
const translatableAttributes = new Set(['alt', 'aria-label', 'placeholder', 'title'])
const technicalValues = new Set([
  'idle', 'sending', 'sent', 'preview', 'error', 'loading', 'signature', 'all-inclusive',
  'leads', 'applications', 'customers', 'bookings', 'finance', 'marketing', 'operations',
  'dashboard', 'true', 'false', 'GET', 'POST', 'PUT', 'DELETE',
])
const protectedBrandPhrases = new Set([
  'Curated Brazil', 'Curated Brazil Travel', 'Brazil Signature Journey',
  'Curated Brazil Signature', 'Curated Brazil All-Inclusive', 'Carnaval Collection 2027',
  'Grand Carnaval Journey', 'Rio & Bahia Carnaval Escape', 'Rio & Minas Carnaval Heritage',
])
const tailwindToken = /(?:^|\s)(?:sm:|md:|lg:|xl:)?(?:bg|text|border|rounded|shadow|px|py|p|m|mt|mb|ml|mr|mx|my|w|h|min|max|grid|flex|items|justify|gap|space|tracking|leading|font|transition|hover|focus|absolute|relative|fixed|inset|top|right|bottom|left|z|overflow|object|opacity)-/
const nonContent = /^(?:[a-z0-9_-]+|#[a-z0-9_-]+|\/[A-Za-z0-9_./:?=&-]+)$/

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (['lib', 'locales'].includes(entry.name)) return []
      return listSourceFiles(fullPath)
    }
    if (!/\.(?:js|jsx)$/.test(entry.name)) return []
    if (entry.name === 'main.jsx' || entry.name.startsWith('Workspace')) return []
    return [fullPath]
  })
}

function normalise(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function isTranslatable(value) {
  if (!value || value.length < 2 || !/[A-Za-zÀ-ž]/.test(value)) return false
  if (technicalValues.has(value) || protectedBrandPhrases.has(value)) return false
  if (value.includes('@') || /^https?:/i.test(value) || /^mailto:/i.test(value)) return false
  if (/\.(?:png|jpe?g|webp|svg|js|jsx|css)$/i.test(value)) return false
  if (tailwindToken.test(value) || nonContent.test(value)) return false
  return true
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function protectCommercialTokens(source) {
  const tokens = []
  const patterns = [
    /AUD\s?[\d,.]+(?:k)?(?:[–-][\d,.]+k?)?/gi,
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{4})?\b/g,
    /\b\d+\s+(?:days?|nights?|travellers?|travelers?|guests?)\b/gi,
  ]
  let template = source
  for (const pattern of patterns) {
    template = template.replace(pattern, (match) => {
      const placeholder = `{{LOCKED_${tokens.length}}}`
      tokens.push({ placeholder, value: match })
      return placeholder
    })
  }
  return { template, lockedTokens: tokens }
}

const phrases = new Map()
function addPhrase(rawValue, file, line, context) {
  const source = normalise(rawValue)
  if (!isTranslatable(source)) return
  const record = phrases.get(source) || { source, locations: [] }
  record.locations.push({ file: path.relative(root, file).replaceAll('\\', '/'), line: line || 1, context })
  phrases.set(source, record)
}

for (const file of listSourceFiles(sourceRoot)) {
  const code = fs.readFileSync(file, 'utf8')
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] })
  traverse(ast, {
    JSXText(nodePath) {
      addPhrase(nodePath.node.value, file, nodePath.node.loc?.start.line, 'jsx-text')
    },
    JSXAttribute(nodePath) {
      const name = nodePath.node.name?.name
      const value = nodePath.node.value
      if (translatableAttributes.has(name) && value?.type === 'StringLiteral') {
        addPhrase(value.value, file, value.loc?.start.line, `attribute:${name}`)
      }
    },
    ObjectProperty(nodePath) {
      const key = nodePath.node.key
      const propertyName = key.type === 'Identifier' ? key.name : key.value
      const value = nodePath.node.value
      if (contentPropertyNames.has(propertyName) && value?.type === 'StringLiteral') {
        addPhrase(value.value, file, value.loc?.start.line, `property:${propertyName}`)
      }
      if (contentPropertyNames.has(propertyName) && value?.type === 'TemplateLiteral' && value.expressions.length === 0) {
        addPhrase(value.quasis[0]?.value.cooked || '', file, value.loc?.start.line, `property:${propertyName}`)
      }
    },
    ArrayExpression(nodePath) {
      for (const element of nodePath.node.elements) {
        if (element?.type !== 'StringLiteral') continue
        if (/\s/.test(element.value) || /^[A-ZÀ-Ž]/.test(element.value)) {
          addPhrase(element.value, file, element.loc?.start.line, 'array-option')
        }
      }
    },
    CallExpression(nodePath) {
      if (nodePath.node.callee.type === 'Identifier' && nodePath.node.callee.name === 'alert') {
        const argument = nodePath.node.arguments[0]
        if (argument?.type === 'StringLiteral') addPhrase(argument.value, file, argument.loc?.start.line, 'alert')
      }
    },
  })
}

const i18nSource = fs.readFileSync(path.join(sourceRoot, 'i18n.jsx'), 'utf8')
const englishStart = i18nSource.indexOf("  'en-AU': {")
const englishEnd = i18nSource.indexOf("  'pt-BR': {", englishStart)
for (const match of i18nSource.slice(englishStart, englishEnd).matchAll(/^\s{4}'[^']+':\s*'((?:\\'|[^'])*)'/gm)) {
  addPhrase(match[1].replaceAll("\\'", "'"), path.join(sourceRoot, 'i18n.jsx'), 1, 'i18n-key')
}

const entries = [...phrases.values()]
  .sort((a, b) => a.source.localeCompare(b.source, 'en'))
  .map((record) => {
    const sourceHash = hash(record.source)
    return {
      id: `text.${sourceHash.slice(0, 16)}`,
      sourceHash,
      ...protectCommercialTokens(record.source),
      source: record.source,
      locations: record.locations,
    }
  })

const manifest = {
  schemaVersion: 1,
  sourceLocale: 'en-AU',
  translationVersion: '2026-11-24.1',
  sourceHash: hash(entries.map((entry) => `${entry.id}:${entry.sourceHash}`).join('\n')),
  stringCount: entries.length,
  characterCount: entries.reduce((total, entry) => total + entry.source.length, 0),
  entries,
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Wrote ${manifest.stringCount} deduplicated strings (${manifest.characterCount} characters) to ${path.relative(root, outputPath)}.`)
