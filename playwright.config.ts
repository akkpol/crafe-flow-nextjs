import { defineConfig, devices } from '@playwright/test'

/**
 * CraftFlow E2E Test Configuration
 * Uses Chromium for primary testing (fastest).
 * Auth state is stored in .auth/ to avoid re-logging in between tests.
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: false, // Sequential for better debugging locally
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 1,
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
    ],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        locale: 'th-TH',
    },
    projects: [
        // Setup project: handles auth once, stores session
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        // Main tests run after setup
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: '.auth/user.json',
            },
            dependencies: ['setup'],
        },
    ],
    // Auto-start dev server for local testing
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true, // Don't restart if already running
        timeout: 120 * 1000,
    },
})
