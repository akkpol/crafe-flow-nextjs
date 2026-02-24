import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleDropdown } from '@/components/auth/RoleDropdown'
import { Shield, Users, Clock, Crown, Briefcase, Eye } from 'lucide-react'

const ROLE_CONFIG = {
    admin: {
        label: 'Admin',
        variant: 'destructive' as const,
        icon: Crown,
        description: 'จัดการได้ทุกอย่าง',
    },
    manager: {
        label: 'Manager',
        variant: 'default' as const,
        icon: Briefcase,
        description: 'บิล สต็อก ลูกค้า',
    },
    staff: {
        label: 'Staff',
        variant: 'secondary' as const,
        icon: Users,
        description: 'ออเดอร์ สต็อก',
    },
    viewer: {
        label: 'Viewer',
        variant: 'outline' as const,
        icon: Eye,
        description: 'ดูได้อย่างเดียว',
    },
} as const

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // Auth check
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
            <div className="flex min-h-[60vh] items-center justify-center p-8">
                <Card className="w-full max-w-md border-red-200">
                    <CardHeader className="text-center pb-2">
                        <Shield className="h-12 w-12 text-red-400 mx-auto mb-2" />
                        <CardTitle className="text-red-700">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อ Admin
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .order('created_at', { ascending: false })

    const { data: allRoles } = await supabase
        .from('roles')
        .select('id, name, permissions')
        .order('name')

    // Stats
    const roleCounts = profiles?.reduce((acc, p) => {
        const role = (p.roles as any)?.name || 'pending'
        acc[role] = (acc[role] || 0) + 1
        return acc
    }, {} as Record<string, number>) ?? {}

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-black tracking-tight">User Management</h1>
                    <p className="text-muted-foreground text-sm">จัดการ Role และสิทธิ์การเข้าถึงของผู้ใช้</p>
                </div>
            </div>

            {/* Role Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(ROLE_CONFIG).map(([roleName, config]) => {
                    const Icon = config.icon
                    return (
                        <Card key={roleName}>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{config.label}</p>
                                        <p className="text-2xl font-bold">{roleCounts[roleName] || 0}</p>
                                    </div>
                                    <Icon className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Role Descriptions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">สิทธิ์แต่ละ Role</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                        {allRoles?.map((role) => (
                            <div key={role.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                <Badge
                                    variant={ROLE_CONFIG[role.name as keyof typeof ROLE_CONFIG]?.variant ?? 'secondary'}
                                    className="mt-0.5 shrink-0 capitalize"
                                >
                                    {role.name}
                                </Badge>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {Array.isArray(role.permissions)
                                            ? (role.permissions as string[]).join(', ')
                                            : JSON.stringify(role.permissions)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* User List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        ผู้ใช้ทั้งหมด ({profiles?.length || 0} คน)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {profiles?.map((profile) => {
                            const roleName = (profile.roles as any)?.name as keyof typeof ROLE_CONFIG | undefined
                            const roleConf = roleName ? ROLE_CONFIG[roleName] : null
                            const Icon = roleConf?.icon ?? Clock

                            return (
                                <div
                                    key={profile.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 hover:bg-muted/30 transition-colors"
                                >
                                    {/* User Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-primary">
                                                {(profile.full_name || profile.email || '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold leading-tight">{profile.full_name || '—'}</p>
                                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                                                สมัครเมื่อ {profile.created_at
                                                    ? new Date(profile.created_at).toLocaleDateString('th-TH')
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role + Actions */}
                                    <div className="flex items-center gap-3 pl-13 sm:pl-0">
                                        <div className="flex items-center gap-1.5">
                                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            <Badge
                                                variant={roleConf?.variant ?? 'outline'}
                                                className="capitalize text-xs"
                                            >
                                                {roleName ?? 'No Role'}
                                            </Badge>
                                        </div>

                                        {/* Don't show role change for yourself */}
                                        {profile.id !== user.id && (
                                            <RoleDropdown
                                                userId={profile.id}
                                                currentRole={roleName ?? null}
                                            />
                                        )}
                                        {profile.id === user.id && (
                                            <span className="text-xs text-muted-foreground italic">(คุณ)</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {(!profiles || profiles.length === 0) && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>ยังไม่มีผู้ใช้ในระบบ</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
