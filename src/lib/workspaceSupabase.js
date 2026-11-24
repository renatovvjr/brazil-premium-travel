import { createClient } from '@supabase/supabase-js'

const configurationError = { message: 'Workspace 2.0 requires a dedicated non-production Supabase configuration.' }
const blockedResult = () => Promise.resolve({ data: null, error: configurationError })

const createBlockedQuery = () => {
  let query
  query = new Proxy({}, {
    get: (_target, property) => {
      if (property === 'then') {
        const result = blockedResult()
        return result.then.bind(result)
      }
      return () => query
    },
  })
  return query
}

const createBlockedClient = () => ({
  from: () => createBlockedQuery(),
  rpc: blockedResult,
  auth: {
    getSession: async () => ({ data: { session: null }, error: configurationError }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: blockedResult,
    signOut: async () => ({ error: null }),
  },
})

const url = import.meta.env.VITE_WORKSPACE_V2_SUPABASE_URL
const anonKey = import.meta.env.VITE_WORKSPACE_V2_SUPABASE_ANON_KEY

export const workspaceSupabase = url && anonKey
  ? createClient(url, anonKey)
  : createBlockedClient()
