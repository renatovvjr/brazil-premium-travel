import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const LOCAL_API_ROUTES = new Map([
  ['/api/intake', () => import('./api/intake.js')],
  ['/api/unsubscribe', () => import('./api/unsubscribe.js')],
  ['/api/process-email-outbox', () => import('./api/process-email-outbox.js')],
])

const sendJson = (res, status, payload) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const readJsonBody = async (req) => {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 32 * 1024) {
      const error = new Error('Request body is too large.')
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.status = 400
    throw error
  }
}

const localApiPlugin = (mode) => ({
  name: 'workspace-staging-local-api',
  configureServer(server) {
    if (mode !== 'workspace-staging') return
    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname
      const loadHandler = LOCAL_API_ROUTES.get(pathname)
      if (!loadHandler) return next()

      res.status = (status) => {
        res.statusCode = status
        return res
      }
      res.json = (payload) => {
        if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(payload))
        return res
      }

      try {
        if (!['GET', 'HEAD'].includes(req.method || '')) req.body = await readJsonBody(req)
        const module = await loadHandler()
        await module.default(req, res)
      } catch (error) {
        if (!res.writableEnded) sendJson(res, error.status || 500, { error: error.status ? error.message : 'Local API request failed.' })
      }
    })
  },
})

export default defineConfig(({ mode }) => {
  const vercelEnvironment =
    process.env.VERCEL_ENV ||
    process.env.VERCEL_TARGET_ENV ||
    process.env.VITE_VERCEL_ENV ||
    ''
  const visualPreviewRequested = process.env.VITE_CARNAVAL_VISUAL_PREVIEW === 'true'
  const workspaceV2Requested = process.env.VITE_WORKSPACE_V2_ENABLED === 'true'
  const workspaceV2IntakeRequested = process.env.VITE_WORKSPACE_V2_INTAKE_ENABLED === 'true'
  const isVerifiedVercelPreview = visualPreviewRequested && vercelEnvironment === 'preview'

  if (vercelEnvironment === 'preview' && !visualPreviewRequested) {
    throw new Error(
      'Vercel Preview builds require VITE_CARNAVAL_VISUAL_PREVIEW=true so Supabase remains isolated.',
    )
  }

  if (visualPreviewRequested && vercelEnvironment !== 'preview') {
    throw new Error(
      'VITE_CARNAVAL_VISUAL_PREVIEW may only be enabled when the verified Vercel environment is preview.',
    )
  }

  if ((workspaceV2Requested || workspaceV2IntakeRequested) && vercelEnvironment === 'production' && process.env.WORKSPACE_V2_PRODUCTION_APPROVED !== 'true') {
    throw new Error('Workspace 2.0 production builds require WORKSPACE_V2_PRODUCTION_APPROVED=true.')
  }

  if (workspaceV2IntakeRequested && !workspaceV2Requested) {
    throw new Error('Workspace 2.0 intake requires VITE_WORKSPACE_V2_ENABLED=true.')
  }

  if ((workspaceV2Requested || workspaceV2IntakeRequested) && visualPreviewRequested) {
    throw new Error('Workspace 2.0 cannot use the blocked Carnaval visual Preview environment.')
  }

  return {
    plugins: [react(), tailwindcss(), localApiPlugin(mode)],
    define: {
      __CARNAVAL_VISUAL_PREVIEW__: JSON.stringify(isVerifiedVercelPreview),
    },
  }
})
