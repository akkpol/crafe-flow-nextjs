
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'
import { getMissingSupabaseEnv } from './env'

// Client-side only
export function createBrowser() {
    const missing = getMissingSupabaseEnv()
    if (missing.length > 0) {
        throw new Error(
            `Supabase environment is not configured. Missing: ${missing.join(', ')}`
        )
    }

    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Re-export server client for backward compatibility if needed, but it WILL fail in client components if imported.
// So we should NOT export server client here if this file is imported by client components.
// We will migrate usages.

