# Code Ownership & Conflict Prevention Rules

## File Ownership Registry

### Frontend Agent Ownership
```
app/
├── (routes)/**/page.tsx          ✅ Frontend
├── (routes)/**/layout.tsx        ✅ Frontend
├── globals.css                     ✅ Frontend
tailwind.config.ts                  ✅ Frontend

components/
├── ui/*.tsx                        ✅ Frontend (shared)
├── documents/*.tsx                 ⚠️ Shared (Frontend + PDF)
├── kanban/*.tsx                    ✅ Frontend
├── customers/*.tsx                 ✅ Frontend
├── settings/*.tsx                ✅ Frontend
├── forms/*.tsx                     ✅ Frontend
└── layout/*.tsx                    ✅ Frontend

public/
├── images/**                       ✅ Frontend
├── fonts/**                        ✅ Frontend
└── templates/**                    ⚠️ Shared (Frontend + PDF)
```

### Backend Agent Ownership
```
app/api/**/route.ts                 ✅ Backend
actions/*.ts                        ⚠️ Shared (Backend + Database)
lib/
├── services/*.ts                   ✅ Backend
├── validations/*.ts                ✅ Backend
├── auth.ts                         ✅ Backend
├── utils.ts                        ⚠️ Shared
└── constants.ts                    ⚠️ Shared

middleware.ts                       ✅ Backend
```

### Database Agent Ownership
```
supabase/migrations/*.sql           ✅ Database
lib/
├── database.types.ts               ✅ Database (auto-generated)
└── types.ts                        ⚠️ Shared (Database + Backend)
```

### PDF/Document Agent Ownership
```
lib/pdf/*.ts                        ✅ PDF Agent
components/documents/               ⚠️ Shared (PDF + Frontend)
├── DocumentLayout.tsx              ⚠️ CRITICAL SHARED
├── DocumentHeader.tsx              ⚠️ Shared
├── DocumentFooter.tsx              ⚠️ Shared
└── *.tsx                           ⚠️ Shared

lib/pdf-utils.ts                    ✅ PDF Agent
```

### Integration Agent Ownership
```
lib/integrations/*.ts               ✅ Integration
app/api/webhooks/**                 ✅ Integration
lib/line.ts                         ✅ Integration
lib/facebook.ts                     ✅ Integration
lib/email.ts                        ✅ Integration
```

---

## Lock Management System

### Lock Types

1. **Exclusive Lock** - One agent has full control
   - Used for: Most files
   - Duration: Until PR merged
   - Overridable: No

2. **Shared Read Lock** - Multiple agents can read
   - Used for: Reference files, types
   - Duration: As needed
   - Overridable: N/A

3. **Integration Lock** - Controlled modification window
   - Used for: Shared surfaces
   - Duration: During contract change
   - Overridable: By PM Agent only

### Lock Request Protocol

```
1. Agent identifies file to modify
2. Check if file is in Ownership Registry
3. If owned by another agent → Request lock from PM
4. PM evaluates and grants/queues lock
5. Agent waits for lock notification
6. Agent works on file
7. Agent releases lock on completion
```

### Lock Manifest Format

```yaml
# .codex/locks/active-locks.yaml
locks:
  - id: "lock-001"
    file: "lib/types.ts"
    type: "integration"
    owner: "Database Agent"
    since: "2025-03-09T10:00:00Z"
    expected_release: "2025-03-09T12:00:00Z"
    reason: "Add PaymentStatus enum"
    blocking:
      - agent: "Backend Agent"
        task: "Invoice status update"
      - agent: "Frontend Agent"
        task: "Payment status display"
    
  - id: "lock-002"
    file: "components/documents/DocumentLayout.tsx"
    type: "exclusive"
    owner: "PDF Agent"
    since: "2025-03-09T11:00:00Z"
    expected_release: "2025-03-09T14:00:00Z"
    reason: "Update logo positioning for all PDFs"
    blocking: []
```

---

## Conflict Prevention Rules

### Rule 1: No Concurrent File Edits
- **Enforcement**: PM Agent tracks all active locks
- **Violation**: Automatic escalation to PM
- **Resolution**: Queue or reassign

### Rule 2: Shared Surface Contract
Before modifying shared files:
- Must have written contract
- Must define backward compatibility
- Must specify dependent lanes
- Must have integration test plan

### Rule 3: Type Safety First
- All changes must maintain TypeScript strict mode
- Database types drive all other type changes
- Shared types changes = integration task

### Rule 4: Test Before Merge
- Unit tests for isolated changes
- Integration tests for shared changes
- Manual verification for UI changes
- PDF render tests for document changes

### Rule 5: Dependency Ordering
```
Database Migration
    ↓ (blocks)
Type Generation
    ↓ (blocks)
Backend API
    ↓ (blocks)
Frontend UI
```

No agent may start work blocked by upstream dependency.

---

## Merge Conflict Prevention

### Branch Strategy
```
main (protected)
├── integration/*     ← Integration lane branches
├── lane-a/*          ← Finance documents
├── lane-b/*          ← Production/files
├── lane-c/*          ← Customer/CRM
├── lane-d/*          ← Settings/admin
└── hotfix/*          ← Emergency fixes
```

### Merge Sequence
1. Integration branches merge first
2. Database migrations merge second
3. Backend APIs merge third
4. Frontend components merge fourth
5. Cross-cutting features merge last

### Rebase Rules
- Rebase from `main` before creating PR
- Rebase again if `main` changes during work
- No force pushes to shared branches

---

## Code Review Rules

### Self-Review Checklist
Before requesting review:

**Frontend Agent**:
- [ ] Component renders without console errors
- [ ] Responsive design works on mobile/desktop
- [ ] TypeScript compiles without errors
- [ ] No unused imports or variables
- [ ] Accessibility (a11y) considered

**Backend Agent**:
- [ ] API endpoints respond correctly
- [ ] Error handling covers edge cases
- [ ] Validation rules are comprehensive
- [ ] Security checks implemented
- [ ] No SQL injection risks

**Database Agent**:
- [ ] Migration runs successfully
- [ ] Types generated correctly
- [ ] Indexes added for performance
- [ ] No data loss in migrations
- [ ] Rollback plan documented

**PDF Agent**:
- [ ] PDF generates without errors
- [ ] Thai fonts display correctly
- [ ] Layout matches design specs
- [ ] File size is reasonable (< 5MB)
- [ ] Prints correctly

**Integration Agent**:
- [ ] Webhooks handle edge cases
- [ ] API rate limits respected
- [ ] Error responses are graceful
- [ ] Timeouts configured
- [ ] Retry logic implemented

---

## Emergency Override Rules

### When PM Agent Can Override Locks

1. **Production Critical Bug**
   - Override: Any lock
   - Reason: Business impact
   - Process: Emergency patch lane

2. **Security Vulnerability**
   - Override: Any lock
   - Reason: Security risk
   - Process: Hotfix lane

3. **Dependency Deadlock**
   - Override: Both locks
   - Reason: Progress blocked
   - Process: Split tasks differently

### Emergency Lane
```
hotfix/* branches
├── Can modify any file with PM approval
├── Skips normal queue
├── Requires immediate review
└── Merges to main ASAP
```

---

## Agent Communication Protocol

### Status Reporting Format
```
AGENT: [Name]
LANE: [A/B/C/D/Integration]
TASK: [Brief description]
FILES: [List of files modified]
LOCKS_HELD: [List of lock IDs]
BLOCKED_BY: [None | Agent X - Reason]
BLOCKING: [List of agents waiting]
PROGRESS: [0-100%]
ETA: [Time estimate]
VERIFICATION: [Tests/manual check status]
```

### Blocker Escalation Format
```
ESCALATION: Blocker Report
FROM: [Agent Name]
SEVERITY: [High/Medium/Low]
BLOCKER: [Description]
IMPACT: [What is blocked]
ATTEMPTS: [What was tried]
NEED_FROM_PM: [Specific decision/help]
SUGGESTED_RESOLUTION: [Agent's recommendation]
```

---

## Success Metrics

Track these weekly:

1. **Merge Conflicts**: Target < 2 per week
2. **Lock Wait Time**: Target < 30 minutes average
3. **Emergency Overrides**: Target < 1 per month
4. **Code Review Rounds**: Target < 2 per PR
5. **Blocked Hours**: Target < 5% of dev time

---

## Violation Consequences

### Minor Violations (Warning)
- Not updating status
- Missing verification steps
- Late lock release

### Major Violations (Process Change Required)
- Concurrent file edits
- Bypassing lock system
- Merging without tests
- Breaking shared contracts

### Critical Violations (Agent Retraining)
- Repeated conflicts
- Production incidents
- Data loss in migrations
- Security vulnerabilities
