import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/user.json')

/**
 * Auth Setup: Log in once and save session state.
 * All other tests reuse this session via `storageState`.
 * 
 * This avoids re-authenticating on every test, making the suite much faster.
 */
setup('authenticate', async ({ page }) => {
    await page.goto('/login')

    // Wait for login page to be ready
    await page.waitForSelector('input[type="email"], button[aria-label*="Google"], .login-page', {
        timeout: 10000,
    })

    // Check if Google OAuth button exists (Supabase OAuth flow)
    const googleBtn = page.getByRole('button', { name: /google/i })
    if (await googleBtn.isVisible()) {
        // For CI/testing environments, we skip OAuth and use magic link or test credentials
        // In local dev, manually set cookies or use a test account
        console.warn('⚠️  Google OAuth detected. E2E tests require a logged-in session.')
        console.warn('    Run: npx playwright open --save-storage=.auth/user.json http://localhost:3000')
        console.warn('    Then log in manually, and re-run tests.')

        // For automated testing, check if already authenticated
        await page.goto('/')
        const isLoggedIn = await page.getByText('Dashboard').isVisible().catch(() => false)

        if (isLoggedIn) {
            await page.context().storageState({ path: authFile })
        } else {
            // Save empty state — tests will handle redirect gracefully
            await page.context().storageState({ path: authFile })
        }
        return
    }

    // Email/password login (if configured)
    const emailInput = page.getByLabel('Email')
    if (await emailInput.isVisible()) {
        await emailInput.fill(process.env.E2E_EMAIL || 'test@craftflow.th')
        await page.getByLabel('Password').fill(process.env.E2E_PASSWORD || 'test1234')
        await page.getByRole('button', { name: /sign in|login/i }).click()
    }

    // Wait for dashboard
    await page.waitForURL('/', { timeout: 15000 }).catch(() => { })

    // Save session
    await page.context().storageState({ path: authFile })
})
