import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  const vercelEnvironment =
    process.env.VERCEL_ENV ||
    process.env.VERCEL_TARGET_ENV ||
    process.env.VITE_VERCEL_ENV ||
    ''
  const visualPreviewRequested = process.env.VITE_CARNAVAL_VISUAL_PREVIEW === 'true'
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

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __CARNAVAL_VISUAL_PREVIEW__: JSON.stringify(isVerifiedVercelPreview),
    },
  }
})
