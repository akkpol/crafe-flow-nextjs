# PM Output Templates

Use these templates when the user asks for structured PM deliverables or when a plain answer would be too loose.

## Execution Brief

```md
# Execution Brief: <initiative>

## Objective
<business outcome and why it matters now>

## Scope
- In: <items>
- Out: <items>

## Current State
- Confirmed: <facts from docs/code>
- Missing: <gaps>
- Risks: <delivery risks>

## Delivery Slices
1. <slice name> - <goal, files/areas, verification>
2. <slice name> - <goal, files/areas, verification>
3. <slice name> - <goal, files/areas, verification>

## Acceptance Criteria
- <observable outcome>
- <observable outcome>

## Immediate Next Step
<smallest next action>
```

## Backlog Slice

```md
## <slice title>

- Outcome: <user-visible result>
- Why now: <priority rationale>
- Depends on: <none or list>
- Code areas: <paths or modules>
- Done when:
  - <criterion>
  - <criterion>
- Verify with:
  - <test or manual check>
```

## Lane Plan

```md
# Lane Plan: <milestone>

## Goal
<what this wave ships>

## Lanes
- Lane A / Owner: <scope, paths, depends on>
- Lane B / Owner: <scope, paths, depends on>
- Lane C / Owner: <scope, paths, depends on>
- Integration / Owner: <shared surfaces and sequence>

## Shared-Surface Controls
- Locked files: <paths and owner>
- Contracts required: <list>

## Merge Order
1. <integration or shared change>
2. <lane merge>
3. <lane merge>
4. <qa or release check>
```

## Lock Manifest

```md
# Active Locks

| Owner | Lane | Paths | Purpose | Started | Release |
|------|------|-------|---------|---------|---------|
| <agent> | <lane> | `<glob or path>` | <reason> | <time> | <time> |
```

## Interface Contract

```md
# Contract: <name>

- Change: <what changes>
- Owned by: <integration owner>
- Consumers: <lanes or modules>
- Compatibility: <backward compatible or breaking>
- Proof: <tests or manual checks>
- Must merge before: <dependent work>
```

## Status Update

```md
## Status

- Done: <completed and verified>
- Next: <next planned item>
- Blocked: <blocker and impact>
- Risk: <emerging concern>
- Ask: <decision or input needed>
```

## Handoff Note

```md
## Handoff

- Completed: <what is actually finished>
- Still locked: <paths, if any>
- Follow-up owner: <next lane or agent>
- Risks to next step: <known issues>
- Verification evidence: <tests, screenshots, manual steps>
```

## Blocker Report

```md
# Blocker: <name>

## Impact
<what cannot ship or proceed>

## Evidence
- Doc source: <file and section>
- Code source: <file or missing path>

## Unblock Options
1. <option> - <tradeoff>
2. <option> - <tradeoff>

## Recommendation
<best path and why>
```
