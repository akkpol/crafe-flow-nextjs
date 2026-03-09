# QA Agent - Unit Tests

This directory is owned by **QA Agent**.

## Core Principle

```
🔴 DISCOVER → LOG → REPORT
🚫 DO NOT FIX CODE
```

## Test Commands

```bash
# Run all tests
npm run test

# Run specific file
npm run test -- __tests__/path/to/test.ts

# Run with coverage
npm run test -- --coverage
```

## Issue Logging

Log failures to `.codex/issues/unit-test-failures.yaml`:

```yaml
- id: "UT-XXX"
  severity: "blocker"
  test_file: "__tests__/path/test.ts"
  test_name: "should calculate total correctly"
  error:
    type: "AssertionError"
    message: "Expected 100 but got 95"
  assigned_to: null
  status: "open"
```

## Rules

- NEVER fix source code - only log issues
- Run tests one file at a time if parallel
- Report summary to PM after each run
