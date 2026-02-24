import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Route permission rules:
// - /admin/*     → admin only
// - /billing/*   → admin, manager
// - /invoices/*  → admin, manager
// - /receipts/*  → admin, manager
// - /reports/*   → admin, manager
// - /kanban      → admin, manager, staff
// - /jobs/*      → admin, manager, staff
// - /stock/*     → admin, manager, staff
// - /customers/* → admin, manager
// Everything else → all authenticated users

const ADMIN_ROUTES = ['/admin']
const MANAGER_ROUTES = ['/billing', '/invoices', '/receipts', '/reports', '/customers']
const STAFF_ROUTES = ['/kanban', '/jobs', '/stock']

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

    // 1. Unauthenticated → redirect to /login
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

        // 2. No role (pending approval) → /pending
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

        // 3. Admin routes → only admin
        if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
            if (roleName !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/' // redirect to dashboard
                url.searchParams.set('access_denied', '1')
                return NextResponse.redirect(url)
            }
        }

        // 4. Manager routes → admin or manager
        if (MANAGER_ROUTES.some(r => pathname.startsWith(r))) {
            if (roleName !== 'admin' && roleName !== 'manager') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                url.searchParams.set('access_denied', '1')
                return NextResponse.redirect(url)
            }
        }

        // 5. Staff routes → admin, manager, or staff
        if (STAFF_ROUTES.some(r => pathname.startsWith(r))) {
            if (roleName !== 'admin' && roleName !== 'manager' && roleName !== 'staff') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                url.searchParams.set('access_denied', '1')
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
