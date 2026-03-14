import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { expectSuccessToast } from './helpers'

/**
 * E2E: Job Progress Tracking
 * ====================================
 * Tests the ability to update job progress from the Kanban board.
 */

function hasAuthSession(): boolean {
    const authFile = path.join(process.cwd(), '.auth/user.json')
    return fs.existsSync(authFile)
}

test.describe('Job Progress Tracking', () => {

    test.beforeEach(async ({ page }) => {
        if (!hasAuthSession()) {
            console.warn('Skipping E2E test: No auth session found in .auth/user.json')
            test.skip()
        }

        await page.goto('/kanban')
        await page.waitForLoadState('networkidle')
    })

    test('should update progress from job details dialog', async ({ page }) => {
        // 1. Find the first job card and click it
        const firstCard = page.locator('[class*="card"]').first()
        await expect(firstCard).toBeVisible()
        await firstCard.click()

        // 2. Verify dialog opened
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()

        // 3. Find the progress section
        const progressHeading = dialog.getByText(/ความคืบหน้า|progress/i)
        await expect(progressHeading).toBeVisible()

        // 4. Update progress using a preset button (e.g., 75%)
        await dialog.getByRole('button', { name: '75%' }).click()

        // 5. Verify local percentage UI updated
        const progressValue = dialog.getByText('75%')
        await expect(progressValue).toBeVisible()

        // 6. Click Save
        await dialog.getByRole('button', { name: /บันทึก|save/i }).click()

        // 7. Success toast should appear
        await expectSuccessToast(page, 'อัปเดตความคืบหน้าแล้ว')

        // 8. Close dialog
        await page.keyboard.press('Escape')

        // 9. Verify Kanban card now shows 75%
        await expect(firstCard.getByText('75%')).toBeVisible()
        
        // 10. Verify progress bar exists on card
        const progressBar = firstCard.locator('[role="progressbar"]')
        await expect(progressBar).toBeVisible()
    })
})
