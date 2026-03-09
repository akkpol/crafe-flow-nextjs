---
description: Execute a Frontend Agent task for UI/UX implementation
---

# Frontend Agent Task Workflow

## Prerequisites
1. Read `.codex/skills/frontend-agent/SKILL.md` first
2. Check task assignment in `.codex/status/multi-agent-status.yaml`
3. Check file locks in `.codex/locks/active-locks.yaml`

## Execution Steps

// turbo
1. Read the Frontend Agent skill file:
   ```
   Read .codex/skills/frontend-agent/SKILL.md
   ```

2. Check current status board:
   ```
   Read .codex/status/multi-agent-status.yaml
   ```

3. Read only the relevant spec section from `craftflow-complete-specs.md` (check skill file for line numbers)

4. Check existing patterns in similar components

5. Implement the UI component following CraftFlow patterns:
   - Use Tailwind CSS
   - Use shadcn/ui components
   - Thai labels, English technical terms
   - Handle null values with `?? ''`

6. Self-review against quality gates:
   - [ ] Component renders without errors
   - [ ] Responsive on mobile/desktop
   - [ ] No TypeScript errors
   - [ ] Thai text displays correctly

7. If issues found in OTHER files, log to `.codex/issues/` - DO NOT FIX

8. Report completion status
