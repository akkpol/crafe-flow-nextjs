---
description: Execute a Backend Agent task for server actions and validation
---

# Backend Agent Task Workflow

## Prerequisites
1. Read `.codex/skills/backend-agent/SKILL.md` first
2. Check task assignment in `.codex/status/multi-agent-status.yaml`

## Execution Steps

// turbo
1. Read the Backend Agent skill file:
   ```
   Read .codex/skills/backend-agent/SKILL.md
   ```

2. Check current status board:
   ```
   Read .codex/status/multi-agent-status.yaml
   ```

3. Read only the relevant spec section from `craftflow-complete-specs.md`

4. Check existing patterns in `actions/*.ts`

5. Implement server action following patterns:
   - Use Zod for validation
   - Use `.issues` not `.errors` for ZodError
   - Return structured response `{ success, data/error }`
   - Call `revalidatePath` where needed
   - Thai error messages for user-facing errors

6. Self-review against quality gates:
   - [ ] Server action returns correct response
   - [ ] Zod validation covers all inputs
   - [ ] Error handling implemented
   - [ ] No TypeScript errors

7. If issues found in OTHER files, log to `.codex/issues/` - DO NOT FIX

8. Report completion status
