import { redirect } from 'next/navigation'

// /admin → /admin/users
export default function AdminPage() {
    redirect('/admin/users')
}
