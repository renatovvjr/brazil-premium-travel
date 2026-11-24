import assert from 'node:assert/strict'
import countryHandler from '../api/country.js'
import { resolveLocale } from '../src/locales/detection.js'

const cases = [
  [{ browserLanguages: ['en-AU'], country: 'AU' }, 'en-AU'],
  [{ browserLanguages: ['en'], country: 'NZ' }, 'en-NZ'],
  [{ browserLanguages: ['zh-CN', 'en-AU'], country: 'AU' }, 'en-AU'],
  [{ browserLanguages: ['vi-VN', 'en-AU'], country: 'AU' }, 'en-AU'],
  [{ browserLanguages: ['pt-BR', 'en'], country: 'BR' }, 'en-AU'],
  [{ browserLanguages: ['en'], country: 'BR', saved: 'es' }, 'en-AU'],
  [{ browserLanguages: ['ar-SA'], country: 'AU' }, 'en-AU'],
  [{ browserLanguages: ['fa-IR'], country: 'NZ' }, 'en-NZ'],
]

for (const [input, expected] of cases) assert.equal(resolveLocale(input), expected, JSON.stringify(input))

let endpointPayload
countryHandler(
  { headers: { 'x-vercel-ip-country': 'nz' }, geo: {} },
  {
    setHeader() {},
    status(code) { assert.equal(code, 200); return this },
    json(payload) { endpointPayload = payload },
  },
)
assert.deepEqual(endpointPayload, { country: 'NZ' })

console.log(`Validated ${cases.length} locale-priority cases and the country-only Vercel endpoint.`)
