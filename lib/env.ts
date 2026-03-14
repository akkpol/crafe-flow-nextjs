export function getMissingSupabaseEnv(): string[] {
    const missing: string[] = []

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        missing.push('NEXT_PUBLIC_SUPABASE_URL')
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return missing
}

export function isSupabaseConfigured(): boolean {
    return getMissingSupabaseEnv().length === 0
}
