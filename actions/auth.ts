'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(prevState: { error: string } | null, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Please provide both email and password' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        // Sync profile - ensure it exists
        // We check if it exists first to avoid overwriting existing data if we want, 
        // but UPSERT with DO NOTHING or checking existence is safer if we don't want to reset fields.
        // Ideally, we just ensure the row exists.
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()

        if (!profile) {
            await supabase.from('profiles').insert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                // role_id will be null (or default via DB if set), effectively 'user' or 'staff' depending on logic
            })
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: { error: string } | null, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password) {
        return { error: 'Please provide email and password' }
    }

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (authData.user) {
        // 2. Create a profile entry (Trigger handles this usually, but good to be explicit or if trigger fails)
        // Actually, our trigger only handles `auth.users` -> `public.profiles` if we set it up that way.
        // The previous migration didn't set up a trigger for `auth.users` -> `profiles`. 
        // It set up audit logs triggers.
        // So we should manually create the profile here to be safe and immediate.

        // Check if profile exists (Trigger might have created it if user set one up elsewhere)
        const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single()

        if (profileError && profileError.code === 'PGRST116') { // Not found
            // Check if this is the first user
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            let roleId = null

            if (count === 0) {
                const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'admin').single()
                if (adminRole) roleId = adminRole.id
            }

            await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    role_id: roleId
                })
        }

        // If duplicate key error, it means trigger already handled it or race condition. Safe to ignore if exists.
        if (profileError && profileError.code !== '23505') {
            console.error('Error creating profile:', profileError)
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function updateRole(userId: string, roleName: string) {
    const supabase = await createClient()

    // Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if caller is admin
    const { data: callerProfile } = await supabase
        .from('profiles')
        .select('roles(name)')
        .eq('id', user.id)
        .single()

    // @ts-ignore
    if (callerProfile?.roles?.name !== 'admin') {
        return { error: 'Permission denied: Admin only' }
    }

    // Get Role ID
    const { data: role } = await supabase.from('roles').select('id').eq('name', roleName).single()
    if (!role) return { error: `Role ${roleName} not found` }

    const { error } = await supabase.from('profiles').update({ role_id: role.id }).eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
}
