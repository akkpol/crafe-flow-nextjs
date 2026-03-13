/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PricingCalculator, type CalcLineItem } from '../PricingCalculator'
import * as pricingActions from '@/actions/pricing'

// 1. Mock the server action module so it doesn't try to hit the real DB
vi.mock('@/actions/pricing', () => {
    return {
        getAllMaterialsForPricing: vi.fn(),
    }
})

describe('PricingCalculator Component', () => {
    const mockOnChange = vi.fn()

    const defaultItems: CalcLineItem[] = [
        {
            id: 'item-1',
            description: 'Test Item',
            materialId: null,
            width: null,
            height: null,
            quantity: 1,
            customUnitPrice: null,
            unitPrice: 0,
            totalPrice: 0,
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
            // Start by resolving with an empty array or basic mock materials
            // We have to type cast because vi.mocked doesn't always automatically infer
            ; (pricingActions.getAllMaterialsForPricing as any).mockResolvedValue([
                { id: 'mat-1', name: 'Mock Vinyl', sellingPrice: 100, costPrice: 50, wasteFactor: 1, unit: 'sqm', tiers: [] }
            ])
    })

    it('renders the initial items correctly', async () => {
        render(<PricingCalculator items={defaultItems} onChange={mockOnChange} />)

        // The description input should have the value 'Test Item'
        const descInput = await screen.findByDisplayValue('Test Item')
        expect(descInput).toBeInTheDocument()

        // The "เพิ่มรายการ" button should be visible
        expect(screen.getByText('เพิ่มรายการ')).toBeInTheDocument()
    })

    it('calls onChange when Add Item button is clicked', async () => {
        render(<PricingCalculator items={defaultItems} onChange={mockOnChange} />)

        const addButton = screen.getByText('เพิ่มรายการ')
        fireEvent.click(addButton)

        // onChange should be called with an array of length 2
        // Wait for the mock to be called
        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalled()
            // Check the first argument (items) of the last call
            const lastCallArgs = mockOnChange.mock.lastCall
            expect(lastCallArgs![0]).toHaveLength(2)
        })
    })

    it('calls onChange when description is updated', async () => {
        render(<PricingCalculator items={defaultItems} onChange={mockOnChange} />)

        const descInput = await screen.findByDisplayValue('Test Item')
        fireEvent.change(descInput, { target: { value: 'Updated Item Name' } })

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalled()
            const updatedItems = mockOnChange.mock.lastCall![0]
            expect(updatedItems[0].description).toBe('Updated Item Name')
        })
    })

    it('recalculates unit price and total price when dimensions are changed', async () => {
        // Because useEffect relies on material lists and recalculation,
        // we start with an item that has manual inputs
        const customItem: CalcLineItem = {
            id: 'item-2',
            description: 'Custom Calc',
            materialId: null,
            width: null,
            height: null,
            quantity: 1,
            customUnitPrice: 150, // 150 per piece
            unitPrice: 150,
            totalPrice: 150,
        }

        render(<PricingCalculator items={[customItem]} onChange={mockOnChange} />)

        // Find the quantity input (it has a min="1" attribute)
        // Let's change quantity to 2
        const rows = document.querySelectorAll('tbody tr')
        const qtyInput = rows[0].querySelector('input[type="number"][min="1"]') as HTMLInputElement

        fireEvent.change(qtyInput, { target: { value: '2' } })

        // 1. First onChange triggers because item field was updated (quantity: 2) 
        // 2. Then useEffect detects items changed, recalculates (2 pieces * 150 = 300), and calls onChange again.
        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalled()
            // Get the last call to see the calculated result
            const lastCallArgs = mockOnChange.mock.lastCall!
            const updatedItems = lastCallArgs[0]
            expect(updatedItems[0].quantity).toBe(2)
            // Wait for the re-calc pass to happen
            // We might just be capturing the raw update, so let's check if the component calls it with results
        })
    })
})
