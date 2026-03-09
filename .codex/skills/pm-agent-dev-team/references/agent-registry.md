# Multi-Agent AI Team - Agent Registry

## Agent Roles & Responsibilities

### 1. PM Agent (Project Manager) 🎯
**Model**: Claude 3.5 Sonnet / GPT-4
**Responsibilities**:
- Plan and coordinate all agent work
- Define release goals and phase boundaries
- Partition work into non-overlapping lanes
- Assign file/module ownership
- Manage shared surfaces with lock rules
- Sequence merges to prevent conflicts
- Track status, blockers, and escalations
- Select appropriate agents for tasks

**When to Invoke**: For any multi-agent coordination, planning, or conflict resolution

---

### 2. Frontend Agent 🎨
**Model**: Claude 3.5 Sonnet
**Specialization**: UI/UX, React Components, Styling
**Responsibilities**:
- Build React components
- Implement UI/UX designs
- Handle responsive layouts
- Manage component states
- Create form interfaces
- Style with Tailwind CSS

**Ownership**:
- `app/**/page.tsx`
- `app/**/layout.tsx`
- `components/ui/*.tsx`
- `components/**/page-specific components`
- `app/globals.css`
- `tailwind.config.ts`

**Prohibited**:
- Database schema changes
- API route modifications
- Business logic in server actions

---

### 3. Backend Agent ⚙️
**Model**: Claude 3.5 Sonnet
**Specialization**: API Routes, Server Actions, Business Logic
**Responsibilities**:
- Build API endpoints
- Implement server actions
- Handle business logic
- Manage data validation
- Create service layers
- Handle authentication flows

**Ownership**:
- `actions/*.ts`
- `app/api/**/route.ts`
- `lib/services/*.ts`
- `lib/validations/*.ts`
- `middleware.ts`

**Prohibited**:
- Direct component rendering
- Client-side state management
- UI styling decisions

---

### 4. Database Agent 🗄️
**Model**: Claude 3.5 Sonnet
**Specialization**: Schema Design, Migrations, Queries
**Responsibilities**:
- Design database schemas
- Create migrations
- Write efficient queries
- Optimize indexes
- Handle data relationships
- Type generation

**Ownership**:
- Database migrations
- `lib/database.types.ts`
- `lib/types.ts` (shared types)
- Supabase schema changes
- SQL queries

**Prohibited**:
- API route implementation
- UI component changes
- Business logic in components

---

### 5. PDF/Document Agent 📄
**Model**: GPT-4 / Claude 3.5 Sonnet
**Specialization**: PDF Generation, Document Layouts
**Responsibilities**:
- Generate PDFs (quotations, invoices, receipts)
- Design document templates
- Handle PDF styling
- Manage document layouts
- Export functionality

**Ownership**:
- `lib/pdf/*.ts`
- `components/documents/*.tsx`
- Document templates
- PDF generation logic

---

### 6. Integration Agent 🔗
**Model**: Claude 3.5 Sonnet
**Specialization**: Third-party APIs, Webhooks
**Responsibilities**:
- LINE OA integration
- Facebook API
- Email services
- Payment gateways
- External API integrations

**Ownership**:
- `lib/integrations/*.ts`
- Webhook handlers
- API clients
- External service configurations

---

## Agent Selection Matrix

| Task Type | Primary Agent | Secondary Support |
|-----------|---------------|-------------------|
| New UI Page | Frontend | PM for layout approval |
| API Endpoint | Backend | Database for schema |
| Database Change | Database | PM for impact analysis |
| PDF Feature | PDF/Document | Frontend for preview |
| LINE Integration | Integration | Backend for webhooks |
| Full Feature | PM coordinates | All relevant agents |
| Bug Fix | Context-dependent | Same agent type |
| Refactor | PM coordinates | Multiple agents |

---

## Conflict Prevention Rules

### 1. File Ownership Lock
- Each file has ONE owner agent at a time
- Lock manifest maintained by PM Agent
- No concurrent edits to same file
- Locks released after merge/PR

### 2. Shared Surface Protocol
- Shared files (types, database.types) require PM approval
- Interface contracts required for shared type changes
- Precursor integration task for shared surface changes
- Integration agent handles shared surface modifications

### 3. Merge Sequencing
1. Database migrations FIRST
2. Shared types/interfaces SECOND
3. Backend APIs THIRD
4. Frontend components LAST
5. Integration features ANYTIME after dependencies

### 4. Communication Protocol
- Status updates every 30 min during parallel work
- Blockers escalated to PM immediately
- File conflicts resolved by PM assignment
- Shared surface changes require team sync

---

## Model Selection Guidelines

### High-Complexity Tasks
- Architecture decisions → PM Agent
- Database schema design → Database Agent
- Complex business logic → Backend Agent

### Medium-Complexity Tasks
- Component development → Frontend Agent
- API implementation → Backend Agent
- Document templates → PDF Agent

### Low-Complexity Tasks
- Simple UI tweaks → Frontend Agent
- Quick fixes → Any agent with context
- Copy changes → Frontend Agent

---

## Quality Gates

Each agent must verify before completing:

**Frontend Agent**:
- [ ] Component renders without errors
- [ ] Responsive on mobile/desktop
- [ ] TypeScript types correct
- [ ] No console errors

**Backend Agent**:
- [ ] API responds correctly
- [ ] Error handling implemented
- [ ] Validation rules working
- [ ] Security checks pass

**Database Agent**:
- [ ] Migration runs successfully
- [ ] Types generated correctly
- [ ] Queries are optimized
- [ ] No breaking changes

**PDF Agent**:
- [ ] PDF generates correctly
- [ ] Layout matches design
- [ ] Thai text displays properly
- [ ] File size reasonable

---

## Escalation Rules

**PM Agent escalates to User when**:
- Dependencies cannot be resolved
- Scope conflicts between features
- Technical tradeoffs need decision
- Timeline impacts exceed buffer

**Agents escalate to PM when**:
- Blocked by another agent's work
- Shared surface needs modification
- Unexpected complexity discovered
- Timeline risk identified
