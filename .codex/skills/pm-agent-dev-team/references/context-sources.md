# CraftFlow Context Sources

Use this file to decide which repo context to load before planning work.

## Product Docs

- `craftflow-complete-specs.md`
  Use for full feature intent, workflow coverage, role definitions, and future-state behavior.
  Start here when the request is broad or spans multiple modules.

- `CraftFlow - Project Scope.md`
  Use for phase boundaries, blockers, and launch prioritization.
  Start here when the request involves sequencing, MVP decisions, or delivery pressure.

- `docForAiandDev/CraftFlow - Project Scope.md`
  Use only if the root scope file appears stale or the user points at the mirrored doc.

## Code Anchors

- `app/`
  Use for route-level implementation state, current UX, and API surfaces.

- `components/`
  Use for shared UI patterns and implementation reuse opportunities.

- `lib/`
  Use for domain logic, integrations, data helpers, and cross-cutting code.

- `__tests__/` and `e2e/`
  Use for current verification coverage and to detect missing behavioral protection.

## Conflict Hotspots

Inspect these early when planning parallel work because they are likely to create collisions:

- `components/documents/DocumentLayout.tsx`
  Shared by billing, invoices, and receipts.

- `lib/types.ts`
  Central workflow and domain type definitions.

- `lib/database.types.ts`
  Shared generated or schema-driven database types.

- `actions/*.ts`
  Server-side domain entry points that often fan out to multiple routes.

- `components/ui/*`
  Shared UI primitives that can create wide regressions.

## Practical Loading Order

Choose the smallest path that matches the request:

1. Scope or prioritization question:
   Read `CraftFlow - Project Scope.md`, then inspect only the affected code paths.
2. Feature implementation planning:
   Read the relevant section in `craftflow-complete-specs.md`, then inspect the matching `app/`, `components/`, and `lib/` files.
3. Status or progress check:
   Compare the stated status in scope docs against the actual code and tests.
4. Blocker escalation:
   Confirm the blocker in docs, identify missing implementation pieces in code, and write the unblock path.

## CraftFlow Planning Heuristics

- Treat Phase 1 parity gaps as more important than net-new improvements.
- Prefer slices that unblock document generation, file handling, customer visibility, or financial flow completion.
- Avoid planning work only from docs; always verify current implementation state in code.
- If the code already partially implements a feature, plan completion around the missing edge cases and verification rather than rewriting from scratch.
- When multiple agents are involved, check whether the requested work touches a conflict hotspot before assigning a lane.
