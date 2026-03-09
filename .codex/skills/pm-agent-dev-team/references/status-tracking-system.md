# Status Tracking & Blocker Escalation System

## Status Dashboard Format

### Multi-Agent Status Board

```yaml
# .codex/status/multi-agent-status.yaml
updated_at: "2025-03-09T10:00:00Z"
sprint: "Phase 1 - Week 1"
goal: "Complete 3 critical blockers for deployment"

lanes:
  lane_a_finance:
    name: "Lane A: Finance Documents"
    owner: "PDF Agent / Backend Agent"
    status: "in_progress"
    tasks:
      - id: "T-001"
        title: "PDF Export for Quotations"
        agent: "PDF Agent"
        status: "in_progress"
        progress: 65
        files:
          - "lib/pdf/quotation.ts"
          - "components/documents/QuotationTemplate.tsx"
        locks:
          - "lock-pdf-001"
        blockers: []
        eta: "2025-03-09T16:00:00Z"
        
      - id: "T-002"
        title: "PDF Export for Invoices"
        agent: "PDF Agent"
        status: "queued"
        progress: 0
        files:
          - "lib/pdf/invoice.ts"
        locks: []
        blockers:
          - "Waiting for T-001 completion"
        eta: "2025-03-10T12:00:00Z"

  lane_b_production:
    name: "Lane B: Production & Files"
    owner: "Backend Agent"
    status: "blocked"
    tasks:
      - id: "T-003"
        title: "Design File Upload System"
        agent: "Backend Agent"
        status: "blocked"
        progress: 30
        files:
          - "lib/file-upload.ts"
          - "actions/files.ts"
        locks: []
        blockers:
          - type: "dependency"
            description: "Waiting for database schema change"
            blocking_agent: "Database Agent"
            task: "T-005"
        eta: "Unknown - blocked"

  lane_c_customer:
    name: "Lane C: Customer & CRM"
    owner: "Integration Agent"
    status: "ready"
    tasks:
      - id: "T-004"
        title: "Customer Detail Page"
        agent: "Frontend Agent"
        status: "ready"
        progress: 0
        files:
          - "app/customers/[id]/page.tsx"
          - "actions/customers.ts"
        locks: []
        blockers: []
        eta: "2025-03-09T18:00:00Z"

  lane_d_settings:
    name: "Lane D: Settings & Admin"
    owner: "Backend Agent / Frontend Agent"
    status: "not_started"
    tasks: []

  integration:
    name: "Integration Lane"
    owner: "Database Agent"
    status: "in_progress"
    tasks:
      - id: "T-005"
        title: "File Metadata Schema"
        agent: "Database Agent"
        status: "in_progress"
        progress: 80
        files:
          - "lib/types.ts"
          - "supabase/migrations/20250309_add_file_metadata.sql"
        locks:
          - "lock-db-001"
        blockers: []
        eta: "2025-03-09T14:00:00Z"

summary:
  total_tasks: 5
  completed: 0
  in_progress: 3
  blocked: 1
  queued: 1
  not_started: 0
  
  blockers_summary:
    critical: 0
    high: 1
    medium: 0
    low: 0
    
  next_milestones:
    - time: "2025-03-09T14:00:00Z"
      event: "Database schema complete - unblocks Lane B"
    - time: "2025-03-09T16:00:00Z"
      event: "Quotation PDF complete - can start Invoice PDF"
```

---

## Agent Status Update Template

### Individual Agent Status

```markdown
## Agent Status Update

**Agent**: [Frontend Agent / Backend Agent / Database Agent / PDF Agent / Integration Agent]
**Lane**: [Lane A/B/C/D/Integration]
**Timestamp**: [ISO 8601]

### Current Task
**Task ID**: [ID]
**Title**: [Task name]
**Status**: [in_progress / blocked / complete / queued]
**Progress**: [0-100%]
**Started**: [Timestamp]
**ETA**: [Timestamp]

### Files Working On
- `[file path]` - [brief description of change]
- `[file path]` - [brief description of change]

### Locks Held
- `lock-xxx` on `[file]` - Since `[time]`

### Blockers
**Status**: [None / Waiting for X / Technical issue / Needs decision]

If blocked:
- **Type**: [dependency / technical / decision / resource]
- **Description**: [What's blocking]
- **Since**: [When blocked started]
- **Blocking**: [What is blocked]
- **Attempted Resolutions**: [What was tried]
- **Need from PM**: [Specific help needed]

### Verification Status
- [ ] Code complete
- [ ] Self-review passed
- [ ] Tests written
- [ ] Manual testing done
- [ ] Ready for review

### Next Actions
1. [Next immediate action]
2. [Following action]
3. [Future action]

### Notes
[Any additional context, risks, or observations]
```

---

## Blocker Escalation Protocol

### Blocker Severity Levels

#### 🔴 CRITICAL (Immediate PM attention)
**Criteria**:
- Blocks multiple lanes
- Production/deployment at risk
- No workaround available
- Deadline < 24 hours

**Response Time**: < 15 minutes
**Escalation Path**: Agent → PM → User (if needed)

**Template**:
```markdown
🚨 CRITICAL BLOCKER

**Time**: [Timestamp]
**Agent**: [Name]
**Lane**: [Lane]

**Blocker**: [One-line description]
**Impact**: [What's blocked - be specific]
**Root Cause**: [Why it's blocked]
**Urgency**: [Why it's critical]

**Options Considered**:
1. [Option A] - [Pros/Cons]
2. [Option B] - [Pros/Cons]

**Recommendation**: [Agent's suggested path]
**Need from PM**: [Specific action/decision]
```

#### 🟠 HIGH (PM attention within 1 hour)
**Criteria**:
- Blocks one lane
- Affects milestone timeline
- Requires PM decision
- Has partial workaround

**Response Time**: < 1 hour
**Escalation Path**: Agent → PM

**Template**:
```markdown
⚠️ HIGH BLOCKER

**Time**: [Timestamp]
**Agent**: [Name]
**Lane**: [Lane]

**Blocker**: [Description]
**Impact**: [What's affected]
**Attempted**: [What was tried]
**Need from PM**: [Help needed]
**Suggested Resolution**: [Agent's idea]
```

#### 🟡 MEDIUM (PM attention within 4 hours)
**Criteria**:
- Localized to task
- Has clear workaround
- Not on critical path
- Can proceed with reduced scope

**Response Time**: < 4 hours
**Escalation Path**: Agent → PM

#### 🟢 LOW (Status update only)
**Criteria**:
- Minor inconvenience
- Easy workaround
- Not blocking progress
- Can be deferred

**Response Time**: Next sync
**Escalation Path**: Agent status update only

---

## Blocker Tracking Board

```yaml
# .codex/status/blockers.yaml
blockers:
  critical: []
  
  high:
    - id: "B-001"
      severity: "high"
      type: "dependency"
      reported_at: "2025-03-09T10:30:00Z"
      reported_by: "Backend Agent"
      lane: "Lane B"
      task: "T-003"
      
      description: "Design file upload blocked waiting for database schema"
      impact: "Lane B completely blocked, affects production milestone"
      root_cause: "Database Agent T-005 not yet complete"
      
      assigned_to: "PM Agent"
      status: "investigating"
      
      attempts:
        - time: "2025-03-09T10:30:00Z"
          action: "Escalated to PM"
          result: "PM reviewing ETA"
      
      resolution_plan: "Wait for T-005 complete (ETA 14:00)"
      eta_resolved: "2025-03-09T14:00:00Z"
      
  medium: []
  low: []
  resolved:
    - id: "B-000"
      severity: "medium"
      resolved_at: "2025-03-09T09:00:00Z"
      resolution: "Database schema updated"
      resolved_by: "PM Agent"
```

---

## PM Agent Control Loop

### Daily Sync Routine

```
Every 4 hours OR when blocker reported:

1. COLLECT STATUS
   - Poll all active agents for status
   - Update status dashboard
   - Identify new blockers

2. ANALYZE BLOCKERS
   - Categorize by severity
   - Assess impact
   - Determine if escalation needed

3. RESOLVE BLOCKERS
   - Critical: Immediate action
   - High: Plan resolution within 1 hour
   - Medium: Queue for next cycle
   - Low: Note for awareness

4. ADJUST LANES
   - Reassign if agent overloaded
   - Merge lanes if dependencies align
   - Split lanes if conflicts emerge

5. UPDATE STAKEHOLDERS
   - User status update (if milestones at risk)
   - Agent queue updates
   - Priority adjustments

6. PLAN NEXT CYCLE
   - Assign next tasks
   - Grant locks
   - Set expectations
```

### Status Update to User

```markdown
## Multi-Agent Team Status Update

**Period**: [Start] - [End]
**Sprint Goal**: [Current goal]

### ✅ Completed
- [Task] - [Agent] - [Time]

### 🔄 In Progress
- [Task] - [Agent] - [Progress%] - ETA [Time]

### ⏸️ Blocked
- [Task] - [Agent] - Blocked by [Reason] - Resolution [Plan]

### 📋 Queue
- [Task] - Assigned to [Agent] - Start [When]

### 🚨 Issues
- [Issue] - [Severity] - [Status]

### 📊 Metrics
- Tasks completed: X
- Tasks in progress: Y
- Blockers resolved: Z
- Avg completion time: T

### 🎯 Next 24 Hours
1. [Expected completion]
2. [Expected completion]
3. [Expected start]

### ⚠️ Risks
- [Risk] - [Mitigation]

### 💬 Decisions Needed
- [Question] - [Context]
```

---

## Escalation Decision Tree

```
AGENT encounters issue
│
├─ Can resolve independently?
│  └─ YES → Resolve and continue
│  └─ NO → Continue
│
├─ Is it blocking progress?
│  └─ NO → Note in status, continue other work
│  └─ YES → Continue
│
├─ Assess severity
│  ├─ Multiple lanes blocked? → CRITICAL
│  ├─ Milestone at risk? → HIGH
│  ├─ Task blocked but workaround exists? → MEDIUM
│  └─ Minor inconvenience? → LOW
│
├─ Report to PM Agent
│  └─ Include:
│     - Severity
│     - Description
│     - Impact
│     - Attempted solutions
│     - Suggested resolution
│
PM Agent receives report
│
├─ CRITICAL?
│  └─ YES →
│     - Immediate attention (< 15 min)
│     - Assess if user escalation needed
│     - Make decision/assign resources
│     - Communicate resolution plan
│
├─ HIGH?
│  └─ YES →
│     - Plan resolution (< 1 hour)
│     - Coordinate with blocking agent
│     - Adjust timelines if needed
│     - Update all affected agents
│
├─ MEDIUM?
│  └─ YES →
│     - Queue for resolution
│     - Check for workarounds
│     - Reprioritize if needed
│
└─ LOW?
   └─ Note in status
   └─ Address at next sync
```

---

## Communication Channels

### Agent → PM Agent
- Blocker reports
- Status updates (every 30 min during parallel work)
- Lock requests/releases
- Task completion notifications

### PM Agent → Agent
- Task assignments
- Lock grants
- Priority changes
- Blocker resolutions

### PM Agent → User
- Milestone updates (daily)
- Escalation requests (as needed)
- Scope change requests (when necessary)
- Risk alerts (when milestones threatened)

### Agent → Agent (via PM)
- Handoff notifications
- Dependency updates
- Interface contracts

---

## Automation Rules

### Auto-Escalate When:
1. Blocker > 1 hour unresolved
2. Multiple agents report same issue
3. ETA slips > 4 hours
4. Lock held > 4 hours without activity

### Auto-Notify When:
1. Task completed (next agent)
2. Blocker resolved (blocked agent)
3. Lock released (waiting agents)
4. Milestone at risk (PM + User)

### Auto-Adjust When:
1. Agent completes task → Assign next from queue
2. Blocker resolved → Unblock dependent tasks
3. Lock released → Notify waiting agents
4. New P0 arrives → Re-prioritize queue

---

## Success Metrics

Track weekly:

### Efficiency Metrics
- **Tasks Completed / Week**: Target 15-20
- **Avg Task Duration**: Target < 4 hours
- **Parallel Task Ratio**: Target 60%+
- **Lane Utilization**: Target 80%+

### Quality Metrics
- **Merge Conflicts / Week**: Target < 2
- **Code Review Rounds**: Target < 2
- **Bugs Found Post-Merge**: Target < 5%
- **Rollback Events**: Target 0

### Coordination Metrics
- **Blocker Resolution Time**: Target < 30 min (avg)
- **Lock Wait Time**: Target < 15 min (avg)
- **Status Update Compliance**: Target 100%
- **Handoff Success Rate**: Target > 95%

### Satisfaction Metrics
- **Milestones Met**: Target > 90%
- **Scope Creep Events**: Target < 10%
- **Emergency Overrides**: Target < 2/month
- **User Interruptions**: Target < 5/week
