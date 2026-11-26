import { createHash } from 'node:crypto'
import { sanitizeAttribution, validateIntake } from '../../src/lib/workspaceDomain.js'

const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export const hashRequest = (value) => createHash('sha256').update(stable(value)).digest('hex')

export async function processIntake({ body, idempotencyKey, requestContext = {}, repository }) {
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(String(idempotencyKey || ''))) {
    const error = new Error('A valid Idempotency-Key header is required.')
    error.status = 400
    throw error
  }
  const validated = validateIntake(body)
  const attribution = sanitizeAttribution(body.attribution)
  const requestHash = hashRequest({ ...validated, attribution })
  const result = await repository.persist({
    ...validated,
    attribution,
    idempotencyKey,
    requestHash,
    requestContext,
  })
  if (!result?.submissionReference) throw new Error('The enquiry could not be stored.')
  return {
    status: result.replayed ? 200 : 201,
    body: {
      ok: true,
      replayed: Boolean(result.replayed),
      submissionReference: result.submissionReference,
    },
  }
}
