import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Route Permission Matrix ────────────────────────────────────────────────
// Admin-only routes: user management
const ADMIN_ONLY_ROUTES = ['/admin']

// Manager and above: finance routes
const MANAGER_ROUTES = ['/billing', '/invoices', '/receipts']

// Staff and above: production routes
// REMOVED: staff now has access to these by default, guests/viewers are blocked
// const STAFF_ROUTES = ['/kanban', '/jobs', '/stock']
// ────────────────────────────────────────────────────────────────────────────

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request: { headers: request.headers } })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // ── 1. Not logged in → /login ───────────────────────────────────────────
    if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role_id, roles(name)')
            .eq('id', user.id)
            .single()

        const roleName = (profile?.roles as any)?.name as string | undefined
        const isPending = !profile?.role_id

        // ── 2. No role → /pending ───────────────────────────────────────────
        if (isPending && !pathname.startsWith('/pending') && !pathname.startsWith('/auth')) {
            const url = request.nextUrl.clone()
            url.pathname = '/pending'
            return NextResponse.redirect(url)
        }

        if (!isPending && pathname.startsWith('/pending')) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // ── 3. /admin/* → admin only ────────────────────────────────────────
        if (ADMIN_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
            if (roleName !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                url.searchParams.set('access_denied', 'admin')
                return NextResponse.redirect(url)
            }
        }

        // ── 4. Finance routes → admin + manager + staff ─────────────────────
        // CHANGED: staff can now view billing (read-only enforced at component level)
        if (MANAGER_ROUTES.some(r => pathname.startsWith(r))) {
            if (roleName !== 'admin' && roleName !== 'manager' && roleName !== 'staff') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                url.searchParams.set('access_denied', 'manager')
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)',
    ],
}
