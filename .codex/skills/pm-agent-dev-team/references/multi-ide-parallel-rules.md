# Multi-IDE Parallel Execution Rules

## Overview

เมื่อใช้หลาย IDE พร้อมกัน (Windsurf + Google Anthropic/Codex) ต้องมีกฎที่ชัดเจนเพื่อป้องกัน conflict

---

## IDE Assignment Model

### IDE 1: Windsurf (Primary)
**Role**: PM Agent + Integration Agent
**Responsibilities**:
- Lane coordination และ status tracking
- Shared file management (`lib/types.ts`, `lib/database.types.ts`)
- Conflict resolution
- Final merge และ verification

**Owned Lanes**:
- Integration Lane (shared contracts)
- Lane A: Finance Documents (PDF, billing, invoices)

### IDE 2: Google Anthropic/Codex (Secondary)
**Role**: Lane Agents
**Responsibilities**:
- Independent feature implementation
- Self-contained module work
- Report status back to PM

**Owned Lanes**:
- Lane B: Production & Files
- Lane C: Customer & CRM
- Lane D: Settings & Admin

---

## Non-Negotiable Rules

### 1. File Ownership (CRITICAL)

```yaml
windsurf_exclusive:
  - lib/types.ts
  - lib/database.types.ts
  - lib/schemas.ts
  - components/documents/DocumentLayout.tsx
  - .codex/**/*
  - package.json
  - tsconfig.json

anthropic_exclusive:
  - app/customers/**/*
  - app/jobs/**/*
  - app/kanban/**/*
  - app/files/**/*
  - actions/customers.ts
  - actions/orders.ts
  - actions/files.ts
  - actions/history.ts

shared_with_lock:
  - components/ui/**/*
  - lib/utils.ts
  - app/layout.tsx
```

### 2. Lock Protocol

Before editing a shared file:
1. Check `.codex/locks/active-locks.yaml`
2. Request lock from PM (Windsurf)
3. Wait for confirmation
4. Edit file
5. Release lock immediately after

### 3. Communication Protocol

**Anthropic IDE → Windsurf PM**:
```markdown
## Status Update from [Lane]

**Task**: [Task ID] - [Title]
**Status**: [in_progress/blocked/complete]
**Progress**: [0-100%]

**Files Modified**:
- `path/to/file.ts` - [description]

**Blockers**: [None / Description]
**Next Action**: [What's next]
```

**Windsurf PM → Anthropic IDE**:
```markdown
## Task Assignment

**Task ID**: [ID]
**Lane**: [Lane B/C/D]
**Title**: [Task name]
**Priority**: [P0/P1/P2]

**Files to Work On**:
- `path/to/file.ts`

**Constraints**:
- DO NOT modify: [list]
- Lock required for: [list]

**Acceptance Criteria**:
1. [Criterion 1]
2. [Criterion 2]

**ETA**: [Expected completion]
```

---

## Sync Points

### Every 30 Minutes
1. Both IDEs pause new file edits
2. Windsurf pulls latest changes
3. Anthropic pulls latest changes
4. Resolve any conflicts
5. Resume work

### Before Shared File Edit
1. Notify other IDE
2. Wait 2 minutes for acknowledgment
3. Proceed only after confirmation

### After Task Completion
1. Commit changes
2. Push to branch
3. Notify PM
4. Wait for verification before next task

---

## Branch Strategy

```
main
├── develop (integration branch)
│   ├── windsurf/lane-a-pdf-export
│   ├── windsurf/integration-types
│   ├── anthropic/lane-b-file-upload
│   ├── anthropic/lane-c-customer-detail
│   └── anthropic/lane-d-settings
```

### Rules:
- Each IDE works on its own branch
- Never push directly to `develop`
- Windsurf merges all branches to `develop`
- Only Windsurf resolves merge conflicts

---

## Conflict Prevention Matrix

| File Type | Windsurf | Anthropic | Resolution |
|-----------|----------|-----------|------------|
| Shared types | ✅ Edit | ❌ Read only | Windsurf updates, Anthropic pulls |
| UI components | ⚠️ Lock | ⚠️ Lock | First to lock wins |
| Actions | Lane A only | Lane B/C/D only | No overlap |
| App routes | Lane A routes | Lane B/C/D routes | No overlap |
| Tests | Own lane | Own lane | No overlap |

---

## Emergency Procedures

### Conflict Detected
1. **STOP** all edits immediately
2. Both IDEs commit current work
3. Windsurf takes control
4. Windsurf resolves conflict
5. Both IDEs pull resolved version
6. Resume work

### Communication Lost
1. Anthropic IDE: Stop after current task
2. Do NOT start new tasks
3. Wait for Windsurf confirmation
4. If > 15 min: Save work, stop

### Blocker Found
1. Document blocker in status update
2. Switch to non-blocked task if available
3. If no tasks: Wait for PM resolution
4. Do NOT attempt workarounds on shared files

---

## Task Queue Management

### Windsurf Manages:
```yaml
queue:
  lane_a:
    - task: "PDF Export Quotation"
      status: "in_progress"
      agent: "windsurf"
    - task: "PDF Export Invoice"
      status: "queued"
      agent: "windsurf"
      
  lane_b:
    - task: "Design File Upload"
      status: "ready"
      agent: "anthropic"
    - task: "Job Notes System"
      status: "queued"
      agent: "anthropic"
      
  lane_c:
    - task: "Customer Detail Page"
      status: "ready"
      agent: "anthropic"
    - task: "Outstanding Balance"
      status: "queued"
      agent: "anthropic"
```

### Assignment Rules:
1. Windsurf assigns tasks to Anthropic
2. Anthropic picks from assigned queue only
3. One task per lane at a time
4. Complete current before starting next

---

## Verification Checklist

### Before Starting Work
- [ ] Pulled latest from develop
- [ ] Checked active locks
- [ ] Confirmed task assignment
- [ ] Verified file ownership

### During Work
- [ ] Staying within assigned files
- [ ] Not modifying shared types
- [ ] Updating status every 30 min

### After Completing Task
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Committed to branch
- [ ] Status updated
- [ ] Locks released
- [ ] Ready for review

---

## Quick Reference

### Anthropic IDE Can:
✅ Edit Lane B/C/D files
✅ Add new components in own lanes
✅ Add new actions in own lanes
✅ Write tests for own code
✅ Read any file

### Anthropic IDE Cannot:
❌ Edit `lib/types.ts`
❌ Edit `lib/database.types.ts`
❌ Edit `components/documents/*`
❌ Edit `package.json`
❌ Merge to develop
❌ Start tasks without assignment

### Windsurf IDE Can:
✅ Edit any file (with coordination)
✅ Manage locks
✅ Assign tasks
✅ Merge branches
✅ Resolve conflicts

### Windsurf IDE Must:
⚠️ Notify before editing shared files
⚠️ Update status board
⚠️ Coordinate sync points
⚠️ Verify before merge

---

## Current Session Setup

เมื่อเริ่ม session ใหม่:

### Windsurf (This IDE):
1. อ่าน `.codex/status/multi-agent-status.yaml`
2. Review pending tasks
3. Assign tasks to Anthropic
4. Start own lane work

### Anthropic IDE:
1. รอ task assignment จาก Windsurf
2. Confirm understanding
3. Start assigned task
4. Report status every 30 min

---

## Status File Location

```
.codex/
├── status/
│   ├── multi-agent-status.yaml    # Overall status
│   ├── blockers.yaml              # Active blockers
│   └── session-log.md             # Session history
├── locks/
│   └── active-locks.yaml          # Current locks
└── skills/
    └── pm-agent-dev-team/         # This skill
```
