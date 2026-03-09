# CraftFlow Agent Skills Index

## Overview

แต่ละ Agent มี skill เฉพาะทางเพื่อลด context และเพิ่มประสิทธิภาพ

## Agent Registry

| Agent | Skill File | Primary Focus | Context Reduction |
|-------|------------|---------------|-------------------|
| **PM Agent** | `pm-agent-dev-team/SKILL.md` | Orchestration, planning, status | Full context |
| **Frontend Agent** | `frontend-agent/SKILL.md` | UI/UX, React, Tailwind | ~83% |
| **Backend Agent** | `backend-agent/SKILL.md` | Server actions, validation | ~78% |
| **Database Agent** | `database-agent/SKILL.md` | Schema, migrations, MCP Supabase | ~85% |
| **PDF Agent** | `pdf-agent/SKILL.md` | Document generation, Thai fonts | ~92% |
| **QA Agent** | `qa-agent/SKILL.md` | Testing, issue logging | ~80% |
| **Integration Agent** | `integration-agent/SKILL.md` | Shared types, coordination | ~75% |

## File Ownership Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FILE OWNERSHIP MATRIX                            │
├─────────────────────────────────────────────────────────────────────────┤
│ File/Directory          │ Owner              │ Others                   │
├─────────────────────────┼────────────────────┼──────────────────────────┤
│ app/**/page.tsx         │ Frontend Agent     │ Read only                │
│ app/**/layout.tsx       │ Frontend Agent     │ Read only                │
│ components/**/*.tsx     │ Frontend Agent     │ Read only                │
│ components/documents/*  │ PDF Agent          │ Read only                │
│ components/ui/*         │ SHARED (lock)      │ Request lock             │
├─────────────────────────┼────────────────────┼──────────────────────────┤
│ actions/*.ts            │ Backend Agent      │ Read only                │
│ lib/schemas.ts          │ Backend Agent      │ Read only                │
│ lib/pricing-engine.ts   │ Backend Agent      │ Read only                │
│ app/api/**/*.ts         │ Backend Agent      │ Read only                │
├─────────────────────────┼────────────────────┼──────────────────────────┤
│ lib/types.ts            │ Integration Agent  │ Read only                │
│ lib/constants.ts        │ Integration Agent  │ Read only                │
├─────────────────────────┼────────────────────┼──────────────────────────┤
│ lib/database.types.ts   │ Database Agent     │ Read only                │
│ supabase/migrations/*   │ Database Agent     │ Read only                │
├─────────────────────────┼────────────────────┼──────────────────────────┤
│ __tests__/**/*.test.ts  │ QA Agent           │ Read only                │
│ e2e/**/*.spec.ts        │ QA Agent           │ Read only                │
│ .codex/issues/*         │ QA Agent           │ Append only              │
├─────────────────────────┼────────────────────┼──────────────────────────┤
│ .codex/status/*         │ PM Agent           │ Read only                │
│ .codex/locks/*          │ PM Agent           │ Read only                │
│ .codex/skills/*         │ PM Agent           │ Read only                │
└─────────────────────────┴────────────────────┴──────────────────────────┘
```

## MCP Tools by Agent

| Agent | MCP Tools |
|-------|-----------|
| **Database Agent** | `mcp8_list_tables`, `mcp8_execute_sql`, `mcp8_apply_migration`, `mcp8_generate_typescript_types`, `mcp8_list_migrations`, `mcp8_get_advisors` |
| **All Agents** | Standard file tools |

## Spec Section Mapping

เพื่อลด context แต่ละ agent อ่านเฉพาะ section ที่เกี่ยวข้องจาก `craftflow-complete-specs.md`:

| Agent | Spec Sections | Lines (Approx) |
|-------|---------------|----------------|
| Frontend | UI mockups, forms, layouts | 200-500, 2300-2500 |
| Backend | Business logic, validation, API | 500-900, 1700-2200 |
| Database | Data models, relationships | 3200-3500 |
| PDF | Document templates, Thai legal | 700-900, 1900-2100 |
| QA | Acceptance criteria, test cases | All (for verification) |

## Agent Communication Flow

```
                    ┌─────────────┐
                    │  PM Agent   │
                    │ (Windsurf)  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Frontend │    │ Backend  │    │ Database │
    │  Agent   │    │  Agent   │    │  Agent   │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         │               │               │
         ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │   PDF    │    │Integration│   │    QA    │
    │  Agent   │    │  Agent   │    │  Agent   │
    └──────────┘    └──────────┘    └──────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Issues    │
                    │  Registry   │
                    └─────────────┘
```

## Quick Reference: Which Agent for What?

| Task Type | Assign To |
|-----------|-----------|
| New page/component | Frontend Agent |
| Form validation | Backend Agent |
| Server action | Backend Agent |
| Database schema change | Database Agent |
| New table/index | Database Agent |
| PDF template | PDF Agent |
| Type definition change | Integration Agent |
| Run tests | QA Agent |
| Fix TypeScript error in types.ts | Integration Agent |
| Fix TypeScript error in actions/*.ts | Backend Agent |
| Fix TypeScript error in page.tsx | Frontend Agent |

## Activating an Agent

When assigning a task, tell the agent to read their skill file first:

```markdown
## Task Assignment: [Agent Name]

**Read First**: `.codex/skills/[agent-name]/SKILL.md`

**Task**: [description]
**Files**: [list]
**Spec Section**: [lines to read]
**Priority**: [P0/P1/P2]
```

## Context Loading Order

For any agent:

1. Read own `SKILL.md` (always first)
2. Read assigned task details
3. Read relevant spec section (minimal)
4. Read target files to modify
5. Check existing patterns in similar files
6. Implement
7. Log issues (don't fix others' code)
8. Report status
