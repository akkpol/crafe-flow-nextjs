# CraftFlow ERP - Multi-Agent Development Rules

## Team Structure

This project uses a specialized multi-agent team. Each agent has specific responsibilities and file ownership.

| Agent | Focus | Skill |
|-------|-------|-------|
| PM Agent | Orchestration, planning | `@pm-agent` |
| Frontend Agent | UI/UX, React, Tailwind | `@frontend-agent` |
| Backend Agent | Server actions, validation | `@backend-agent` |
| Database Agent | Schema, MCP Supabase | `@database-agent` |
| PDF Agent | Document generation | `@pdf-agent` |
| QA Agent | Testing, issue logging | `@qa-agent` |
| Integration Agent | Shared types | `@integration-agent` |

## Software Warehouse Workflow

```
PLANNING → CODING → REVIEW → TESTING → ANALYSIS → BUG FIXING → DEPLOY
```

## Key Rules

1. **จดปัญหา ไม่แก้เอง** - Log issues to `.codex/issues/`, don't fix others' code
2. **ทำทีละ task** - Complete one task before starting next
3. **File ownership** - Each agent owns specific files, don't edit others'
4. **Terminal safety** - One dev server (port 3000), sequential test runs

## File Ownership

| Files | Owner |
|-------|-------|
| `app/**/page.tsx`, `components/**/*.tsx` | Frontend Agent |
| `actions/*.ts`, `lib/schemas.ts` | Backend Agent |
| `lib/types.ts` | Integration Agent |
| `lib/database.types.ts` | Database Agent |
| `components/documents/*` | PDF Agent |
| `__tests__/**`, `e2e/**` | QA Agent |

## CraftFlow Patterns

### Thai Language
- Labels in Thai: "บันทึก", "ยกเลิก", "ค้นหา"
- Technical terms in English: "Dashboard", "Kanban"
- Date format: `d MMMM yyyy` with Thai locale
- Currency: `฿X,XXX.XX`

### Zod Validation (IMPORTANT)
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

## Issue Registry

All issues go to `.codex/issues/`:
- `typescript-errors.yaml`
- `unit-test-failures.yaml`
- `e2e-failures.yaml`
- `review-findings.yaml`
- `bugs.yaml`

## Terminal Conflict Prevention

```yaml
dev_server: "Single owner only (port 3000)"
npm_install: "Single owner only"
type_check: "Any agent (read-only)"
unit_test: "One file at a time"
e2e_test: "Requires dev server, run sequentially"
```

## Quick Reference

- **Spec file**: `craftflow-complete-specs.md`
- **Status board**: `.codex/status/multi-agent-status.yaml`
- **Lock registry**: `.codex/locks/active-locks.yaml`
