# Backend Agent - Server Actions

This directory is owned by **Backend Agent**.

## Patterns

### Server Action Template
```typescript
'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'ชื่อจำเป็นต้องกรอก'),
})

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  
  const result = schema.safeParse({...})
  
  if (!result.success) {
    // CORRECT: use .issues not .errors
    return { success: false, errors: result.error.issues }
  }
  
  const { data, error } = await supabase
    .from('Table')
    .insert(result.data)
    .select()
    .single()
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/path')
  return { success: true, data }
}
```

## Rules

- Always use Zod for validation
- Use `.issues` not `.errors` for ZodError
- Return structured response `{ success, data/error }`
- Call `revalidatePath` after mutations
- Thai error messages for user-facing errors
- Log issues to `.codex/issues/` if found in other files
