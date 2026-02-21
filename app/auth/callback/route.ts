import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Create profile if not exists (for OAuth signups)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                if (!existingProfile) {
                    // Check if this is the first user
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })

                    let roleId = null

                    // If no profiles exist, make this user an Admin
                    if (count === 0) {
                        const { data: adminRole } = await supabase
                            .from('roles')
                            .select('id')
                            .eq('name', 'admin')
                            .single()

                        if (adminRole) {
                            roleId = adminRole.id
                        }
                    }

                    await supabase.from('profiles').insert({
                        id: user.id,
                        email: user.email!,
                        full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                        avatar_url: user.user_metadata.avatar_url,
                        role_id: roleId
                    })
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
