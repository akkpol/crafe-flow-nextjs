# Agent Selection & Routing System

## Decision Tree for Agent Selection

```
START: New Task or Request
│
├─ Is this a planning/coordination task?
│  └─ YES → PM Agent
│     - Define release goals
│     - Create lane assignments
│     - Resolve conflicts
│     - Track status
│
├─ Is this a multi-agent coordination need?
│  └─ YES → PM Agent
│     - Multiple features in parallel
│     - Shared surface changes
│     - Complex dependencies
│
├─ What type of implementation?
│  ├─ UI/Component work?
│  │  └─ Frontend Agent
│  │     - New pages
│  │     - Component updates
│  │     - Styling changes
│  │     - Responsive design
│  │
│  ├─ API/Server logic?
│  │  └─ Backend Agent
│  │     - API routes
│  │     - Server actions
│  │     - Business logic
│  │     - Authentication
│  │
│  ├─ Database schema/query?
│  │  └─ Database Agent
│  │     - Migrations
│  │     - Schema design
│  │     - Query optimization
│  │     - Type generation
│  │
│  ├─ PDF/Document generation?
│  │  └─ PDF/Document Agent
│  │     - PDF templates
│  │     - Document layouts
│  │     - Export functionality
│  │
│  ├─ Third-party integration?
│  │  └─ Integration Agent
│  │     - LINE OA
│  │     - Facebook
│  │     - Email services
│  │     - Payment APIs
│  │
│  └─ Shared surface change?
│     └─ Integration Agent (via PM)
│        - Types, schemas
│        - Shared components
│        - Interface contracts
```

---

## Quick Agent Selection Reference

### By File Extension/Type

| File Pattern | Primary Agent | Secondary |
|--------------|---------------|-----------|
| `*.tsx` in `app/**` | Frontend | Backend (if data) |
| `*.ts` in `actions/` | Backend | Database |
| `*.ts` in `lib/services/` | Backend | - |
| `*.ts` in `lib/pdf/` | PDF Agent | - |
| `*.ts` in `lib/integrations/` | Integration | Backend |
| `*.sql` migrations | Database | - |
| `*.css`, `*.scss` | Frontend | - |
| `*.json` configs | Context-dependent | - |

### By Feature Type

| Feature | Primary Agent | Lane |
|---------|---------------|------|
| New quotation UI | Frontend | Lane A |
| Quotation API | Backend | Lane A |
| Quotation PDF | PDF Agent | Lane A |
| Customer form | Frontend | Lane C |
| Customer API | Backend | Lane C |
| LINE webhook | Integration | Lane C |
| Job kanban UI | Frontend | Lane B |
| Job status API | Backend | Lane B |
| File upload | Backend | Lane B |
| Material settings | Frontend | Lane D |
| Material API | Backend | Lane D |
| Database migration | Database | Integration |

---

## Agent Routing Protocol

### Step 1: Request Analysis
PM Agent or system analyzes the request:

```typescript
interface TaskAnalysis {
  type: 'ui' | 'api' | 'database' | 'pdf' | 'integration' | 'planning';
  complexity: 'low' | 'medium' | 'high';
  affectedLanes: ('A' | 'B' | 'C' | 'D' | 'Integration')[];
  sharedSurfaces: string[];
  dependencies: string[];
  estimatedHours: number;
}
```

### Step 2: Agent Selection
Based on analysis, select primary agent:

```typescript
function selectAgent(analysis: TaskAnalysis): Agent {
  if (analysis.type === 'planning') return pmAgent;
  if (analysis.sharedSurfaces.length > 0) {
    return integrationAgent; // Via PM coordination
  }
  
  switch(analysis.type) {
    case 'ui': return frontendAgent;
    case 'api': return backendAgent;
    case 'database': return databaseAgent;
    case 'pdf': return pdfAgent;
    case 'integration': return integrationAgent;
    default: return pmAgent; // For decision
  }
}
```

### Step 3: Lane Assignment
Assign to appropriate lane:

```typescript
function assignLane(task: Task): Lane {
  if (task.includes('quotation') || task.includes('invoice') || task.includes('receipt')) {
    return 'Lane A: Finance';
  }
  if (task.includes('job') || task.includes('kanban') || task.includes('upload')) {
    return 'Lane B: Production';
  }
  if (task.includes('customer') || task.includes('line') || task.includes('facebook')) {
    return 'Lane C: Customer';
  }
  if (task.includes('material') || task.includes('setting') || task.includes('admin')) {
    return 'Lane D: Settings';
  }
  return 'Integration Lane';
}
```

### Step 4: Lock Check
Check for file conflicts:

```typescript
function checkLocks(files: string[]): LockStatus {
  const activeLocks = getActiveLocks();
  const conflicts = files.filter(file => 
    activeLocks.some(lock => fileMatches(file, lock.file))
  );
  
  if (conflicts.length > 0) {
    return {
      status: 'BLOCKED',
      conflicts,
      action: 'QUEUE_OR_REASSIGN'
    };
  }
  
  return { status: 'CLEAR', action: 'PROCEED' };
}
```

### Step 5: Task Assignment
Create task packet for agent:

```typescript
interface TaskPacket {
  taskId: string;
  title: string;
  description: string;
  assignedTo: Agent;
  lane: Lane;
  files: string[];
  dependencies: string[];
  acceptanceCriteria: string[];
  estimatedHours: number;
  priority: 'P0' | 'P1' | 'P2';
  locks: Lock[];
  context: {
    relatedFiles: string[];
    similarImplementations: string[];
    requirements: string;
  };
}
```

---

## Multi-Agent Scenario Routing

### Scenario 1: Full Feature (All Agents)
Example: "Add new receipt type with LINE notification"

```
Step 1: PM Agent
- Define scope: receipt PDF + LINE notification + database
- Identify lanes: Lane A (Finance) + Lane C (Integration)
- Create execution plan

Step 2: Database Agent (Integration Lane)
- Add receipt type to database
- Update types
- Release lock

Step 3: Parallel Execution
- Lane A: PDF Agent → Create receipt PDF template
- Lane A: Backend Agent → Create receipt API
- Lane C: Integration Agent → Set up LINE notification

Step 4: Frontend Agent (Lane A)
- Create receipt UI
- Add download button
- Integrate with APIs

Step 5: PM Agent
- Review integration
- Verify end-to-end
- Close lanes
```

### Scenario 2: Backend + Frontend
Example: "Add customer search by phone"

```
Step 1: PM Agent
- Assess: Simple feature, no shared surfaces
- Assign: Backend + Frontend

Step 2: Backend Agent (Lane C)
- Add search API
- Implement phone validation
- Test API

Step 3: Frontend Agent (Lane C)
- Add search input
- Connect to API
- Style results

Step 4: PM Agent
- Verify integration
- Mark complete
```

### Scenario 3: Complex Database Change
Example: "Add multi-currency support"

```
Step 1: PM Agent
- Identify: Shared surface change
- Plan: Integration-first approach

Step 2: Database Agent (Integration Lane)
- Design currency schema
- Write migration
- Update types
- Create interface contract
- Release lock

Step 3: Sequential Updates
- Backend Agent → Update all monetary calculations
- Frontend Agent → Update all price displays
- PDF Agent → Update document templates

Step 4: Integration Agent
- Verify all currency conversions
- Test edge cases
- Final integration
```

---

## Model Selection Guidelines

### By Task Complexity

**Simple Tasks** (Frontend tweaks, copy changes):
- Model: Claude 3.5 Sonnet
- Agent: Frontend Agent
- Parallel: Yes with other simple tasks

**Medium Tasks** (New components, API endpoints):
- Model: Claude 3.5 Sonnet / GPT-4
- Agent: Frontend/Backend Agent
- Parallel: Yes in different lanes

**Complex Tasks** (Architecture, database design):
- Model: GPT-4 / Claude 3.5 Sonnet
- Agent: Database/Backend Agent
- Parallel: No, requires focus

**Critical Tasks** (Production fixes, security):
- Model: GPT-4
- Agent: PM-coordinated team
- Parallel: Emergency protocol

### By Output Type

**Code Generation**:
- Primary: Claude 3.5 Sonnet (excellent at code)
- Fallback: GPT-4

**Architecture Decisions**:
- Primary: GPT-4 (strong reasoning)
- Fallback: Claude 3.5 Sonnet

**Documentation**:
- Primary: Claude 3.5 Sonnet
- Fallback: GPT-4

**Testing/QA**:
- Primary: Claude 3.5 Sonnet
- Fallback: GPT-4

---

## Routing Examples

### Example 1: "Fix quotation PDF logo not showing"

```
ANALYSIS:
- Type: PDF
- Lane: A (Finance)
- Complexity: Low
- Shared Surface: DocumentLayout.tsx

ROUTING:
→ PDF Agent
→ Check DocumentLayout.tsx lock
→ If locked: Queue or create integration task
→ If clear: Proceed with fix
```

### Example 2: "Add customer credit limit feature"

```
ANALYSIS:
- Type: Multi-component
- Lanes: A (Finance for invoices), C (Customer for profile)
- Complexity: High
- Shared Surfaces: types.ts, database

ROUTING:
→ PM Agent
→ Plan database schema change first
→ Coordinate Lane A + Lane C
→ Integration for shared types
→ Sequential: Database → Backend → Frontend
```

### Example 3: "Update color scheme company-wide"

```
ANALYSIS:
- Type: UI/UX
- Scope: All lanes
- Complexity: Medium
- Shared Surfaces: tailwind.config.ts, globals.css

ROUTING:
→ Frontend Agent (Integration Lane)
→ Modify shared styles
→ Update all components
→ Verify in all lanes
```

---

## Queue Management

### Priority Order
1. **P0 Blockers** - Production issues, critical bugs
2. **P0 Features** - Phase 1 parity requirements
3. **P1 Improvements** - Phase 2 enhancements
4. **P2 Nice-to-haves** - Future improvements

### Queue Status
```typescript
interface QueueStatus {
  active: Task[];
  queued: Task[];
  blocked: Task[];
  completed: Task[];
}
```

### Re-prioritization Rules
PM Agent can re-prioritize when:
- Blocker resolved
- New urgent task arrives
- Dependency changes
- User changes priority

---

## Agent Handoff Templates

### Handoff: Backend → Frontend
```
TASK COMPLETE: [Backend Agent]
OUTPUT: API endpoint ready
FILES: actions/customers.ts
INTERFACE:
  searchCustomers({ phone: string }): Promise<Customer[]>
EXAMPLE:
  const results = await searchCustomers({ phone: "0891234567" });
NOTES:
  - Phone must be 10 digits
  - Returns max 10 results
  - Sorted by relevance
READY_FOR: Frontend Agent
BLOCKS: None
```

### Handoff: Database → Backend
```
TASK COMPLETE: [Database Agent]
OUTPUT: Migration applied, types generated
FILES: 
  - supabase/migrations/20250309_add_credit_limit.sql
  - lib/database.types.ts (auto-generated)
SCHEMA:
  customers.credit_limit: number
  customers.current_balance: number
TYPES:
  interface Customer {
    credit_limit: number;
    current_balance: number;
  }
READY_FOR: Backend Agent
BLOCKS: None
```

### Handoff: Any → PM (Status)
```
STATUS UPDATE: [Agent Name]
LANE: [Lane]
PROGRESS: [X%]
COMPLETED: [What is done]
IN_PROGRESS: [Current work]
BLOCKED: [Yes/No - Reason]
NEXT: [What's next]
ETA: [Time estimate]
NEEDS_DECISION: [If any]
```
