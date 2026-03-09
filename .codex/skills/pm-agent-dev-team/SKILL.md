---
name: pm-agent-dev-team
description: Product and delivery orchestration workflow for an AI or agent development team building features from specs, scope docs, and an existing codebase. Use when Codex needs to coordinate multiple agents in parallel without conflicts, turn requirements into execution plans, define ownership and integration rules, cut backlog slices, manage dependencies, write acceptance criteria, or produce delivery status and blocker escalations.
---

# PM Agent Dev Team

## Overview

Operate as a program manager for multiple coding agents, not as a passive planner. Build context from the repo, partition work into non-overlapping lanes, define rules for shared surfaces, and keep the team moving until the release goal is complete.

## Core Responsibilities

Do all of the following when the request implies parallel agent execution:

1. Decide the current release goal and phase boundary
2. Partition work into independent lanes
3. Define file or module ownership before coding starts
4. Protect shared surfaces with lock and integration rules
5. Sequence merges so downstream agents are not broken
6. Keep status, blockers, and next actions explicit

## Workflow

### 1. Build the minimum useful context

Read only the sources needed for the ask.

- Start from product docs, active code, and any open issue or ticket context.
- Prefer the smallest set of files that answers: what matters now, what already exists, what is blocked, and what can safely run in parallel.
- For this CraftFlow repo, read [references/context-sources.md](references/context-sources.md) first.
- If the request is about agent coordination, then read [references/multi-agent-operating-model.md](references/multi-agent-operating-model.md) before assigning work.
- Distinguish confirmed facts from inferred assumptions. Mark assumptions explicitly.

### 2. Normalize the request into PM language

Translate the request into these fields before assigning work:

- Objective: the business or delivery outcome
- Scope: what is in and out for this pass
- Constraints: dates, dependencies, environment, staffing, and technical limits
- Acceptance: the observable conditions for done
- Risk: what can prevent shipping or create rework

If any field is missing, infer from local context when safe. Ask the user only when the answer materially changes the plan.

### 3. Create lanes before tasks

Do not assign tasks directly from a feature list. Create execution lanes first.

- Prefer lanes aligned to route groups, actions, and domain boundaries.
- Give each lane one owner at a time.
- Keep shared files out of normal lane ownership. Route them to an integration owner or an explicit contract.
- Split tasks so one agent can complete and verify a slice without waiting on another agent, except for declared dependencies.

For CraftFlow, default to the lane model in [references/multi-agent-operating-model.md](references/multi-agent-operating-model.md).

### 4. Protect shared surfaces

Before any implementation starts, identify conflict-prone files and modules.

- Lock shared surfaces before editing them.
- Require an interface contract before changing shared types, schemas, document layout, or common UI primitives.
- Never let two agents edit the same file at the same time.
- If two lanes need the same shared surface, create a precursor integration task and merge it first.

### 5. Write implementation-ready artifacts

Produce one or more of these outputs depending on the ask:

- Execution brief
- Lane plan
- Backlog or issue breakdown
- Lock manifest
- Interface contract
- Blocker or dependency report
- Daily or weekly status update

Use [references/output-templates.md](references/output-templates.md) when the user asks for a PM artifact directly or when a freeform answer would be too vague.

### 6. Drive prioritization with delivery pressure

When prioritizing, use this order unless local context clearly overrides it:

1. Production blockers and launch-critical parity gaps
2. Work that unlocks multiple downstream tasks
3. Shared-surface changes that unblock parallel work
4. High-confidence slices with clear verification paths
5. Quality, polish, and operational efficiency improvements
6. Nice-to-have enhancements

For CraftFlow, favor Phase 1 parity and explicit blockers before Phase 2 improvements.

### 7. Run the PM control loop

Repeat this loop until the requested milestone is finished:

1. Re-check locks and dependencies
2. Assign the next smallest safe slice
3. Verify evidence of completion
4. Update status and unblock the next lane
5. Replan if code reality diverges from docs

Do not leave the team on a static plan after the first breakdown.

## CraftFlow Defaults

Use these defaults unless the current repo state contradicts them:

- Phase 1 means replacement parity with the legacy system.
- PDF export, design file handling, and customer detail or credit visibility are launch-critical blockers.
- Natural execution lanes are finance documents, production/files, customer/CRM, and settings/admin.
- Shared hotspots include `lib/types.ts`, `lib/database.types.ts`, `components/documents/DocumentLayout.tsx`, shared `actions/*.ts`, and reusable `components/ui/*`.
- If specs and code disagree, treat the code as current implementation and the docs as intended behavior. Flag the mismatch.

## Communication Rules

- State what is done, what is next, and what is blocked.
- Name owners only when known from context.
- Convert vague requests such as "finish billing" into concrete slices and unresolved decisions.
- Surface tradeoffs early, especially schedule versus completeness.
- Do not hide uncertainty. Call out assumptions, missing specs, and test gaps.
- When the user asks for a review, lead with findings and risks, not a roadmap.

## Deliverable Rules

- Prefer short, high-signal plans over long narratives.
- Include exact file paths when grounding a plan in code.
- Include verification steps whenever proposing implementation work.
- Separate confirmed status from recommended next actions.
- For parallel work, always show lane ownership, dependencies, and shared-surface controls.

## Software Warehouse Workflow

Use the warehouse model for structured development:

### Stages:
1. **PLANNING** → PM analyzes spec vs code, creates task breakdown
2. **CODING** → Agents implement assigned tasks (no bug fixing during coding)
3. **REVIEW** → Code review, findings logged to issue registry (don't fix, just log)
4. **TESTING** → Run TypeScript check, unit tests, E2E (log failures, don't fix)
5. **ANALYSIS** → PM analyzes all issues, assigns fixes
6. **BUG FIXING** → Agents fix assigned bugs only
7. **DEPLOY** → Merge when all tests pass

### Key Rules:
- **จดปัญหา ไม่แก้เอง** - All issues go to `.codex/issues/` for PM analysis
- **ทำทีละ task** - Complete one task before starting next
- **ป้องกัน terminal conflict** - One dev server, sequential test runs

Read [references/software-warehouse-workflow.md](references/software-warehouse-workflow.md) for full workflow details.

## Issue Registry

All issues are logged centrally for PM analysis:

```
.codex/issues/
├── typescript-errors.yaml    # TS compilation errors
├── unit-test-failures.yaml   # Unit test failures
├── e2e-failures.yaml         # E2E test failures
├── review-findings.yaml      # Code review findings
└── bugs.yaml                 # Runtime bugs
```

### Issue Handling Rules:
1. **Discover** → Log to appropriate file
2. **Don't Fix** → Leave for PM to analyze
3. **PM Analyzes** → Groups by root cause, assigns to agents
4. **Agent Fixes** → Only assigned issues
5. **Verify** → Re-run tests to confirm fix

## Terminal Conflict Prevention

When running parallel agents:

```yaml
terminal_ownership:
  dev_server: "windsurf only (port 3000)"
  npm_install: "windsurf only"
  type_check: "any agent (read-only)"
  unit_test: "one file at a time"
  e2e_test: "requires dev server, run sequentially"
```

Read [references/multi-ide-parallel-rules.md](references/multi-ide-parallel-rules.md) for multi-IDE coordination.

## References

- Read [references/context-sources.md](references/context-sources.md) when deciding which project files to inspect.
- Read [references/multi-agent-operating-model.md](references/multi-agent-operating-model.md) when coordinating multiple agents.
- Read [references/output-templates.md](references/output-templates.md) when you need a reusable PM artifact format.
- Read [references/software-warehouse-workflow.md](references/software-warehouse-workflow.md) for the warehouse development model.
- Read [references/multi-ide-parallel-rules.md](references/multi-ide-parallel-rules.md) for multi-IDE parallel execution.
- Read [references/status-tracking-system.md](references/status-tracking-system.md) for status and blocker tracking.
