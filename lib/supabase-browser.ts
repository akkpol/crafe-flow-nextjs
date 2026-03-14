
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'
import { getMissingSupabaseEnv } from './env'

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
