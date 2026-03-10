---
description: Standard step-by-step cycle for building a new ERP feature from scratch
---

# ERP Feature Development Cycle

Use this workflow by running `/erp-feature-cycle` whenever the user asks to start building a new feature or module for CraftFlow.

## Execution Steps

1. **Understand Requirements (PLANNING Mode)**
   - Read the relevant section of `craftflow-complete-specs.md`.
   - Inspect existing database schemas and related modules in the codebase to understand dependencies.

2. **Generate Implementation Plan (PLANNING Mode)**
   - Create or update `implementation_plan.md` in the artifact directory.
   - Outline Database/Schema changes, Backend API/Server Actions, and Frontend UI components.
   - Document any migration strategies to ensure Data Integrity.

3. **Request Review**
   - Use the `notify_user` tool to present the `implementation_plan.md`.
   - Ask for approval or clarifications. Halt execution until the user approves.

4. **Implementation (EXECUTION Mode)**
   - Step 1: Apply Database schema changes and run migrations.
   - Step 2: Create Backend Server Actions with strict Zod validation.
   - Step 3: Build Frontend UI components adhering to Thai language rules and layout standards.

5. **End-to-End Validation (VERIFICATION Mode)**
   - Run type checks and fix any TypeScript errors across the stack.
   - Use the `browser_subagent` to test the new feature through the UI, ensuring data flows correctly to the database.
   - Only declare the task "Complete" when tests pass and data integrity is verified.
