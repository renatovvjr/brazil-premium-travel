import { createClient } from '@supabase/supabase-js'

const previewBlockedError = {
  message: 'Supabase access is disabled in the Carnaval visual Preview.',
}

const blockedResult = () => Promise.resolve({ data: null, error: previewBlockedError })

const createBlockedQuery = () => {
  let query

  query = new Proxy(
    {},
    {
      get: (_target, property) => {
        if (property === 'then') {
          const result = blockedResult()
          return result.then.bind(result)
        }

        return () => query
      },
    },
  )

  return query
}

const createPreviewSupabase = () => ({
  from: () => createBlockedQuery(),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
    signInWithPassword: blockedResult,
    signOut: async () => ({ error: null }),
  },
})

export const supabase = __CARNAVAL_VISUAL_PREVIEW__
  ? createPreviewSupabase()
  : createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
