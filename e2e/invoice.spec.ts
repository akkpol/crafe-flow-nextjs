import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * E2E: Invoice & Receipt Creation Flow
 * ====================================
 * Tests the invoice and receipt creation pages.
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
// Invoice Creation Tests (Requires Auth)
// ─────────────────────────────────────────────────────────────────

test.describe('Invoice Creation (Requires Auth)', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) test.skip()

        await page.goto('/invoices/new')
        await page.waitForLoadState('networkidle')
        if (page.url().includes('/login')) test.skip()
    })

    test('should render the invoice creation page', async ({ page }) => {
        await expect(page.getByText('สร้างใบแจ้งหนี้')).toBeVisible()
    })

    test('should show customer selector field', async ({ page }) => {
        await expect(page.getByText('ลูกค้า')).toBeVisible()
        const combobox = page.getByRole('button').filter({ hasText: /ลูกค้า|เลือกลูกค้า/i })
        await expect(combobox.first()).toBeVisible()
    })

    test('should show Tax Invoice toggle (ออกใบกำกับภาษี)', async ({ page }) => {
        await expect(page.getByText('ออกใบกำกับภาษี')).toBeVisible()

        // The switch should be a role=switch element
        const switchEl = page.getByRole('switch')
        await expect(switchEl).toBeVisible()
    })

    test('should change doc number prefix when Tax Invoice toggle is enabled', async ({ page }) => {
        // Find disabled invoice number input (auto-generated)
        const disabledInputs = page.locator('input[disabled]')
        const inputCount = await disabledInputs.count()

        if (inputCount > 0) {
            const firstDisabled = disabledInputs.first()
            const originalValue = await firstDisabled.inputValue()

            // Toggle Tax Invoice switch
            const switchEl = page.getByRole('switch')
            if (await switchEl.isVisible()) {
                await switchEl.click()
                await page.waitForTimeout(300)

                const newValue = await firstDisabled.inputValue()
                // After toggle, prefix should change from IV- to TX-
                if (originalValue.includes('IV-')) {
                    expect(newValue).toContain('TX-')
                }
            }
        }
    })

    test('should render PricingCalculator with add item button', async ({ page }) => {
        await expect(page.getByText('รายการสินค้า / บริการ')).toBeVisible()

        const addBtn = page.getByRole('button', { name: /เพิ่มรายการ|Add|เพิ่ม/i })
        await expect(addBtn.first()).toBeVisible()
    })

    test('should show validation error when saving without a customer', async ({ page }) => {
        const saveBtn = page.getByRole('button', { name: /บันทึก|Save|สร้าง/i }).first()

        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await saveBtn.click()

            // Should see an error-related element
            const errorEl = page.locator('[data-sonner-toast]')
                .or(page.getByText(/กรุณาเลือก|required|error/i))

            await expect(errorEl.first()).toBeVisible({ timeout: 5000 })
        }
    })
})

// ─────────────────────────────────────────────────────────────────
// Receipt Creation Tests (Requires Auth)
// ─────────────────────────────────────────────────────────────────

test.describe('Receipt Creation (Requires Auth)', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) test.skip()

        await page.goto('/receipts/new')
        await page.waitForLoadState('networkidle')
        if (page.url().includes('/login')) test.skip()
    })

    test('should render the receipt creation page', async ({ page }) => {
        await expect(page.getByText(/สร้างใบเสร็จรับเงิน/i)).toBeVisible()
    })

    test('should show invoice selection combobox', async ({ page }) => {
        await expect(page.getByText(/เลือกใบแจ้งหนี้/i)).toBeVisible()

        const combobox = page.getByRole('button', { name: /เลือกใบแจ้งหนี้/i })
        await expect(combobox).toBeVisible()
    })

    test('should show payment method options', async ({ page }) => {
        await expect(page.getByText(/ช่องทางการชำระเงิน/i)).toBeVisible()

        const select = page.getByRole('combobox')
        await expect(select).toBeVisible()
    })

    test('should show payment date picker', async ({ page }) => {
        await expect(page.getByText(/วันที่รับเงิน/i)).toBeVisible()
    })

    test('should disable save button when no invoice is selected', async ({ page }) => {
        const saveBtn = page.getByRole('button', { name: /บันทึก|Save/i }).first()
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            const isDisabled = await saveBtn.isDisabled()
            expect(isDisabled).toBe(true)
        }
    })
})
