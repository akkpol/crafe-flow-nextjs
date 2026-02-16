/**
 * CraftFlow Pricing Engine
 * ========================
 * ระบบคำนวณราคางานป้ายแบบตั้งค่าได้
 *
 * สูตรหลัก:
 * 1. พื้นที่ = กว้าง × สูง × จำนวน
 * 2. วัสดุจริง = พื้นที่ × wasteFactor
 * 3. ราคาวัสดุ = วัสดุจริง × sellingPrice
 * 4. ส่วนลด = PricingTier discount
 * 5. ค่าบริการ = ติดตั้ง/ออกแบบ/ขนส่ง
 * 6. รวม = ราคาวัสดุ - ส่วนลด + ค่าบริการ
 * 7. VAT = รวม × vatRate
 * 8. Grand Total = รวม + VAT
 */

// ============================================================
// TYPES
// ============================================================

/** ค่าตั้งค่าระบบคำนวณ */
export interface PricingConfig {
    /** อัตรา VAT (default: 0.07 = 7%) */
    vatRate: number
    /** ปัดเศษเป็นจำนวนเต็มไหม */
    roundToInteger: boolean
    /** ค่าขั้นต่ำต่อรายการ (0 = ไม่มี) */
    minimumChargePerItem: number
    /** ค่าขั้นต่ำต่อใบเสนอราคา (0 = ไม่มี) */
    minimumChargePerOrder: number
}

/** ข้อมูลวัสดุสำหรับคำนวณ */
export interface PricingMaterial {
    id: string
    name: string
    sellingPrice: number       // ราคาขายต่อหน่วย (ต่อ sqm / ต่อ m / ต่อชิ้น)
    costPrice: number          // ราคาทุนต่อหน่วย
    wasteFactor: number        // ค่าสูญเสีย (1.15 = เผื่อ 15%)
    unit: string               // sqm, linear_meter, piece
}

/** เงื่อนไขส่วนลดตามปริมาณ */
export interface PricingTierInput {
    minQuantity: number        // ปริมาณขั้นต่ำที่ได้รับส่วนลด
    discountPercent: number    // % ส่วนลด (เช่น 5 = ลด 5%)
}

/** รายการสินค้าสำหรับคำนวณ */
export interface PricingLineItem {
    name: string
    width: number | null       // เมตร (null ถ้าขายเป็นชิ้น)
    height: number | null      // เมตร (null ถ้าขายเป็นชิ้น)
    quantity: number
    material: PricingMaterial
    pricingTiers?: PricingTierInput[]
    /** ราคาต่อหน่วยที่กำหนดเอง (override sellingPrice ของ material) */
    customUnitPrice?: number
}

/** ค่าบริการเสริม */
export interface ServiceCharge {
    name: string               // ชื่อบริการ เช่น 'ติดตั้ง', 'ออกแบบ', 'ขนส่ง'
    type: 'fixed' | 'per_sqm' | 'percentage'
    amount: number             // จำนวนเงิน หรือ ราคาต่อ sqm หรือ %
}

/** ผลลัพธ์การคำนวณต่อรายการ */
export interface LineItemResult {
    name: string
    /** พื้นที่ต่อชิ้น (sqm) — null ถ้าขายเป็นชิ้น */
    areaPer: number | null
    /** พื้นที่รวม (sqm × จำนวน) */
    totalArea: number
    /** พื้นที่จริงหลังคิด wasteFactor */
    materialArea: number
    /** ราคาต่อหน่วยที่ใช้ */
    unitPrice: number
    /** ราคาวัสดุก่อนส่วนลด */
    subtotal: number
    /** ส่วนลดตามปริมาณ (%) */
    discountPercent: number
    /** จำนวนเงินส่วนลด */
    discountAmount: number
    /** ราคาหลังส่วนลด */
    totalPrice: number
    /** กำไรขั้นต้นโดยประมาณ */
    estimatedProfit: number
    /** % กำไร */
    profitMargin: number
    /** จำนวนชิ้น */
    quantity: number
    /** wasteFactor ที่ใช้ */
    wasteFactor: number
}

/** ผลลัพธ์การคำนวณทั้งใบ */
export interface QuotationResult {
    /** รายการสินค้าแต่ละรายการ */
    lineItems: LineItemResult[]
    /** รวมราคาสินค้า (ก่อน service charges) */
    itemsSubtotal: number
    /** ค่าบริการเสริม */
    serviceCharges: { name: string; amount: number }[]
    /** รวมค่าบริการเสริม */
    serviceTotalAmount: number
    /** รวมทั้งหมดก่อน VAT */
    totalBeforeVat: number
    /** VAT */
    vatAmount: number
    /** อัตรา VAT ที่ใช้ */
    vatRate: number
    /** Grand Total */
    grandTotal: number
    /** ต้นทุนรวม */
    totalCost: number
    /** กำไรขั้นต้นรวม */
    totalProfit: number
    /** % กำไรเฉลี่ย */
    averageProfitMargin: number
}

// ============================================================
// DEFAULT CONFIG
// ============================================================

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
    vatRate: 0.07,
    roundToInteger: true,
    minimumChargePerItem: 0,
    minimumChargePerOrder: 0,
}

// ============================================================
// HELPERS
// ============================================================

/**
 * ปัดเศษทศนิยมเพื่อแก้ปัญหา IEEE 754 floating point
 * เช่น 3 * 1.15 = 3.4499999999... → round4(3*1.15) = 3.45
 * ใช้สำหรับค่า intermediate ก่อน final rounding
 */
export function round4(n: number): number {
    return Math.round(n * 10000) / 10000
}

// ============================================================
// CORE CALCULATION FUNCTIONS
// ============================================================

/**
 * คำนวณพื้นที่ (sqm)
 * ถ้าเป็นงานที่มี กว้าง×สูง จะคำนวณเป็น sqm
 * ถ้าไม่มี (ขายเป็นชิ้น) จะ return quantity ตรงๆ
 */
export function calculateArea(
    width: number | null,
    height: number | null,
    quantity: number
): { areaPer: number | null; totalArea: number } {
    if (width != null && height != null && width > 0 && height > 0) {
        const areaPer = round4(width * height)
        return { areaPer, totalArea: round4(areaPer * quantity) }
    }
    // ขายเป็นชิ้น — ใช้ quantity เป็น "area"
    return { areaPer: null, totalArea: quantity }
}

/**
 * คำนวณวัสดุจริงหลังรวม wasteFactor
 */
export function applyWasteFactor(area: number, wasteFactor: number): number {
    return round4(area * Math.max(1, wasteFactor))
}

/**
 * หาส่วนลดจาก PricingTier
 * เลือก tier ที่มี minQuantity สูงสุดที่ไม่เกิน quantity ปัจจุบัน
 */
export function findApplicableTier(
    quantity: number,
    tiers: PricingTierInput[]
): PricingTierInput | null {
    if (!tiers || tiers.length === 0) return null

    const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity)
    return sorted.find(t => quantity >= t.minQuantity) || null
}

/**
 * คำนวณราคาต่อรายการ
 */
export function calculateLineItem(
    item: PricingLineItem,
    config: PricingConfig = DEFAULT_PRICING_CONFIG
): LineItemResult {
    // 1. คำนวณพื้นที่
    const { areaPer, totalArea } = calculateArea(item.width, item.height, item.quantity)

    // 2. คิด wasteFactor
    const materialArea = applyWasteFactor(totalArea, item.material.wasteFactor)

    // 3. ราคาต่อหน่วย (custom หรือ sellingPrice)
    const unitPrice = item.customUnitPrice ?? item.material.sellingPrice

    // 4. ราคาวัสดุก่อนส่วนลด
    let subtotal = round4(materialArea * unitPrice)

    // 5. หาส่วนลด
    const tier = findApplicableTier(totalArea, item.pricingTiers || [])
    const discountPercent = tier?.discountPercent || 0
    const discountAmount = round4(subtotal * (discountPercent / 100))

    // 6. ราคาสุทธิ
    let totalPrice = subtotal - discountAmount

    // 7. ตรวจสอบค่าขั้นต่ำ
    if (config.minimumChargePerItem > 0 && totalPrice < config.minimumChargePerItem) {
        totalPrice = config.minimumChargePerItem
    }

    // 8. ปัดเศษ
    if (config.roundToInteger) {
        totalPrice = Math.round(totalPrice)
        subtotal = Math.round(subtotal)
    }

    // 9. คำนวณกำไร
    const materialCost = round4(materialArea * item.material.costPrice)
    const estimatedProfit = totalPrice - materialCost
    const profitMargin = totalPrice > 0 ? (estimatedProfit / totalPrice) * 100 : 0

    return {
        name: item.name,
        areaPer,
        totalArea,
        materialArea,
        unitPrice,
        subtotal,
        discountPercent,
        discountAmount: config.roundToInteger ? Math.round(discountAmount) : discountAmount,
        totalPrice,
        estimatedProfit: config.roundToInteger ? Math.round(estimatedProfit) : estimatedProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        quantity: item.quantity,
        wasteFactor: item.material.wasteFactor,
    }
}

/**
 * คำนวณค่าบริการเสริม
 */
export function calculateServiceCharges(
    charges: ServiceCharge[],
    totalArea: number,
    itemsSubtotal: number,
    config: PricingConfig = DEFAULT_PRICING_CONFIG
): { name: string; amount: number }[] {
    return charges.map(charge => {
        let amount: number
        switch (charge.type) {
            case 'fixed':
                amount = charge.amount
                break
            case 'per_sqm':
                amount = charge.amount * totalArea
                break
            case 'percentage':
                amount = itemsSubtotal * (charge.amount / 100)
                break
            default:
                amount = 0
        }

        if (config.roundToInteger) {
            amount = Math.round(amount)
        }

        return { name: charge.name, amount }
    })
}

/**
 * คำนวณ VAT
 */
export function calculateVat(
    amount: number,
    vatRate: number,
    roundToInteger: boolean = true
): number {
    const vat = amount * vatRate
    return roundToInteger ? Math.round(vat) : vat
}

/**
 * คำนวณทั้งใบเสนอราคา (Main Entry Point)
 */
export function calculateQuotation(
    items: PricingLineItem[],
    serviceCharges: ServiceCharge[] = [],
    config: PricingConfig = DEFAULT_PRICING_CONFIG
): QuotationResult {
    // 1. คำนวณแต่ละรายการ
    const lineItems = items.map(item => calculateLineItem(item, config))

    // 2. รวมราคาสินค้า
    const itemsSubtotal = lineItems.reduce((sum, li) => sum + li.totalPrice, 0)

    // 3. พื้นที่รวม (สำหรับ service charge per_sqm)
    const totalAreaAll = lineItems.reduce((sum, li) => sum + li.totalArea, 0)

    // 4. ค่าบริการเสริม
    const services = calculateServiceCharges(serviceCharges, totalAreaAll, itemsSubtotal, config)
    const serviceTotalAmount = services.reduce((sum, s) => sum + s.amount, 0)

    // 5. รวมก่อน VAT
    let totalBeforeVat = itemsSubtotal + serviceTotalAmount

    // 6. ตรวจสอบขั้นต่ำต่อใบ
    if (config.minimumChargePerOrder > 0 && totalBeforeVat < config.minimumChargePerOrder) {
        totalBeforeVat = config.minimumChargePerOrder
    }

    // 7. VAT
    const vatAmount = calculateVat(totalBeforeVat, config.vatRate, config.roundToInteger)

    // 8. Grand Total
    const grandTotal = config.roundToInteger
        ? Math.round(totalBeforeVat + vatAmount)
        : totalBeforeVat + vatAmount

    // 9. ต้นทุนและกำไรรวม
    const totalCost = lineItems.reduce((sum, li) => sum + (li.materialArea * items[lineItems.indexOf(li)].material.costPrice), 0)
    const totalProfit = totalBeforeVat - totalCost
    const averageProfitMargin = totalBeforeVat > 0
        ? Math.round((totalProfit / totalBeforeVat) * 10000) / 100
        : 0

    return {
        lineItems,
        itemsSubtotal,
        serviceCharges: services,
        serviceTotalAmount,
        totalBeforeVat,
        vatAmount,
        vatRate: config.vatRate,
        grandTotal,
        totalCost: config.roundToInteger ? Math.round(totalCost) : totalCost,
        totalProfit: config.roundToInteger ? Math.round(totalProfit) : totalProfit,
        averageProfitMargin,
    }
}
