# Multi-Agent Operating Model

Use this file when the goal is to let several coding agents work in parallel without stepping on each other.

## Role Model

- PM agent
  Own release goal, lane map, lock board, dependency order, and status reporting.

- Integration agent
  Own shared contracts and conflict-prone surfaces. Merge shared changes before downstream lane work.

- Lane agents
  Own one domain lane each. Stay inside the agreed file surface unless the PM explicitly expands it.

- QA agent
  Verify cross-lane behavior, regression risks, and release readiness after integration.

## Non-Negotiable Rules

1. One file, one owner, one time.
2. One agent owns one lane at a time.
3. Shared files require a lock and usually an integration task first.
4. No lane agent edits shared types or schemas casually.
5. No merge without verification evidence.
6. No agent starts a blocked task because "it looks small".

## Safe Execution Pattern

1. PM defines milestone and lane map.
2. Integration agent lands shared contract changes first.
3. Lane agents implement against the new contract in parallel.
4. QA agent validates the combined flow.
5. PM closes the milestone only after acceptance criteria and blocker review.

## Worktree and Branch Rules

- Use one git worktree or isolated branch per agent task.
- Name branches by lane and slice, for example `agent/docs-pdf-export` or `agent/customer-balance`.
- Rebase or merge from the integration branch only at declared sync points, not continuously.
- Do not stack unrelated features in one branch.

## Locking Model

Track locks as a simple manifest in the PM output or issue body.

Each lock should contain:

- Owner
- Lane
- Files or glob paths
- Purpose
- Start time
- Expected release time
- Dependency on another lock, if any

Typical lock scopes:

- `components/documents/DocumentLayout.tsx`
- `lib/types.ts`
- `lib/database.types.ts`
- `actions/*.ts` that are touched by multiple lanes
- shared UI primitives in `components/ui/`

## Interface Contract Rule

Create a contract before changing any shared surface:

- What changes
- Which lanes depend on it
- Whether the change is backward compatible
- Which tests prove the contract
- Which merge must happen first

If the contract is not stable enough to describe in five bullets, the work is not ready for parallel execution.

## CraftFlow Lane Map

Use this default mapping for Phase 1 and Phase 2 unless the codebase changes materially.

### Lane A: Finance Documents

- Primary paths:
  - `app/billing/**`
  - `app/invoices/**`
  - `app/receipts/**`
  - `actions/billing.ts`
  - `actions/invoices.ts`
  - `actions/receipts.ts`
- Typical scope:
  - quotation, invoice, receipt flows
  - PDF export behavior
- Shared-risk surfaces:
  - `components/documents/DocumentLayout.tsx`
  - shared amount or type definitions in `lib/`

### Lane B: Production and Files

- Primary paths:
  - `app/files/**`
  - `app/jobs/**`
  - `app/kanban/**`
  - `actions/files.ts`
  - `actions/orders.ts`
  - `actions/history.ts`
- Typical scope:
  - design upload, proof upload, job notes, workflow completion
- Shared-risk surfaces:
  - order status types
  - reusable job dialogs or cards

### Lane C: Customer and Intake

- Primary paths:
  - `app/customers/**`
  - `app/api/webhooks/line/**`
  - `actions/customers.ts`
  - `actions/line.ts`
- Typical scope:
  - customer history, outstanding balance, intake linkage
- Shared-risk surfaces:
  - customer summary types
  - shared search components

### Lane D: Settings and Admin

- Primary paths:
  - `app/settings/**`
  - `app/admin/**`
  - `actions/organization.ts`
  - `actions/profiles.ts`
  - `actions/auth.ts`
- Typical scope:
  - logo, signature, bank settings, permissions, admin support work
- Shared-risk surfaces:
  - auth and profile models

### Integration Lane

- Primary paths:
  - `lib/types.ts`
  - `lib/database.types.ts`
  - `lib/schemas.ts`
  - `components/documents/DocumentLayout.tsx`
  - shared `components/ui/**` where required

Use the integration lane to absorb shared changes that would otherwise create collisions across lane agents.

## Recommended Phase 1 Parallelization

Start with these waves for CraftFlow:

### Wave 0: Contracts and Locks

- Integration lane defines document export contract, file metadata contract, and customer balance data contract.
- PM freezes ownership and publishes the lock board.

### Wave 1: Phase 1 Blockers

- Lane A: PDF export for quotation, invoice, receipt
- Lane B: design file upload and retrieval
- Lane C: customer history and outstanding balance

### Wave 2: Remaining P0 Completion

- Lane A: edit quotation
- Lane B: proof upload and job notes
- Lane D: bank account, logo, signature settings
- Integration lane: final type harmonization and cross-lane cleanup

### Wave 3: Release Readiness

- QA agent verifies end-to-end parity scenarios
- PM resolves final scope cuts and deployment blockers

## Escalation Rules

Escalate to PM immediately when:

- Two tasks claim the same file or module
- A lane needs to change a shared contract unexpectedly
- A blocker invalidates the current milestone plan
- Verification fails on integrated behavior
- Docs and code disagree on the intended behavior

## Definition of Done for a Lane Slice

A slice is not done until all are true:

- Intended code change is merged or ready to merge
- Tests or manual verification evidence exist
- Any lock held by the slice is released
- Downstream lane impact is called out
- PM status is updated
