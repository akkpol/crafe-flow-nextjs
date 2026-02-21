import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateRole } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // Check access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: myProfile } = await supabase
        .from('profiles')
        .select('roles(name)')
        .eq('id', user.id)
        .single()

    // @ts-ignore
    if (myProfile?.roles?.name !== 'admin') {
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <Card className="w-full max-w-md border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="text-red-600">
                        You do not have permission to view this page. Please contact an administrator.
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
            *,
            roles (
                name
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
            <h1 className="text-3xl font-black tracking-tight">User Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users ({profiles?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {profiles?.map((profile) => (
                            <div key={profile.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                                <div>
                                    <p className="font-bold">{profile.full_name || 'No Name'}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{profile.email}</p>
                                    <p className="text-xs text-muted-foreground mt-1">ID: {profile.id}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant={
                                        // @ts-ignore
                                        profile.roles?.name === 'admin' ? 'destructive' :
                                            // @ts-ignore
                                            profile.roles?.name === 'manager' ? 'default' : 'secondary'
                                    } className="capitalize">
                                        {/* @ts-ignore */}
                                        {profile.roles?.name || 'No Role'}
                                    </Badge>

                                    <div className="flex items-center gap-1 border-l pl-4 ml-2">
                                        <form action={async () => {
                                            'use server'
                                            await updateRole(profile.id, 'admin')
                                        }}>
                                            <Button size="sm" variant="ghost" className="text-xs h-7" type="submit">Make Admin</Button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await updateRole(profile.id, 'manager')
                                        }}>
                                            <Button size="sm" variant="ghost" className="text-xs h-7" type="submit">Make Manager</Button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await updateRole(profile.id, 'staff')
                                        }}>
                                            <Button size="sm" variant="ghost" className="text-xs h-7" type="submit">Make Staff</Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
