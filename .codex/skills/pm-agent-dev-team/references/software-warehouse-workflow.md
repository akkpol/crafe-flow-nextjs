# Software Warehouse Workflow

## Overview

ระบบการทำงานแบบ "Software Warehouse" แบ่งงานเป็นขั้นตอนชัดเจน เหมือนคลังสินค้า:
- **รับงาน** → **ตรวจสอบ** → **ผลิต** → **QC** → **ส่งมอบ**

แต่ละขั้นตอนมี agent รับผิดชอบ และมีระบบ issue tracking รวมศูนย์

---

## 🏭 Workflow Stages

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SOFTWARE WAREHOUSE WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ PLANNING │ → │ CODING   │ → │ REVIEW   │ → │ TESTING  │ → │ DEPLOY ││
│  │          │    │          │    │          │    │          │    │        ││
│  │ PM Agent │    │ Dev      │    │ Review   │    │ QA Agent │    │ PM     ││
│  │          │    │ Agents   │    │ Agent    │    │          │    │ Agent  ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│
│       │               │               │               │              │     │
│       ▼               ▼               ▼               ▼              ▼     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ISSUE REGISTRY (Centralized)                      │   │
│  │  - Planning issues    - Code issues    - Review findings            │   │
│  │  - Unit test errors   - E2E errors     - Bug analysis               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Stage 1: PLANNING (วางแผน)

**Owner**: PM Agent (Windsurf)
**Input**: Spec document, current codebase
**Output**: Task breakdown, lane assignments

### Activities:
1. ตรวจสอบ spec vs current implementation
2. ระบุ gaps และ missing features
3. แบ่ง tasks ตาม lanes
4. กำหนด priority และ dependencies
5. Assign agents

### Deliverables:
- Updated `multi-agent-status.yaml`
- Task assignments per agent
- File ownership locks

### Quality Gate:
- [ ] All Phase 1 features identified
- [ ] No overlapping file assignments
- [ ] Dependencies mapped correctly
- [ ] ETA reasonable

---

## 💻 Stage 2: CODING (เขียนโค้ด)

**Owner**: Dev Agents (Frontend, Backend, Database, PDF)
**Input**: Task assignment, spec section
**Output**: Code changes (uncommitted)

### Rules:
1. **ทำทีละ task** - ไม่ข้าม ไม่ทำพร้อมกัน
2. **ไม่แก้ไขไฟล์นอก assignment** - ถ้าต้องแก้ ขอ lock ก่อน
3. **ไม่แก้ bug ที่เจอระหว่างทาง** - จดไว้ใน issue registry
4. **Commit เมื่อ task เสร็จ** - ไม่ commit ระหว่างทำ

### Terminal Conflict Prevention:
```yaml
terminal_rules:
  - rule: "One agent, one terminal"
    description: "แต่ละ agent ใช้ terminal ของตัวเอง"
    
  - rule: "No concurrent npm/pnpm"
    description: "ไม่รัน npm install พร้อมกัน"
    
  - rule: "Dev server ownership"
    description: "มีแค่ 1 dev server รันตลอด (port 3000)"
    owner: "windsurf"
    
  - rule: "Test isolation"
    description: "Unit test รันแยก file, ไม่รัน all พร้อมกัน"
```

### Deliverables:
- Code changes in branch
- Self-review checklist completed
- Ready for review flag

---

## 🔍 Stage 3: REVIEW (ตรวจสอบโค้ด)

**Owner**: Review Agent (หรือ PM Agent)
**Input**: Code changes from Stage 2
**Output**: Review findings → Issue Registry

### Review Checklist:
```markdown
## Code Review Checklist

### Structure
- [ ] Follows existing patterns
- [ ] No duplicate code
- [ ] Proper file organization

### TypeScript
- [ ] No `any` types
- [ ] Proper null handling
- [ ] Types match database schema

### Security
- [ ] No hardcoded secrets
- [ ] Proper auth checks
- [ ] Input validation

### Performance
- [ ] No N+1 queries
- [ ] Proper loading states
- [ ] Reasonable bundle size

### UX/UI
- [ ] Matches spec mockups
- [ ] Responsive design
- [ ] Thai language correct
- [ ] Error states handled
```

### Finding Types:
| Type | Action | Priority |
|------|--------|----------|
| **BLOCKER** | ต้องแก้ก่อน merge | P0 |
| **MAJOR** | ควรแก้ แต่ไม่ block | P1 |
| **MINOR** | Nice to have | P2 |
| **SUGGESTION** | Consider for future | P3 |

### Output:
- Findings logged to `.codex/issues/review-findings.yaml`
- **ไม่แก้เอง** - ส่งกลับให้ dev agent แก้

---

## 🧪 Stage 4: TESTING (ทดสอบ)

**Owner**: QA Agent
**Input**: Code after review pass
**Output**: Test results → Issue Registry

### Test Types:

#### 4.1 TypeScript Check
```bash
# Run by: Any agent before commit
npx tsc --noEmit
```
- Errors → Log to `issues/typescript-errors.yaml`
- **ไม่แก้เอง**

#### 4.2 Unit Tests
```bash
# Run by: QA Agent
npm run test -- --reporter=json > test-results.json
```
- Failures → Log to `issues/unit-test-failures.yaml`
- **ไม่แก้เอง**

#### 4.3 E2E Tests
```bash
# Run by: QA Agent (requires dev server)
npm run test:e2e -- --reporter=json
```
- Failures → Log to `issues/e2e-failures.yaml`
- **ไม่แก้เอง**

### Test Execution Rules:
```yaml
test_rules:
  - rule: "Sequential test runs"
    description: "ไม่รัน unit test และ E2E พร้อมกัน"
    
  - rule: "Clean state"
    description: "Reset test database ก่อนรัน E2E"
    
  - rule: "Isolated files"
    description: "รัน test ทีละ file ถ้า parallel"
    example: "npm run test -- actions/customers.test.ts"
```

---

## 🐛 Stage 5: BUG ANALYSIS (วิเคราะห์บั๊ก)

**Owner**: PM Agent
**Input**: All issues from Issue Registry
**Output**: Bug fix assignments

### Analysis Process:
1. รวบรวม issues ทั้งหมด
2. จัดกลุ่มตาม root cause
3. Prioritize ตาม impact
4. Assign ให้ agent ที่เหมาะสม
5. Update status board

### Bug Assignment Rules:
| Issue Type | Assigned To |
|------------|-------------|
| TypeScript type error | Integration Agent |
| UI rendering bug | Frontend Agent |
| API/Server error | Backend Agent |
| Database query issue | Database Agent |
| PDF generation bug | PDF Agent |
| Cross-cutting issue | PM decides |

---

## 📦 Stage 6: DEPLOY (ส่งมอบ)

**Owner**: PM Agent
**Input**: All tests pass, no blockers
**Output**: Merged to main, deployed

### Pre-Deploy Checklist:
- [ ] All TypeScript errors resolved
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No BLOCKER issues open
- [ ] Code review approved
- [ ] Branch rebased on main

---

## 📁 Issue Registry Structure

```
.codex/issues/
├── typescript-errors.yaml      # TS compilation errors
├── unit-test-failures.yaml     # Unit test failures
├── e2e-failures.yaml           # E2E test failures
├── review-findings.yaml        # Code review findings
├── bugs.yaml                   # Runtime bugs found
└── resolved/                   # Archived resolved issues
    └── 2025-03-09/
```

### Issue Format:
```yaml
# Example issue entry
- id: "ISS-001"
  type: "typescript_error"
  severity: "blocker"
  
  source:
    file: "actions/customers.ts"
    line: 96
    discovered_by: "tsc"
    discovered_at: "2025-03-09T11:00:00+07:00"
    
  description: |
    Property 'errors' does not exist on type 'ZodError'
    
  context: |
    const errors = result.error.errors;
    // Should be: result.error.issues
    
  assigned_to: null  # PM assigns later
  status: "open"     # open | assigned | in_progress | resolved | wontfix
  
  resolution:
    fixed_by: null
    fixed_at: null
    commit: null
    verified: false
```

---

## 🔄 Workflow Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                     DAILY WORKFLOW CYCLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Morning:                                                       │
│  ┌─────────┐                                                    │
│  │ PM      │ → Review overnight issues                          │
│  │ Agent   │ → Prioritize and assign                            │
│  │         │ → Update status board                              │
│  └─────────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  Development:                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                         │
│  │ Agent A │  │ Agent B │  │ Agent C │  (Parallel, own lanes)  │
│  │ Lane A  │  │ Lane B  │  │ Lane C  │                         │
│  └─────────┘  └─────────┘  └─────────┘                         │
│       │           │           │                                 │
│       └───────────┴───────────┘                                 │
│                   │                                             │
│                   ▼                                             │
│  Review:                                                        │
│  ┌─────────┐                                                    │
│  │ Review  │ → Check code quality                               │
│  │ Agent   │ → Log findings (don't fix)                         │
│  └─────────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  Testing:                                                       │
│  ┌─────────┐                                                    │
│  │ QA      │ → Run TypeScript check                             │
│  │ Agent   │ → Run unit tests                                   │
│  │         │ → Run E2E tests                                    │
│  │         │ → Log all failures (don't fix)                     │
│  └─────────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  Analysis:                                                      │
│  ┌─────────┐                                                    │
│  │ PM      │ → Collect all issues                               │
│  │ Agent   │ → Analyze root causes                              │
│  │         │ → Assign fixes to agents                           │
│  └─────────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  Bug Fixing:                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                         │
│  │ Agent A │  │ Agent B │  │ Agent C │  (Fix assigned bugs)    │
│  └─────────┘  └─────────┘  └─────────┘                         │
│       │                                                         │
│       ▼                                                         │
│  End of Day:                                                    │
│  ┌─────────┐                                                    │
│  │ PM      │ → Verify fixes                                     │
│  │ Agent   │ → Update status                                    │
│  │         │ → Plan next day                                    │
│  └─────────┘                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Terminal Conflict Prevention

### Port Allocation:
```yaml
ports:
  3000: "Dev server (Windsurf owns)"
  3001: "Storybook (if needed)"
  5432: "Database (shared, read-only for most)"
  
  # Test ports
  3100: "E2E test server"
```

### Command Ownership:
```yaml
commands:
  npm_install:
    owner: "windsurf"
    rule: "Only Windsurf runs npm install"
    reason: "Prevents package-lock conflicts"
    
  dev_server:
    owner: "windsurf"
    rule: "Only Windsurf starts/stops dev server"
    command: "npm run dev"
    
  type_check:
    owner: "any"
    rule: "Can run anytime, read-only"
    command: "npx tsc --noEmit"
    
  unit_test:
    owner: "qa_agent"
    rule: "Run one file at a time if parallel"
    command: "npm run test -- [file]"
    
  e2e_test:
    owner: "qa_agent"
    rule: "Requires dev server running"
    command: "npm run test:e2e"
    prerequisite: "dev_server running"
```

### Conflict Resolution:
```yaml
if_conflict:
  - scenario: "Two agents need same terminal"
    resolution: "Queue - first come first served"
    
  - scenario: "npm install needed"
    resolution: "Request from Windsurf, wait for completion"
    
  - scenario: "Dev server crashed"
    resolution: "Only Windsurf restarts"
    
  - scenario: "Port already in use"
    resolution: "Find owner, coordinate restart"
```

---

## 📊 Status Tracking

### Agent Status Template:
```markdown
## Agent Status: [Agent Name]

**Current Stage**: [CODING | REVIEW | TESTING | BUG_FIXING]
**Current Task**: [Task ID]
**Terminal**: [Idle | Running: command]

### Progress:
- [x] Step 1
- [ ] Step 2
- [ ] Step 3

### Issues Found (Don't Fix):
- ISS-XXX: [Description]

### Blockers:
- None / [Description]

### Next Action:
[What's next]
```

---

## 🎯 Key Principles

1. **แยกหน้าที่ชัดเจน** - ใครทำอะไร ไม่ก้าวก่าย
2. **จดปัญหา ไม่แก้เอง** - ทุก issue ต้องผ่าน PM วิเคราะห์
3. **ทำทีละขั้น** - ไม่ข้ามขั้นตอน
4. **ป้องกัน conflict** - Terminal, files, branches
5. **Verify ก่อน merge** - ทุก stage ต้องผ่าน quality gate
