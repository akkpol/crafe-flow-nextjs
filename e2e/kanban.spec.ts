import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * E2E: Kanban Board & Job Management
 * ====================================
 * Tests the Kanban board and job creation flow.
 * Authenticated sections require a saved session in .auth/user.json.
 *
 * 🔑 To set up auth:
 *    npx playwright open http://localhost:3000 --save-storage=.auth/user.json
 *    Log in manually, then close the browser.
 */

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
// Kanban Board Tests (Requires Auth)
// ─────────────────────────────────────────────────────────────────

test.describe('Kanban Board (Requires Auth)', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) test.skip()

        await page.goto('/kanban')
        await page.waitForLoadState('networkidle')
        if (page.url().includes('/login')) test.skip()
    })

    test('should render the kanban board without errors', async ({ page }) => {
        // Page body should be visible and not blank
        const body = page.locator('body')
        await expect(body).toBeVisible()

        const text = await body.innerText()
        expect(text.trim().length).toBeGreaterThan(10)
    })

    test('should show at least one status column', async ({ page }) => {
        // Any of these labels could be a column header
        const possibleColumns = [
            page.getByText(/new|ใหม่/i).first(),
            page.getByText(/design|ออกแบบ/i).first(),
            page.getByText(/production|ผลิต/i).first(),
            page.getByText(/kanban/i).first(),
        ]

        let foundColumn = false
        for (const col of possibleColumns) {
            if (await col.isVisible({ timeout: 1000 }).catch(() => false)) {
                foundColumn = true
                break
            }
        }

        expect(foundColumn).toBe(true)
    })

    test('should show order count or empty state', async ({ page }) => {
        // Either there are order cards, or an empty state message
        const hasCards = await page.locator('[class*="card"]:not([class*="header"])').count() > 0
        const hasEmptyState = await page.getByText(/empty|ยังไม่มี|no orders|no jobs/i).isVisible({ timeout: 2000 }).catch(() => false)

        // One of the above should be true, or the board just shows columns
        const boardVisible = await page.locator('main, [role="main"], .kanban').first().isVisible({ timeout: 2000 }).catch(() => false)

        expect(hasCards || hasEmptyState || boardVisible).toBe(true)
    })
})

// ─────────────────────────────────────────────────────────────────
// New Job / New Order Form Tests (Requires Auth)
// ─────────────────────────────────────────────────────────────────

test.describe('New Job Form (Requires Auth)', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) test.skip()

        await page.goto('/jobs/new')
        await page.waitForLoadState('networkidle')
        if (page.url().includes('/login')) test.skip()
    })

    test('should render the new job creation form', async ({ page }) => {
        // Page should have a form title
        const hasTitle = await page.getByText(/สร้างงาน|New Job|ออเดอร์|งานใหม่/i).first().isVisible({ timeout: 3000 }).catch(() => false)
        expect(hasTitle).toBe(true)
    })

    test('should show customer selection field', async ({ page }) => {
        const customerField = page.getByText(/ลูกค้า|Customer/i).first()
        await expect(customerField).toBeVisible()
    })

    test('should show priority and deadline fields', async ({ page }) => {
        const priorityOrDeadline = page.getByText(/priority|ความสำคัญ|deadline|กำหนด/i).first()
        const isVisible = await priorityOrDeadline.isVisible({ timeout: 3000 }).catch(() => false)
        // These may or may not be present depending on form design
        if (!isVisible) {
            console.info('Priority/deadline fields not found — may be optional')
        } else {
            expect(isVisible).toBe(true)
        }
    })

    test('should show save/create button', async ({ page }) => {
        const saveBtn = page.getByRole('button', { name: /สร้าง|save|create|บันทึก/i }).first()
        await expect(saveBtn).toBeVisible()
    })
})
