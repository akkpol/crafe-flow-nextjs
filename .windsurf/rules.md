# CraftFlow Development Rules

## Multi-Agent Team Structure

This project uses a specialized multi-agent team. Each agent has specific responsibilities and file ownership.

### Agent Roles

| Agent | Responsibility | Skill File |
|-------|---------------|------------|
| PM Agent | Orchestration, planning | `.codex/skills/pm-agent-dev-team/SKILL.md` |
| Frontend Agent | UI/UX, React, Tailwind | `.codex/skills/frontend-agent/SKILL.md` |
| Backend Agent | Server actions, validation | `.codex/skills/backend-agent/SKILL.md` |
| Database Agent | Schema, migrations (MCP) | `.codex/skills/database-agent/SKILL.md` |
| PDF Agent | Document generation | `.codex/skills/pdf-agent/SKILL.md` |
| QA Agent | Testing, issue logging | `.codex/skills/qa-agent/SKILL.md` |
| Integration Agent | Shared types | `.codex/skills/integration-agent/SKILL.md` |

### Before Starting Any Task

1. Read the relevant agent's SKILL.md file
2. Check `.codex/status/multi-agent-status.yaml` for current status
3. Check `.codex/locks/active-locks.yaml` for file locks
4. Read only the relevant spec section (minimize context)

## Software Warehouse Workflow

```
PLANNING → CODING → REVIEW → TESTING → ANALYSIS → BUG FIXING → DEPLOY
```

### Key Rules

1. **จดปัญหา ไม่แก้เอง** - Log issues to `.codex/issues/`, don't fix others' code
2. **ทำทีละ task** - Complete one task before starting next
3. **File ownership** - Each agent owns specific files, don't edit others'
4. **Terminal safety** - One dev server (port 3000), sequential test runs

## File Ownership

### Frontend Agent
- `app/**/page.tsx`, `app/**/layout.tsx`
- `components/**/*.tsx` (except `documents/`)

### Backend Agent
- `actions/*.ts`
- `lib/schemas.ts`, `lib/pricing-engine.ts`

### Database Agent
- `lib/database.types.ts`
- Uses MCP Supabase tools directly

### PDF Agent
- `components/documents/*.tsx`

### Integration Agent
- `lib/types.ts`

### QA Agent
- `__tests__/**/*.test.ts`
- `e2e/**/*.spec.ts`
- `.codex/issues/*.yaml` (append only)

## Issue Registry

All issues go to `.codex/issues/`:
- `typescript-errors.yaml` - TS compilation errors
- `unit-test-failures.yaml` - Unit test failures
- `e2e-failures.yaml` - E2E test failures
- `review-findings.yaml` - Code review findings
- `bugs.yaml` - Runtime bugs

## Terminal Conflict Prevention

```yaml
dev_server: "Windsurf only (port 3000)"
npm_install: "Windsurf only"
type_check: "Any agent (read-only)"
unit_test: "One file at a time"
e2e_test: "Requires dev server, run sequentially"
```

## CraftFlow Patterns

### Thai Language
- Labels in Thai: "บันทึก", "ยกเลิก"
- Technical terms in English: "Dashboard", "Kanban"
- Date format: `d MMMM yyyy` with Thai locale

### Zod Validation
```typescript
// CORRECT - use .issues
result.error.issues

// WRONG - .errors doesn't exist
result.error.errors
```

### Null Handling
```typescript
// CORRECT for form inputs
<Input value={field ?? ''} />
```

## Quick Reference

- **Spec file**: `craftflow-complete-specs.md`
- **Status board**: `.codex/status/multi-agent-status.yaml`
- **Lock registry**: `.codex/locks/active-locks.yaml`
- **Agent index**: `.codex/skills/AGENT-INDEX.md`
