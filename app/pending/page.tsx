'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'

export default function PendingPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <Clock className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Account Pending
                    </CardTitle>
                    <CardDescription className="pt-2 text-base">
                        Your account has been created but is waiting for administrator approval.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Please contact your system administrator to assign a role to your account.
                        Once approved, you will be able to access the dashboard.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <form action={logout}>
                        <Button variant="outline" className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}
