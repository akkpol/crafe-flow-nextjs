import { describe, it, expect, vi } from 'vitest'
import { updateOrderProgress } from '../../actions/orders'
import { createClient } from '../../lib/supabase-server'

// Mock Supabase Client
vi.mock('../../lib/supabase-server', () => ({
    createClient: vi.fn()
}))

// Mock Next.js Cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

// Mock Auth
vi.mock('../../lib/auth', () => ({
    requirePermission: vi.fn().mockResolvedValue(true)
}))

describe('Order Server Actions - Progress Tracking', () => {
    it('should update progress percent successfully', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null })
        }
        
        ;(createClient as any).mockResolvedValue(mockSupabase)
        
        const result = await updateOrderProgress('test-job-id', 85)
        
        expect(result.success).toBe(true)
        expect(mockSupabase.from).toHaveBeenCalledWith('Order')
        expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
            progresspercent: 85
        }))
        expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-job-id')
    })
    
    it('should return failure message when database error occurs', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: { message: 'Database Connection Failed' } })
        }
        
        ;(createClient as any).mockResolvedValue(mockSupabase)
        
        const result = await updateOrderProgress('test-job-id', 75)
        
        expect(result.success).toBe(false)
        expect(result.error).toBe('Database Connection Failed')
    })

    it('should validate progress percent range (0-100)', async () => {
        // Zod should throw error before database call
        // 105 is invalid
        await expect(updateOrderProgress('test-job-id', 105)).rejects.toThrow()
    })
})
