# QA Agent - E2E Tests

This directory is owned by **QA Agent**.

## Core Principle

```
🔴 DISCOVER → LOG → REPORT
🚫 DO NOT FIX CODE
```

## Prerequisites

- Dev server must be running on port 3000
- No other E2E tests running

## Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- e2e/billing.spec.ts

# Run with UI
npm run test:e2e -- --ui
```

## Issue Logging

Log failures to `.codex/issues/e2e-failures.yaml`:

```yaml
- id: "E2E-XXX"
  severity: "high"
  test_file: "e2e/billing.spec.ts"
  test_name: "should create quotation"
  browser: "chromium"
  error:
    type: "TimeoutError"
    message: "Locator.click: Timeout 30000ms exceeded"
  steps_before_failure:
    - "Navigate to /billing/new"
    - "Fill customer field"
    - "Click submit (FAILED)"
  assigned_to: null
  status: "open"
```

## Rules

- NEVER fix source code - only log issues
- Check dev server is running before tests
- Run tests sequentially
- Report summary to PM after each run
