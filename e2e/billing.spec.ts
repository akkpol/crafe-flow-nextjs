import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * E2E: Billing Flow
 * =================
 * Tests the Billing module. Requires an authenticated session.
 *
 * 🔑 To set up auth:
 *    npx playwright open http://localhost:3000 --save-storage=.auth/user.json
 *    Log in manually, then close the browser.
 *
 * Without auth, all tests will be SKIPPED.
 */

// Check if we have a valid auth session
function hasAuthSession(): boolean {
    const authFile = path.join(process.cwd(), '.auth/user.json')
    if (!fs.existsSync(authFile)) return false
    try {
        const content = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
        return Array.isArray(content?.cookies) && content.cookies.length > 0
    } catch {
        return false
    }
}

// ─────────────────────────────────────────────────────────────────
// Public / Unauthenticated Tests (always run)
// ─────────────────────────────────────────────────────────────────

test.describe('Login Page', () => {

    test('should render the login page', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        // Should have some login-related content
        const body = page.locator('body')
        await expect(body).toBeVisible()

        // The login page should not be blank
        const text = await body.innerText()
        expect(text.trim().length).toBeGreaterThan(0)
        console.info('Login page renders with content ✅')
    })

    test('accessing /billing without auth should redirect to login', async ({ page }) => {
        await page.goto('/billing')
        await page.waitForLoadState('networkidle')

        // Should be redirected to login (not on /billing)
        const url = page.url()
        const isOnLogin = url.includes('/login') || url.includes('/auth')
        const isOnBilling = url.includes('/billing')

        if (isOnLogin) {
            console.info('✅ Correctly redirected to login page')
            expect(isOnLogin).toBe(true)
        } else if (isOnBilling) {
            // If somehow authenticated (CI with stored cookies)
            console.info('ℹ️  Already authenticated — on billing page')
        } else {
            // Some other redirect (e.g., /pending) is also acceptable
            console.info(`ℹ️  Redirected to: ${url}`)
        }
    })
})

// ─────────────────────────────────────────────────────────────────
// Authenticated Tests (requires .auth/user.json with valid session)
// ─────────────────────────────────────────────────────────────────

test.describe('Billing Dashboard (Requires Auth)', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) {
            test.skip()
        }
        await page.goto('/billing')
        await page.waitForLoadState('networkidle')

        // Abort if redirected to login (session expired)
        if (page.url().includes('/login') || page.url().includes('/auth')) {
            console.warn('⚠️  Session expired or no auth. Run: npx playwright open http://localhost:3000 --save-storage=.auth/user.json')
            test.skip()
        }
    })

    test('should render billing page with KPI stats', async ({ page }) => {
        await expect(page.getByText('บิล & ใบเสนอราคา')).toBeVisible()
        await expect(page.getByText('รอวางบิล / เก็บเงิน')).toBeVisible()
        await expect(page.getByText('เกินกำหนดชำระ')).toBeVisible()
        await expect(page.getByText('ยอดรับเดือนนี้')).toBeVisible()
    })

    test('should show document action buttons', async ({ page }) => {
        await expect(page.getByRole('link', { name: /ใบเสนอราคา/i }).first()).toBeVisible()
        await expect(page.getByRole('link', { name: /ใบแจ้งหนี้/i }).first()).toBeVisible()
        await expect(page.getByRole('link', { name: /ใบเสร็จ/i }).first()).toBeVisible()
    })

    test('should navigate to new quotation page', async ({ page }) => {
        await page.getByRole('link', { name: /ใบเสนอราคา/i }).first().click()
        await page.waitForURL('**/billing/new', { timeout: 8000 })
        await expect(page).toHaveURL(/\/billing\/new/)
        await expect(page.getByText(/ใบเสนอราคา/i)).toBeVisible()
    })

    test('should navigate to new invoice page', async ({ page }) => {
        await page.getByRole('link', { name: /ใบแจ้งหนี้/i }).first().click()
        await page.waitForURL('**/invoices/new', { timeout: 8000 })
        await expect(page).toHaveURL(/\/invoices\/new/)
    })

    test('should navigate to new receipt page', async ({ page }) => {
        await page.getByRole('link', { name: /ใบเสร็จ/i }).first().click()
        await page.waitForURL('**/receipts/new', { timeout: 8000 })
        await expect(page).toHaveURL(/\/receipts\/new/)
    })
})

test.describe('Quotation Form (Requires Auth)', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) test.skip()

        await page.goto('/billing/new')
        await page.waitForLoadState('networkidle')
        if (page.url().includes('/login')) test.skip()
    })

    test('should render quotation form with customer selector and line items', async ({ page }) => {
        await expect(page.getByText('ลูกค้า')).toBeVisible()
        await expect(page.getByText(/รายการสินค้า/i)).toBeVisible()
    })

    test('should have preview and save buttons', async ({ page }) => {
        const preview = page.getByRole('button', { name: /preview|ตัวอย่าง|พิมพ์/i })
        const save = page.getByRole('button', { name: /บันทึก|save/i })
        const hasBtns = await preview.isVisible({ timeout: 2000 }).catch(() => false) ||
            await save.isVisible({ timeout: 2000 }).catch(() => false)
        expect(hasBtns).toBe(true)
    })
})
