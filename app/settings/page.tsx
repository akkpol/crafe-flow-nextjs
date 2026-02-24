import { redirect } from 'next/navigation'

// /settings → /settings/organization
export default function SettingsPage() {
    redirect('/settings/organization')
}
