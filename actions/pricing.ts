'use server'

import { createClient } from '@/lib/supabase-server'
import {
    calculateQuotation,
    DEFAULT_PRICING_CONFIG,
    type PricingConfig,
    type PricingLineItem,
    type PricingMaterial,
    type PricingTierInput,
    type ServiceCharge,
    type QuotationResult,
} from '@/lib/pricing-engine'

/**
 * ดึงข้อมูลวัสดุพร้อม PricingTiers สำหรับใช้ในการคำนวณ
 */
export async function getMaterialForPricing(materialId: string): Promise<PricingMaterial & { tiers: PricingTierInput[] } | null> {
    const supabase = await createClient()

    const { data: material, error: matError } = await supabase
        .from('Material')
        .select('id, name, sellingPrice, costPrice, wasteFactor, unit')
        .eq('id', materialId)
        .single()

    if (matError || !material) {
        console.error('Error fetching material for pricing:', matError)
        return null
    }

    const { data: tiers, error: tierError } = await supabase
        .from('PricingTier')
        .select('minQuantity, discountPercent')
        .eq('materialId', materialId)
        .order('minQuantity', { ascending: true })

    if (tierError) {
        console.error('Error fetching pricing tiers:', tierError)
    }

    return {
        ...material,
        tiers: (tiers || []).map(t => ({
            minQuantity: t.minQuantity,
            discountPercent: t.discountPercent,
        })),
    }
}

/**
 * ดึงวัสดุทั้งหมดพร้อม PricingTiers (สำหรับ dropdown เลือกวัสดุ)
 */
export async function getAllMaterialsForPricing(): Promise<(PricingMaterial & { tiers: PricingTierInput[] })[]> {
    const supabase = await createClient()

    const { data: materials, error } = await supabase
        .from('Material')
        .select('id, name, sellingPrice, costPrice, wasteFactor, unit')
        .order('name')

    if (error || !materials) {
        console.error('Error fetching materials:', error)
        return []
    }

    const { data: allTiers } = await supabase
        .from('PricingTier')
        .select('materialId, minQuantity, discountPercent')
        .order('minQuantity', { ascending: true })

    const tierMap = new Map<string, PricingTierInput[]>()
    for (const tier of allTiers || []) {
        const existing = tierMap.get(tier.materialId) || []
        existing.push({ minQuantity: tier.minQuantity, discountPercent: tier.discountPercent })
        tierMap.set(tier.materialId, existing)
    }

    return materials.map(m => ({
        ...m,
        tiers: tierMap.get(m.id) || [],
    }))
}

/**
 * คำนวณราคาใบเสนอราคา (Server Action)
 * รับ items + service charges แล้วคืนผลลัพธ์การคำนวณ
 */
export async function calculateQuotationAction(
    items: PricingLineItem[],
    serviceCharges: ServiceCharge[] = [],
    config?: Partial<PricingConfig>
): Promise<QuotationResult> {
    const mergedConfig: PricingConfig = {
        ...DEFAULT_PRICING_CONFIG,
        ...config,
    }

    return calculateQuotation(items, serviceCharges, mergedConfig)
}

/**
 * คำนวณราคาเร็ว (Quick Quote) — ป้อนแค่ materialId + ขนาด + จำนวน
 * เหมาะสำหรับใช้ตอนลูกค้าถามราคาทางโทรศัพท์/LINE
 */
export async function quickQuote(
    materialId: string,
    width: number,
    height: number,
    quantity: number = 1,
    config?: Partial<PricingConfig>
): Promise<QuotationResult | { error: string }> {
    const material = await getMaterialForPricing(materialId)

    if (!material) {
        return { error: 'Material not found' }
    }

    const lineItem: PricingLineItem = {
        name: material.name,
        width,
        height,
        quantity,
        material: {
            id: material.id,
            name: material.name,
            sellingPrice: material.sellingPrice,
            costPrice: material.costPrice,
            wasteFactor: material.wasteFactor,
            unit: material.unit,
        },
        pricingTiers: material.tiers,
    }

    const mergedConfig: PricingConfig = {
        ...DEFAULT_PRICING_CONFIG,
        ...config,
    }

    return calculateQuotation([lineItem], [], mergedConfig)
}
