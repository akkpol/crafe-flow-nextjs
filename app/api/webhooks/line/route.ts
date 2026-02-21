import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import * as line from '@line/bot-sdk'

// Config should come from env but for now we set up structure
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const events = body.events as line.WebhookEvent[]

        if (!events || events.length === 0) {
            return NextResponse.json({ message: 'OK' })
        }

        const supabase = await createClient()

        // Process each event
        for (const event of events) {
            if (event.type === 'message' || event.type === 'follow') {
                const userId = event.source.userId
                if (userId) {
                    // Fetch Profile
                    // Note: In real app, init client with config
                    const client = new line.messagingApi.MessagingApiClient(config)

                    try {
                        const profile = await client.getProfile(userId)

                        // Upsert to DB
                        await supabase.from('line_users').upsert({
                            line_user_id: userId,
                            display_name: profile.displayName,
                            picture_url: profile.pictureUrl,
                            status_message: profile.statusMessage,
                            language: profile.language,
                            last_interaction: new Date().toISOString(),
                            is_friend: true
                        }, { onConflict: 'line_user_id' })

                    } catch (e) {
                        console.error('Error fetching LINE profile:', e)
                        // Even if profile fails (blocked?), update timestamp if we have them
                        await supabase.from('line_users').update({
                            last_interaction: new Date().toISOString()
                        }).eq('line_user_id', userId)
                    }
                }
            }

            if (event.type === 'unfollow') {
                const userId = event.source.userId
                if (userId) {
                    await supabase.from('line_users').update({
                        is_friend: false,
                        last_interaction: new Date().toISOString()
                    }).eq('line_user_id', userId)
                }
            }
        }

        return NextResponse.json({ message: 'OK' })

    } catch (error) {
        console.error('LINE Webhook Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
