# Frontend Agent - Components

This directory is owned by **Frontend Agent**.

## Patterns

### Component Template
```typescript
'use client'

import { cn } from '@/lib/utils'

interface Props {
  // props
}

export function ComponentName({ ...props }: Props) {
  return (
    <div className={cn(
      "rounded-2xl bg-card/40 backdrop-blur-xl",
      "border border-white/5"
    )}>
      {/* content */}
    </div>
  )
}
```

### Null Handling
```typescript
// Always coalesce null for inputs
<Input value={field ?? ''} />
```

### Thai Language
- Labels: "บันทึก", "ยกเลิก", "ค้นหา"
- Technical terms: "Dashboard", "Kanban"

## Subdirectory Ownership

| Directory | Owner |
|-----------|-------|
| `components/documents/*` | PDF Agent |
| `components/ui/*` | Shared (request lock) |
| Everything else | Frontend Agent |

## Rules

- Use Tailwind CSS for styling
- Use shadcn/ui components
- Responsive design (mobile-first)
- Handle loading and error states
- Log issues to `.codex/issues/` if found in other files
