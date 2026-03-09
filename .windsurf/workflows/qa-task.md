---
description: Execute QA Agent testing and issue logging
---

# QA Agent Task Workflow

## Core Principle
🔴 DISCOVER → LOG → REPORT
🚫 DO NOT FIX CODE

## Execution Steps

// turbo
1. Read the QA Agent skill file:
   ```
   Read .codex/skills/qa-agent/SKILL.md
   ```

2. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```
   Log errors to `.codex/issues/typescript-errors.yaml`

3. Run unit tests:
   ```bash
   npm run test
   ```
   Log failures to `.codex/issues/unit-test-failures.yaml`

4. Run E2E tests (if dev server running):
   ```bash
   npm run test:e2e
   ```
   Log failures to `.codex/issues/e2e-failures.yaml`

5. Generate summary report:
   ```markdown
   ## QA Test Report
   
   ### TypeScript: X errors
   ### Unit Tests: X passed, Y failed
   ### E2E Tests: X passed, Y failed
   
   ### New Issues Logged:
   - TS-XXX: [description]
   - UT-XXX: [description]
   ```

6. Report to PM - DO NOT FIX ANY CODE
