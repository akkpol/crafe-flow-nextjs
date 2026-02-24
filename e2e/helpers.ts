import { Page, expect } from '@playwright/test'

/**
 * Shared E2E Helpers for CraftFlow
 * ===================================
 * Reusable page object-style helpers for common user flows.
 * Keeps test specs clean and DRY.
 */

// ─────────────────────────────────────
// Navigation Helpers
// ─────────────────────────────────────

export async function navigateToDashboard(page: Page) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
}

export async function navigateToPage(page: Page, path: string) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
}

// ─────────────────────────────────────
// Auth Helpers
// ─────────────────────────────────────

/**
 * Check if the user is on a page that requires login.
 * Redirects to /login mean the session has expired.
 */
export async function expectAuthenticatedPage(page: Page) {
    const url = page.url()
    expect(url).not.toContain('/login')
    expect(url).not.toContain('/pending')
}

// ─────────────────────────────────────
// Customer Helpers
// ─────────────────────────────────────

/**
 * Select a customer from a combobox field by searching for their name.
 * Assumes a shadcn/ui Command-based combobox pattern.
 */
export async function selectCustomer(page: Page, customerName: string) {
    // Click on the customer combobox trigger
    const comboboxTrigger = page.getByRole('combobox').first()
    await comboboxTrigger.click()

    // Type to search  
    const searchInput = page.getByPlaceholder(/ค้นหา|search/i)
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchInput.fill(customerName)
    }

    // Wait for option and click
    const option = page.getByRole('option', { name: customerName }).first()
    await option.waitFor({ timeout: 5000 })
    await option.click()
}

// ─────────────────────────────────────
// Form Helpers
// ─────────────────────────────────────

export async function fillInput(page: Page, label: string, value: string) {
    const input = page.getByLabel(label)
    await input.click()
    await input.fill(value)
}

export async function clickButton(page: Page, name: string | RegExp) {
    const btn = page.getByRole('button', { name })
    await btn.waitFor({ state: 'visible', timeout: 5000 })
    await btn.click()
}

// ─────────────────────────────────────
// Toast / Notification Helpers
// ─────────────────────────────────────

export async function expectSuccessToast(page: Page, partialText?: string) {
    const toast = page.locator('[data-sonner-toast]').first()
    await toast.waitFor({ state: 'visible', timeout: 8000 })

    if (partialText) {
        await expect(toast).toContainText(partialText, { timeout: 5000 })
    }
}

export async function expectErrorToast(page: Page, partialText?: string) {
    const toast = page.locator('[data-sonner-toast][data-type="error"]').first()
    await toast.waitFor({ state: 'visible', timeout: 8000 })

    if (partialText) {
        await expect(toast).toContainText(partialText, { timeout: 5000 })
    }
}

// ─────────────────────────────────────
// Wait Helpers
// ─────────────────────────────────────

export async function waitForNavigation(page: Page, urlPattern: string | RegExp) {
    await page.waitForURL(urlPattern, { timeout: 10000 })
}
