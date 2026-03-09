# Shared Libraries

This directory contains shared utilities and types.

## File Ownership

| File | Owner |
|------|-------|
| `types.ts` | Integration Agent |
| `database.types.ts` | Database Agent |
| `schemas.ts` | Backend Agent |
| `pricing-engine.ts` | Backend Agent |
| `bahttext.ts` | Backend Agent / PDF Agent |
| `supabase*.ts` | Shared (request lock) |
| `auth.ts` | Shared (request lock) |
| `utils.ts` | Shared (request lock) |

## Common Patterns

### Type Imports
```typescript
import type { Order, Customer } from '@/lib/types'
import type { Database } from '@/lib/database.types'
```

### ZodError Access (IMPORTANT)
```typescript
// CORRECT
result.error.issues

// WRONG
result.error.errors
```

### Null Coalescing
```typescript
// CORRECT
const total = subtotal ?? 0
<Input value={field ?? ''} />
```

## Rules

- Request lock before editing shared files
- Coordinate type changes with Integration Agent
- Log issues to `.codex/issues/` if found
