# CraftFlow ERP - Complete Feature Specification
> **Version:** 3.0 - Complete Modern B2B System with Competitive Advantages
> **Last Updated:** 2025-03-08
> **Purpose:** Comprehensive specification for AI agents to implement
> **Key Differentiators:** Universal file attachments, Location management, Custom auth system

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Multi-Channel Customer Intake](#multi-channel-customer-intake)
3. [Quotation & Pricing](#quotation--pricing)
4. [Production Management](#production-management)
5. [Financial Management](#financial-management)
6. [Inventory & Materials](#inventory--materials)
7. [Backend Administration](#backend-administration)
8. [Modern Competitive Features](#modern-competitive-features)
9. [**Universal File Attachment System**](#universal-file-attachment-system) ⭐ NEW
10. [**Location Management & Google Maps**](#location-management--google-maps) ⭐ NEW
11. [**Custom Authentication System**](#custom-authentication-system) ⭐ NEW
12. [System Integration](#system-integration)
13. [Data Model & Relationships](#data-model--relationships)

---

## 1. System Overview

### 1.1 Core Workflow

```
Customer Contact (Multi-channel)
    ↓
Lead Capture & Qualification
    ↓
Quotation & Negotiation
    ↓
Order Confirmation
    ↓
Production Planning & Execution
    ↓
Quality Control & Installation
    ↓
Invoicing & Payment
    ↓
Receipt & After-sales
```

### 1.2 User Roles

| Role | Permissions | Primary Functions |
|------|-------------|-------------------|
| **Owner/Admin** | Full access | Settings, reports, approval workflows |
| **Sales Manager** | Sales + view financials | Quotations, customer management, approvals |
| **Sales Staff** | Sales operations | Quotations, customer intake, follow-ups |
| **Production Manager** | Production + materials | Job assignments, quality control, inventory |
| **Production Staff** | Own jobs only | Update job status, upload proof |
| **Accountant** | Financial ops | Invoices, receipts, reports |
| **Viewer** | Read-only | View reports and status |

---

## 2. Multi-Channel Customer Intake

### 2.1 Channel Overview

System must support customer contact from:
- 🏪 Walk-in (front desk)
- 📞 Phone call
- 💬 LINE Official Account
- 📘 Facebook Page/Messenger
- 📧 Email inquiry
- 🌐 Website contact form
- 📱 Mobile app (future)

### 2.2 Feature: Walk-in Customer Registration

**User Story:**
- AS a front desk staff
- I WANT to quickly register walk-in customers
- SO THAT I can capture their info without slowing down service

**Functional Requirements:**

#### 2.2.1 Quick Registration Form
```typescript
interface QuickCustomerForm {
  // Minimum required fields
  name: string;              // Required
  phone: string;             // Required (10 digits, Thai format)
  
  // Optional quick fields
  lineId?: string;           // Can add later
  email?: string;
  
  // Quick search existing
  searchQuery: string;       // Search by name/phone before creating
  
  // Registration source
  source: 'walk-in' | 'phone' | 'line' | 'facebook' | 'email' | 'website';
  referralSource?: string;   // How did they hear about us?
}
```

**UI Requirements:**
- Auto-focus on search field when page loads
- Real-time search as user types (debounced 300ms)
- Show "Create New" button if no match found
- Keyboard shortcuts: 
  - `Ctrl+N` = New customer
  - `Enter` = Select first result
  - `Esc` = Clear search

**Validation Rules:**
- Phone must be Thai format (10 digits starting with 0)
- Duplicate phone detection with merge option
- Name minimum 2 characters

#### 2.2.2 Existing Customer Quick Lookup

**Search Capabilities:**
- Search by: name (partial match), phone (exact or last 4 digits), LINE ID
- Show recent interactions (last 3)
- Show outstanding balance prominently
- Show last order date

**Display Format:**
```
📱 คุณสมชาย (089-xxx-1234) | LINE: somchai99
💰 ค้างชำระ: 15,000 บาท | ซื้อล่าสุด: 15/02/2025
────────────────────────────────────────────
📦 3 คำสั่งซื้อ | ✅ 2 เสร็จ | ⏳ 1 กำลังทำ
```

### 2.3 Feature: Phone Call Registration

**User Story:**
- AS a staff receiving phone calls
- I WANT to register customer info while talking
- SO THAT I can capture details without asking them to repeat

**Functional Requirements:**

#### 2.3.1 Call Intake Form
```typescript
interface PhoneCallIntake {
  // Call metadata
  callDateTime: DateTime;    // Auto-populated
  receivedBy: User;          // Auto from logged-in user
  callDuration?: number;     // Optional tracking
  
  // Customer info (same as walk-in)
  customer: QuickCustomerForm;
  
  // Call details
  inquiryType: 'quotation' | 'order_status' | 'complaint' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;             // Free text for details
  
  // Follow-up
  requiresFollowUp: boolean;
  followUpDate?: Date;
  assignedTo?: User;
}
```

**Call Script Template (Optional Feature):**
- Pre-set questions for different inquiry types
- Checklist to ensure all info captured
- Quick responses for common questions

### 2.4 Feature: LINE OA Integration

**User Story:**
- AS a customer
- I WANT to contact the business via LINE
- SO THAT I can inquire conveniently

**Functional Requirements:**

#### 2.4.1 LINE Webhook Handler
```typescript
interface LINEWebhookPayload {
  events: LINEEvent[];
}

interface LINEEvent {
  type: 'message' | 'follow' | 'unfollow' | 'join' | 'leave';
  timestamp: number;
  source: {
    type: 'user' | 'group' | 'room';
    userId: string;
    groupId?: string;
  };
  message?: {
    type: 'text' | 'image' | 'video' | 'file';
    id: string;
    text?: string;
  };
}
```

**Auto-Response Features:**
- Welcome message on first contact/follow
- Auto-reply for common keywords:
  - "ราคา" / "price" → Send quotation template message
  - "สถานะ" / "status" → Ask for order number
  - "ติดต่อ" / "contact" → Send business hours & address
- Business hours check (outside hours = auto-reply with opening hours)

#### 2.4.2 LINE User Auto-Capture

**Automatic Actions:**
1. When user sends first message:
   - Fetch LINE profile (displayName, pictureUrl, statusMessage)
   - Create/update entry in `line_users` table
   - Check if LINE userId matches existing customer
   - If not matched → Create lead entry

2. Display Name Matching Logic:
```typescript
// Try to match with existing customer
const possibleMatches = await searchCustomers({
  query: lineProfile.displayName,
  fuzzyMatch: true
});

if (possibleMatches.length === 1) {
  // Auto-link with confidence
  linkCustomerToLine(customer.id, lineUserId);
} else if (possibleMatches.length > 1) {
  // Ask staff to confirm which customer
  createPendingMatch(lineUserId, possibleMatches);
}
```

#### 2.4.3 LINE Message Dashboard

**Staff Interface Requirements:**
- Real-time inbox (WebSocket or polling every 5s)
- Conversation view grouped by LINE user
- Unread message count badge
- Quick reply templates
- Rich message support (images, flex messages)
- Assign conversation to staff member
- Internal notes (not visible to customer)

**UI Components:**
```
┌─────────────────────────────────────────┐
│ 💬 LINE Messages              [🔍][⚙️]│
├─────────────────────────────────────────┤
│ 🔵 คุณสมชาย • 2 นาที            [คุย]  │
│   สอบถามราคาป้ายอะคริลิค...             │
├─────────────────────────────────────────┤
│ ⚪ คุณสมหญิง • 1 ชม.             [คุย]  │
│   ขอดูสถานะงาน...                       │
├─────────────────────────────────────────┤
│ ⚪ +66812345678 • 2 ชม.         [คุย]   │
│   [รูปภาพ]                              │
└─────────────────────────────────────────┘
```

**Notification System:**
- Browser push notifications for new messages
- Sound alert (can disable)
- Desktop notification (if permitted)
- Mobile app notification (future)

### 2.5 Feature: Facebook Integration

**User Story:**
- AS a customer
- I WANT to message the business on Facebook
- SO THAT I can use my preferred platform

**Functional Requirements:**

#### 2.5.1 Facebook Messenger Integration

**Setup Requirements:**
- Facebook App integration via Graph API
- Webhook for page messages
- Page Access Token management

**Similar to LINE with additions:**
```typescript
interface FacebookMessage {
  senderId: string;           // Facebook User ID (PSID)
  recipientId: string;        // Page ID
  timestamp: number;
  message: {
    mid: string;              // Message ID
    text?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'file' | 'audio';
      payload: { url: string };
    }>;
  };
}
```

**Auto-Link with Customer:**
- Fetch public profile (name, profile picture)
- Match with existing customers
- Store mapping in database

#### 2.5.2 Facebook Comments Monitoring

**Additional Feature:**
- Monitor comments on Facebook posts
- Alert staff to questions/inquiries in comments
- Quick reply from dashboard
- Convert comment thread to customer lead

### 2.6 Feature: Email & Web Form Intake

**User Story:**
- AS a customer
- I WANT to submit inquiry via website
- SO THAT I can provide detailed information

**Functional Requirements:**

#### 2.6.1 Web Contact Form

**Public Form Fields:**
```typescript
interface WebContactForm {
  // Required
  name: string;
  phone: string;
  email: string;
  inquiryType: 'quotation' | 'general' | 'complaint' | 'partnership';
  
  // Optional
  companyName?: string;
  message: string;
  attachments?: File[];      // Max 5 files, 10MB each
  
  // Hidden fields
  source: 'website';
  referrer: string;          // Which page they came from
  utmParams?: {              // Marketing tracking
    source: string;
    medium: string;
    campaign: string;
  };
}
```

**Form Validation:**
- Real-time validation on blur
- Show error messages inline
- reCAPTCHA v3 for spam prevention
- Honeypot field for bot detection

**Submission Flow:**
1. Validate all fields
2. Upload attachments to storage
3. Create lead in database
4. Send confirmation email to customer
5. Notify staff via:
   - Email to sales@company.com
   - Dashboard notification
   - LINE notify (optional)

#### 2.6.2 Email Parser (Advanced)

**Automatic Email Processing:**
```typescript
interface EmailInbound {
  from: string;              // sender@email.com
  to: string;                // sales@company.com
  subject: string;
  body: string;              // Plain text
  bodyHtml: string;          // HTML version
  attachments: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
  receivedAt: DateTime;
}
```

**AI-Powered Email Categorization:**
- Use LLM to analyze email content
- Extract:
  - Intent (quotation request, status inquiry, complaint)
  - Urgency level
  - Key requirements
  - Contact details
- Auto-create lead with extracted info
- Suggest response template

### 2.7 Feature: Unified Inbox

**User Story:**
- AS a staff member
- I WANT to see all customer messages in one place
- SO THAT I don't miss any inquiries

**Functional Requirements:**

#### 2.7.1 Omnichannel Dashboard

**Consolidated View:**
```
┌──────────────────────────────────────────────────────┐
│ 📬 All Messages                   [Filters] [Search] │
├──────────────────────────────────────────────────────┤
│ 🔴 NEW                                               │
│ ├─ 💬 LINE • คุณสมชาย • 2 min                       │
│ │  "สอบถามราคาป้ายอะคริลิค 2x3 เมตร"                │
│ │  [Assign to me] [Create Quotation]                │
│ ├─ 📘 FB • Somying Shop • 5 min                     │
│ │  "ขอดูผลงาน LED sign"                              │
│ └─ 📧 Email • info@customer.com • 10 min            │
│    Subject: "Inquiry for custom signage"            │
├──────────────────────────────────────────────────────┤
│ ⏳ IN PROGRESS (5)                                   │
│ ├─ 💬 LINE • คุณมานี • Assigned to: Somchai        │
│ └─ 📞 Phone • 089-xxx-1234 • Follow-up: Today 3PM  │
├──────────────────────────────────────────────────────┤
│ ✅ RESOLVED (25)                [View All]           │
└──────────────────────────────────────────────────────┘
```

**Filter Options:**
- Channel (LINE, FB, Email, Phone, Walk-in)
- Status (New, In Progress, Resolved, Archived)
- Assigned to (Me, Unassigned, Team member)
- Date range
- Urgency level
- Customer type (New lead, Existing customer)

**Bulk Actions:**
- Assign multiple messages
- Mark as resolved
- Archive
- Export to CSV

### 2.8 Feature: Customer Profile Management

**User Story:**
- AS a staff
- I WANT to see complete customer history
- SO THAT I can provide personalized service

**Functional Requirements:**

#### 2.8.1 Customer Detail Page

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ [← Back]  Customer: คุณสมชาย ใจดี         [Edit] [⋮]    │
├─────────────────────────────────────────────────────────┤
│ 📱 Contact Information               💰 Financial Info  │
│ ├─ Phone: 089-123-4567              ├─ Credit Limit:   │
│ ├─ LINE: @somchai99                 │   50,000 บาท     │
│ ├─ Email: somchai@email.com         ├─ Outstanding:    │
│ └─ Address: 123 ถนน...              │   15,000 บาท ⚠️  │
│                                      └─ Payment Terms:  │
│ 🏢 Business Information                  30 days       │
│ ├─ Company: บริษัท ABC จำกัด                           │
│ ├─ Tax ID: 0123456789012                               │
│ ├─ Branch: สำนักงานใหญ่                                 │
│ └─ Industry: Retail                                     │
├─────────────────────────────────────────────────────────┤
│ 📊 Statistics                                           │
│ ├─ Total Orders: 15                                     │
│ ├─ Total Spent: 450,000 บาท                            │
│ ├─ Average Order: 30,000 บาท                           │
│ ├─ First Order: 15/01/2024                             │
│ ├─ Last Order: 28/02/2025                              │
│ └─ Customer Since: 10 months                           │
├─────────────────────────────────────────────────────────┤
│ 📝 Tags & Notes                                         │
│ ├─ Tags: [VIP] [Fast Payer] [Bulk Orders]             │
│ └─ Internal Notes:                                      │
│    "ชอบป้าย LED, ส่งมอบต้องตรงเวลา, จ่ายตรงเสมอ"      │
├─────────────────────────────────────────────────────────┤
│ 📋 Order History          [Filter] [Export]             │
├─────────────────────────────────────────────────────────┤
│ OR-202502-0045 • 28/02/2025 • 35,000฿ • ✅ Completed   │
│ OR-202502-0032 • 15/02/2025 • 28,000฿ • 🚚 Installing  │
│ OR-202501-0089 • 22/01/2025 • 42,000฿ • ✅ Completed   │
│                                         [Load More...]  │
├─────────────────────────────────────────────────────────┤
│ 💬 Communication History  [All Channels]                │
├─────────────────────────────────────────────────────────┤
│ 28/02/25 • LINE • สอบถามสถานะงาน OR-0045              │
│ 15/02/25 • Phone Call • สั่งงานใหม่                   │
│ 10/02/25 • Facebook • ถามราคา                         │
│                                         [Load More...]  │
└─────────────────────────────────────────────────────────┘
```

#### 2.8.2 Customer Segmentation

**Auto-Tagging System:**
```typescript
interface CustomerSegment {
  id: string;
  name: string;
  criteria: {
    totalSpent?: { min: number; max: number };
    orderCount?: { min: number; max: number };
    lastOrderDays?: number;           // Days since last order
    averageOrderValue?: { min: number };
    paymentBehavior?: 'fast' | 'slow' | 'late';
    orderFrequency?: 'regular' | 'occasional' | 'one-time';
  };
  benefits?: {
    discountPercent?: number;
    prioritySupport?: boolean;
    extendedPaymentTerms?: number;
  };
}

// Example segments
const segments = [
  {
    name: 'VIP',
    criteria: { totalSpent: { min: 500000 }, orderCount: { min: 10 } },
    benefits: { discountPercent: 5, prioritySupport: true }
  },
  {
    name: 'At Risk',
    criteria: { lastOrderDays: 180 },  // No order in 6 months
    // Trigger: Send reactivation campaign
  },
  {
    name: 'New Customer',
    criteria: { orderCount: { max: 1 } },
    // Trigger: Send welcome series
  }
];
```

#### 2.8.3 Credit Management

**Credit Limit System:**
```typescript
interface CreditSettings {
  customerId: string;
  creditLimit: number;              // Maximum allowed outstanding
  paymentTerms: number;             // Days (e.g., 30, 60, 90)
  requiresApproval: boolean;        // Need manager approval if exceeded
  
  // Auto-calculated
  currentOutstanding: number;
  availableCredit: number;          // creditLimit - currentOutstanding
  
  // History
  creditHistory: Array<{
    date: DateTime;
    type: 'limit_increase' | 'limit_decrease' | 'payment' | 'invoice';
    amount: number;
    balance: number;
    notes: string;
  }>;
}
```

**Credit Check at Quotation:**
- Warn if creating quotation exceeds available credit
- Show approval workflow if exceeded
- Block order creation if severely exceeded (configurable)

---

## 3. Quotation & Pricing

### 3.1 Feature: Smart Quotation Builder

**User Story:**
- AS a sales person
- I WANT to create quotations quickly with accurate pricing
- SO THAT I can respond to customers fast

**Functional Requirements:**

#### 3.1.1 Product/Service Catalog

**Pre-configured Products:**
```typescript
interface ProductTemplate {
  id: string;
  name: string;
  category: string;              // e.g., 'LED Sign', 'Acrylic', 'Vinyl'
  description: string;
  
  // Pricing model
  pricingType: 'per_sqm' | 'per_unit' | 'per_meter' | 'fixed';
  basePrice: number;
  
  // Materials used
  materials: Array<{
    materialId: string;
    quantityFormula: string;     // e.g., "width * height * 1.15"
    unit: string;
  }>;
  
  // Optional addons
  addons?: Array<{
    id: string;
    name: string;
    price: number;
    type: 'per_unit' | 'fixed';
  }>;
  
  // Images
  images: string[];
  thumbnail: string;
  
  // Minimum order
  minQuantity?: number;
  minSize?: { width: number; height: number };
}
```

**Example Products:**
- ป้าย LED (LED Sign)
  - Pricing: per square meter
  - Materials: LED modules, aluminum frame, power supply
  - Addons: Installation, warranty extension
  
- ป้ายอะคริลิค (Acrylic Sign)
  - Pricing: per square meter
  - Materials: Acrylic sheet, vinyl letters, mounting hardware
  
- สติ๊กเกอร์ (Vinyl Sticker)
  - Pricing: per square meter
  - Materials: Vinyl material, lamination

#### 3.1.2 Dynamic Pricing Calculator

**Calculation Engine:**
```typescript
interface QuotationCalculator {
  // Base calculation
  calculateBasePrice(item: QuotationItem): number;
  
  // Volume discounts
  applyVolumeDiscount(quantity: number, basePrice: number): number;
  
  // Customer discounts
  applyCustomerDiscount(customerId: string, price: number): number;
  
  // Complexity multipliers
  applyComplexityFactor(specifications: any): number;
  
  // Material cost
  calculateMaterialCost(item: QuotationItem): number;
  
  // Labor estimation
  estimateLaborHours(item: QuotationItem): number;
  
  // Final price
  calculateFinalPrice(item: QuotationItem): {
    subtotal: number;
    discount: number;
    materialCost: number;
    laborCost: number;
    profit: number;
    profitMargin: number;
  };
}
```

**Volume Discount Tiers:**
```typescript
interface VolumeDiscount {
  materialId: string;
  tiers: Array<{
    minQuantity: number;
    discountPercent: number;
  }>;
}

// Example
const ledModuleDiscount = {
  materialId: 'led-module-001',
  tiers: [
    { minQuantity: 10, discountPercent: 5 },
    { minQuantity: 50, discountPercent: 10 },
    { minQuantity: 100, discountPercent: 15 }
  ]
};
```

#### 3.1.3 Quotation Form UI

**Step-by-Step Builder:**

**Step 1: Customer Selection**
```
┌────────────────────────────────────────┐
│ New Quotation                    [X]   │
├────────────────────────────────────────┤
│ 👤 Select Customer         [Required]  │
│ ┌────────────────────────────────────┐ │
│ │ 🔍 Search name, phone, LINE...     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Create New Customer]                  │
└────────────────────────────────────────┘
```

**Step 2: Add Items**
```
┌──────────────────────────────────────────────────┐
│ 📦 Items                          [+ Add Item]   │
├──────────────────────────────────────────────────┤
│ Item 1: ป้าย LED                     [Edit][×]  │
│ ├─ Size: 2.0 × 3.0 m (6 ตร.ม.)                 │
│ ├─ Quantity: 1                                   │
│ ├─ Price/sqm: 5,000 บาท                         │
│ ├─ Subtotal: 30,000 บาท                         │
│ └─ Addons:                                       │
│    ├─ [✓] Installation (+3,000฿)                │
│    └─ [ ] Warranty 3 years (+5,000฿)            │
├──────────────────────────────────────────────────┤
│ Item 2: ป้ายอะคริลิค                 [Edit][×]  │
│ └─ ... (similar structure)                       │
└──────────────────────────────────────────────────┘
```

**Step 3: Pricing Summary**
```
┌──────────────────────────────────────┐
│ 💰 Pricing Summary                   │
├──────────────────────────────────────┤
│ Subtotal:          65,000.00 บาท    │
│ Discount (5%):     -3,250.00 บาท    │
│ ───────────────────────────────      │
│ Before VAT:        61,750.00 บาท    │
│ VAT 7%:             4,322.50 บาท    │
│ ───────────────────────────────      │
│ Total:             66,072.50 บาท    │
│                                      │
│ 💡 Profit Margin: 35% (22,755฿)     │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Discount: [5] %  [Apply]         │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Step 4: Terms & Validity**
```
┌─────────────────────────────────────────┐
│ 📋 Quotation Details                    │
├─────────────────────────────────────────┤
│ Quotation Number: QT-202503-0042       │
│ Issue Date: 06/03/2025                  │
│                                         │
│ Valid Until: [15/03/2025] (9 days)     │
│                                         │
│ Payment Terms:                          │
│ ┌─────────────────────────────────────┐ │
│ │ [x] 50% deposit before production   │ │
│ │ [x] 50% before delivery             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Delivery Timeline: [ 14 ] days         │
│                                         │
│ Notes / Special Conditions:             │
│ ┌─────────────────────────────────────┐ │
│ │ - ติดตั้งนอกเวลาทำการ              │ │
│ │ - รับประกัน 1 ปี                    │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Save as Draft] [Send to Customer]     │
└─────────────────────────────────────────┘
```

#### 3.1.4 Quotation Templates

**Pre-saved Templates:**
```typescript
interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  
  // Pre-configured items
  items: Array<ProductTemplate>;
  
  // Default terms
  defaultPaymentTerms: string;
  defaultDeliveryDays: number;
  defaultNotes: string;
  
  // Usage tracking
  usageCount: number;
  lastUsed: DateTime;
}
```

**Example Templates:**
- "ป้าย LED ขนาดมาตรฐาน" (Standard LED Sign)
- "ชุดป้ายหน้าร้าน" (Store Front Package)
- "งานด่วน 3 วัน" (Rush Job 3 Days)

**Quick Actions:**
- Use template as starting point
- Modify items/pricing
- Save new version as template
- Share template with team

### 3.2 Feature: Quotation Approval Workflow

**User Story:**
- AS a sales manager
- I WANT to approve quotations with large discounts
- SO THAT I can control pricing and profitability

**Functional Requirements:**

#### 3.2.1 Approval Rules

```typescript
interface ApprovalRule {
  id: string;
  name: string;
  condition: {
    type: 'discount_percent' | 'total_amount' | 'profit_margin' | 'custom';
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | [number, number];
  };
  requiredApprovers: Array<{
    role: string;              // 'sales_manager' | 'owner'
    count: number;             // How many approvers needed
  }>;
  notifyUsers: string[];       // User IDs to notify
}

// Example rules
const approvalRules = [
  {
    name: 'Large Discount',
    condition: { type: 'discount_percent', operator: 'gt', value: 10 },
    requiredApprovers: [{ role: 'sales_manager', count: 1 }]
  },
  {
    name: 'High Value Deal',
    condition: { type: 'total_amount', operator: 'gt', value: 500000 },
    requiredApprovers: [{ role: 'owner', count: 1 }]
  },
  {
    name: 'Low Profit Margin',
    condition: { type: 'profit_margin', operator: 'lt', value: 20 },
    requiredApprovers: [
      { role: 'sales_manager', count: 1 },
      { role: 'owner', count: 1 }
    ]
  }
];
```

#### 3.2.2 Approval UI

**Pending Approvals Dashboard:**
```
┌──────────────────────────────────────────────────────┐
│ ⏳ Pending Approvals (3)             [My Queue][All] │
├──────────────────────────────────────────────────────┤
│ 🔴 URGENT • QT-202503-0042 • คุณสมชาย               │
│ ├─ Created by: พนักงานขาย A • 2 hours ago          │
│ ├─ Total: 850,000฿ • Discount: 15%                 │
│ ├─ Reason: "ลูกค้า VIP สั่งซื้อปริมาณมาก"          │
│ └─ [✅ Approve] [❌ Reject] [💬 Request Changes]    │
├──────────────────────────────────────────────────────┤
│ 🟡 NORMAL • QT-202503-0040 • บริษัท ABC            │
│ ├─ Created by: พนักงานขาย B • 1 day ago            │
│ ├─ Total: 450,000฿ • Profit Margin: 18%            │
│ ├─ Reason: "แข่งขันกับคู่แข่ง ลด margin"            │
│ └─ [✅ Approve] [❌ Reject] [💬 Request Changes]    │
└──────────────────────────────────────────────────────┘
```

**Approval Actions:**
- ✅ Approve: Move quotation to "Approved" status
- ❌ Reject: Return to sales with reason
- 💬 Request Changes: Ask for modifications
- 👁️ View Details: Full quotation view

**Notification Flow:**
1. Sales creates quotation → Triggers approval rule
2. System notifies approvers via:
   - In-app notification
   - Email
   - LINE Notify (optional)
3. Approver reviews and decides
4. Sales gets notified of decision
5. If approved → Can send to customer
6. If rejected → Must revise or escalate

### 3.3 Feature: Quotation Comparison

**User Story:**
- AS a sales person
- I WANT to compare multiple quotation versions
- SO THAT I can show options to customers

**Functional Requirements:**

```typescript
interface QuotationComparison {
  quotations: Quotation[];     // 2-4 quotations to compare
  
  // Side-by-side view
  displayMode: 'table' | 'cards';
  
  // Highlight differences
  showDifferences: boolean;
  
  // Export options
  exportFormat: 'pdf' | 'excel' | 'image';
}
```

**Comparison Table UI:**
```
┌────────────────────────────────────────────────────────────┐
│ Compare Quotations                        [Export PDF]     │
├────────────┬─────────────┬─────────────┬─────────────┬────┤
│            │ Option A    │ Option B    │ Option C    │    │
│            │ (Standard)  │ (Premium)   │ (Budget)    │    │
├────────────┼─────────────┼─────────────┼─────────────┼────┤
│ LED Type   │ P10         │ P8          │ P16         │    │
│ Resolution │ 320×160     │ 400×200     │ 160×80      │🔍 │
│ Warranty   │ 1 year      │ 2 years     │ 1 year      │    │
│ Install    │ Included    │ Included    │ Not incl.   │    │
├────────────┼─────────────┼─────────────┼─────────────┼────┤
│ Price      │ 85,000฿    │ 125,000฿   │ 55,000฿    │    │
│            │ [Select]    │ [Select]    │ [Select]    │    │
└────────────┴─────────────┴─────────────┴─────────────┴────┘
```

### 3.4 Feature: PDF Export - Quotation

**User Story:**
- AS a sales person
- I WANT to export quotation as professional PDF
- SO THAT I can send it to customers

**Functional Requirements:**

#### 3.4.1 PDF Template Design

**Thai Business Standard Format:**

**Header Section:**
```
┌─────────────────────────────────────────────────────────┐
│ [Company Logo]              ใบเสนอราคา / QUOTATION      │
│                                                           │
│ บริษัท XYZ จำกัด           QT-202503-0042               │
│ 123 ถนนสุขุมวิท             วันที่: 06/03/2025           │
│ กรุงเทพฯ 10110              ใช้ได้ถึง: 15/03/2025        │
│ โทร: 02-xxx-xxxx                                         │
│ Tax ID: 0123456789012                                    │
└─────────────────────────────────────────────────────────┘
```

**Customer Section:**
```
┌─────────────────────────────────────────────────────────┐
│ เรียน: คุณสมชาย ใจดี                                     │
│ บริษัท: บริษัท ABC จำกัด                                │
│ ที่อยู่: 456 ถนนพระราม 4                                │
│         กรุงเทพฯ 10110                                   │
│ โทร: 089-123-4567                                        │
│ Tax ID: 9876543210123                                    │
└─────────────────────────────────────────────────────────┘
```

**Items Table:**
```
┌────┬────────────────────┬────────┬────────┬─────────────┐
│ #  │ รายการ             │ จำนวน │ ราคา/หน่วย│ รวม       │
├────┼────────────────────┼────────┼────────┼─────────────┤
│ 1  │ ป้าย LED           │        │        │             │
│    │ ขนาด 2×3 เมตร     │   1    │ 30,000 │  30,000.00  │
│    │ (6 ตารางเมตร)      │  ชิ้น  │  บาท   │     บาท     │
│    │                     │        │        │             │
│    │ รายละเอียด:         │        │        │             │
│    │ - Full color LED   │        │        │             │
│    │ - รวมติดตั้ง        │        │        │             │
│    │ - รับประกัน 1 ปี   │        │        │             │
├────┼────────────────────┼────────┼────────┼─────────────┤
│ 2  │ ป้ายอะคริลิค      │   1    │ 15,000 │  15,000.00  │
│    │ ... (similar)      │        │        │             │
└────┴────────────────────┴────────┴────────┴─────────────┘
```

**Summary Section:**
```
┌─────────────────────────────────────────────────────────┐
│                                  ยอดรวม:    45,000.00 ฿ │
│                                  ส่วนลด 5%: -2,250.00 ฿ │
│                                  ────────────────────── │
│                                  ราคาก่อน VAT: 42,750฿  │
│                                  VAT 7%:      2,992.50฿ │
│                                  ────────────────────── │
│                                  ราคารวมทั้งสิ้น:        │
│                                  45,742.50 บาท          │
│                                  (สี่หมื่นห้าพันเจ็ดร้อย│
│                                  สี่สิบสองบาทห้าสิบสต.) │
└─────────────────────────────────────────────────────────┘
```

**Terms & Conditions:**
```
เงื่อนไขการชำระเงิน:
- มัดจำ 50% ก่อนเริ่มงาน
- ชำระส่วนที่เหลือ 50% ก่อนส่งมอบ

กำหนดส่งมอบ: ภายใน 14 วันทำการ

หมายเหตุ:
- ราคานี้ใช้ได้ถึงวันที่ 15/03/2025
- รับประกันงานติดตั้ง 1 ปี
- ฟรีบำรุงรักษา 3 เดือน

ผู้เสนอราคา: _______________________
ผู้อนุมัติ: _______________________
```

**Footer:**
```
────────────────────────────────────────────────────────
หากมีข้อสงสัย กรุณาติดต่อ: sales@company.com | 02-xxx-xxxx
www.company.com | LINE: @companyofficial
```

#### 3.4.2 PDF Generation Technical Spec

**Implementation Options:**

**Option A: Puppeteer (Server-side)**
```typescript
// API Route: /api/pdf/quotation/[id]
import puppeteer from 'puppeteer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // 1. Fetch data
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      organization: true,
      items: true
    }
  });
  
  // 2. Generate HTML
  const html = generateQuotationHTML(quotation);
  
  // 3. Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // 4. Generate PDF
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  });
  
  await browser.close();
  
  // 5. Return PDF
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=QT-${quotation.quotationNumber}.pdf`
    }
  });
}
```

**Option B: React-PDF (Client-side)**
```typescript
import { PDFDownloadLink, Document, Page, Text, View } from '@react-pdf/renderer';

const QuotationPDF = ({ quotation }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={quotation.organization.logoUrl} />
        <Text>ใบเสนอราคา / QUOTATION</Text>
      </View>
      {/* ... rest of PDF content */}
    </Page>
  </Document>
);

// Usage in component
<PDFDownloadLink 
  document={<QuotationPDF quotation={quotation} />}
  fileName={`QT-${quotation.quotationNumber}.pdf`}
>
  {({ loading }) => loading ? 'Generating...' : 'Download PDF'}
</PDFDownloadLink>
```

**Recommended: Puppeteer**
- ✅ Better Thai font support
- ✅ Complex layouts easier
- ✅ CSS styling familiar
- ✅ Can reuse existing templates
- ❌ Requires server-side processing
- ❌ Slower than client-side

**Font Configuration:**
```typescript
// Support Thai fonts
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
    
    * {
      font-family: 'Sarabun', sans-serif;
    }
    
    body {
      font-size: 14px;
      line-height: 1.6;
    }
    
    .header {
      font-size: 18px;
      font-weight: 700;
      text-align: center;
    }
    
    /* ... more styles */
  </style>
</head>
<body>
  ${quotationContent}
</body>
</html>
`;
```

#### 3.4.3 Watermark & Branding

**Optional Features:**
- Company watermark (semi-transparent)
- "DRAFT" stamp if not approved
- "EXPIRED" stamp if past validity date
- QR code for verification
- Custom footer with social media

#### 3.4.4 Multi-language Support

**Bilingual PDF (Thai/English):**
```typescript
interface LocalizedText {
  th: string;
  en: string;
}

const labels = {
  quotation: { th: 'ใบเสนอราคา', en: 'QUOTATION' },
  customer: { th: 'ลูกค้า', en: 'Customer' },
  total: { th: 'รวมทั้งสิ้น', en: 'Grand Total' },
  // ... more labels
};

// Usage
<Text>{labels.quotation[language]}</Text>
```

---

## 4. Production Management

### 4.1 Feature: Advanced Kanban Board

**User Story:**
- AS a production manager
- I WANT to see all jobs and their status at a glance
- SO THAT I can manage workflow efficiently

**Functional Requirements:**

#### 4.1.1 Kanban Columns

**Default Workflow:**
```typescript
const defaultColumns = [
  { id: 'new', name: 'รอดำเนินการ', color: '#gray' },
  { id: 'pending', name: 'รอวัสดุ', color: '#yellow' },
  { id: 'in_progress', name: 'กำลังผลิต', color: '#blue' },
  { id: 'review', name: 'รอตรวจสอบ', color: '#purple' },
  { id: 'installing', name: 'กำลังติดตั้ง', color: '#orange' },
  { id: 'completed', name: 'เสร็จสิ้น', color: '#green' }
];
```

**Customizable Columns:**
- Add/remove/reorder columns
- Rename columns
- Set column limits (WIP limits)
- Column-specific rules (auto-notifications, etc.)

#### 4.1.2 Job Card Design

**Card Layout:**
```
┌──────────────────────────────────────────────────┐
│ OR-202503-0042                    [⋮]            │
│ ป้าย LED 2×3m                                    │
├──────────────────────────────────────────────────┤
│ 👤 คุณสมชาย                  📅 Due: 15/03 (9d) │
│ 🔨 Assigned: ช่างสมชาย           🚨 HIGH        │
├──────────────────────────────────────────────────┤
│ 📎 3 files   💬 2 comments   📸 1 photo          │
├──────────────────────────────────────────────────┤
│ Progress: ████████░░ 80%                         │
└──────────────────────────────────────────────────┘
```

**Card Information:**
- Order number
- Product/service name
- Customer name
- Assigned worker
- Deadline (with days remaining)
- Priority indicator
- Attachment counts
- Progress bar (optional)

**Color Coding:**
- 🟢 Green border: On schedule
- 🟡 Yellow border: Approaching deadline (< 3 days)
- 🔴 Red border: Overdue
- 🔵 Blue badge: High priority
- 🔶 Orange badge: Rush job

#### 4.1.3 Drag & Drop Functionality

**Desktop Interaction:**
```typescript
// Using dnd-kit or react-beautiful-dnd
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={cards}>
    {columns.map(column => (
      <Column key={column.id} id={column.id}>
        {getCardsForColumn(column.id).map(card => (
          <DraggableCard key={card.id} card={card} />
        ))}
      </Column>
    ))}
  </SortableContext>
</DndContext>

function handleDragEnd(event) {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    // Move card to new column
    updateJobStatus(active.id, over.id);
    
    // Log history
    logJobHistory({
      jobId: active.id,
      action: 'status_changed',
      oldStatus: active.columnId,
      newStatus: over.id,
      actorId: currentUser.id
    });
    
    // Trigger notifications
    notifyStakeholders(active.id, over.id);
  }
}
```

**Mobile Interaction:**
- Long press to grab card
- Drag to column header
- Or use button-based status change:

```
┌────────────────────────────────────┐
│ OR-202503-0042                     │
│ ป้าย LED 2×3m                      │
├────────────────────────────────────┤
│ Status: 🔵 กำลังผลิต               │
│                                    │
│ Change Status:                     │
│ [← รอวัสดุ] [รอตรวจสอบ →]         │
└────────────────────────────────────┘
```

#### 4.1.4 Filters & Search

**Filter Panel:**
```
┌────────────────────────────────────────┐
│ 🔍 Search: [                    ]     │
├────────────────────────────────────────┤
│ 📅 Deadline:                           │
│    ( ) All                             │
│    (•) Today                           │
│    ( ) This Week                       │
│    ( ) Overdue                         │
│    ( ) Custom Range                    │
├────────────────────────────────────────┤
│ 🚨 Priority:                           │
│    [x] Low                             │
│    [x] Medium                          │
│    [x] High                            │
│    [x] Urgent                          │
├────────────────────────────────────────┤
│ 🔨 Assigned To:                        │
│    [x] Me                              │
│    [x] ช่างสมชาย                       │
│    [x] ช่างสมหญิง                      │
│    [ ] Unassigned                      │
├────────────────────────────────────────┤
│ 👤 Customer:                           │
│    [Select customer...]                │
├────────────────────────────────────────┤
│ [Apply Filters]  [Reset]               │
└────────────────────────────────────────┘
```

**Saved Views:**
- "My Jobs" - Jobs assigned to me
- "Overdue" - Past deadline
- "This Week" - Deadline this week
- "High Priority" - Urgent jobs
- Custom views (user-defined)

### 4.2 Feature: Design File Management

**User Story:**
- AS a production worker
- I WANT to access design files for my jobs
- SO THAT I can produce accurate products

**Functional Requirements:**

#### 4.2.1 File Upload System

**Upload Interface:**
```typescript
interface DesignFileUpload {
  orderId: string;
  files: File[];             // Multiple files support
  
  // File metadata
  fileName: string;
  fileType: string;          // MIME type
  fileSize: number;          // Bytes
  
  // Storage
  fileUrl: string;           // Supabase Storage URL
  thumbnailUrl?: string;     // For images
  
  // Metadata
  uploadedBy: string;        // User ID
  uploadedAt: DateTime;
  version?: number;          // File versioning
  notes?: string;
}
```

**Accepted File Types:**
- Images: .jpg, .png, .gif, .svg
- Design files: .ai, .psd, .pdf, .eps, .cdr
- Documents: .pdf, .doc, .docx
- CAD files: .dwg, .dxf
- Max size: 50MB per file
- Max files: 20 per order

**Upload UI Component:**
```tsx
<FileUploadZone
  orderId={order.id}
  maxFiles={20}
  maxSize={50 * 1024 * 1024}  // 50MB
  accept=".jpg,.png,.pdf,.ai,.psd,.eps,.cdr,.dwg"
  onUploadComplete={(files) => {
    // Refresh file list
    refetchFiles();
    toast.success(`Uploaded ${files.length} files`);
  }}
  onUploadError={(error) => {
    toast.error(error.message);
  }}
>
  <div className="dropzone">
    <Upload size={48} />
    <p>Drop files here or click to upload</p>
    <p className="text-sm text-gray-500">
      Max 50MB per file
    </p>
  </div>
</FileUploadZone>
```

**Progress Indicator:**
```
┌────────────────────────────────────────┐
│ Uploading Files...                     │
├────────────────────────────────────────┤
│ design-v1.ai                           │
│ ██████████████████░░ 90% (4.5MB/5MB)   │
├────────────────────────────────────────┤
│ mockup.png                             │
│ ████████████████████ 100% ✓            │
└────────────────────────────────────────┘
```

#### 4.2.2 File List & Preview

**File Manager Interface:**
```
┌──────────────────────────────────────────────────────┐
│ 📎 Design Files (5)                   [+ Upload]     │
├──────────────────────────────────────────────────────┤
│ ┌──────┐ design-final-v3.ai                          │
│ │[📄]  │ 12.5 MB • Uploaded by สมชาย • 2 hours ago  │
│ └──────┘ [👁️ Preview] [⬇️ Download] [🗑️ Delete]      │
├──────────────────────────────────────────────────────┤
│ ┌──────┐ mockup.png                                  │
│ │[🖼️]  │ 2.3 MB • Uploaded by สมหญิง • Yesterday    │
│ └──────┘ [👁️ Preview] [⬇️ Download] [🗑️ Delete]      │
├──────────────────────────────────────────────────────┤
│ ┌──────┐ specification.pdf                           │
│ │[📄]  │ 856 KB • Uploaded by ลูกค้า • 3 days ago   │
│ └──────┘ [👁️ Preview] [⬇️ Download] [🗑️ Delete]      │
└──────────────────────────────────────────────────────┘
```

**Preview Modal:**
- Images: Full-size preview with zoom
- PDFs: Embedded PDF viewer
- Other files: Show file info + download button

**File Versioning:**
- Keep history of all uploaded versions
- Show version number (v1, v2, v3)
- Compare versions side-by-side
- Restore previous version

#### 4.2.3 Supabase Storage Integration

**Storage Configuration:**
```typescript
// Storage bucket setup
const BUCKET_NAME = 'design-files';

// Upload file
async function uploadDesignFile(
  orderId: string,
  file: File
): Promise<DesignFile> {
  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${orderId}/${Date.now()}-${file.name}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);
  
  // Save to database
  const designFile = await prisma.designFile.create({
    data: {
      orderId,
      fileName: file.name,
      fileUrl: publicUrl,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: currentUser.id
    }
  });
  
  return designFile;
}

// Download file
async function downloadFile(fileUrl: string) {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Delete file
async function deleteDesignFile(id: string) {
  const file = await prisma.designFile.findUnique({ where: { id } });
  
  // Delete from storage
  const path = file.fileUrl.split('/').slice(-2).join('/');
  await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);
  
  // Delete from database
  await prisma.designFile.delete({ where: { id } });
}
```

**Security Rules:**
- RLS policies: Users can only access files for their organization
- Authenticated uploads only
- File type validation
- Virus scanning (optional, via external service)

### 4.3 Feature: Production Progress Tracking

**User Story:**
- AS a production worker
- I WANT to update job progress with photos
- SO THAT managers can track status

**Functional Requirements:**

#### 4.3.1 Progress Updates

**Update Form:**
```
┌────────────────────────────────────────┐
│ Update Progress: OR-202503-0042        │
├────────────────────────────────────────┤
│ Current Status: 🔵 กำลังผลิต          │
│                                        │
│ Progress: [████████░░] 80%             │
│           Slide to update              │
│                                        │
│ 📸 Upload Progress Photos:             │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │ [+] │ │[📷] │ │[📷] │               │
│ └─────┘ └─────┘ └─────┘               │
│                                        │
│ 📝 Notes:                              │
│ ┌────────────────────────────────────┐ │
│ │ เสร็จแล้ว 80% รอติดตั้ง LED       │ │
│ │ module ส่วนท้าย                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Issues/Blockers:                       │
│ [ ] Need additional materials          │
│ [ ] Waiting for customer approval      │
│ [ ] Technical difficulties             │
│                                        │
│ [Cancel]           [Submit Update]     │
└────────────────────────────────────────┘
```

**Photo Upload:**
- Take photo directly (mobile)
- Upload from gallery
- Multiple photos per update
- Auto-compress for faster upload
- Add captions to photos

#### 4.3.2 Timeline View

**Job History Timeline:**
```
┌────────────────────────────────────────────────────────┐
│ 📋 Job Timeline: OR-202503-0042                        │
├────────────────────────────────────────────────────────┤
│ ● 06/03/2025 14:30 - ช่างสมชาย                        │
│   📸 Progress Update (80%)                             │
│   "เสร็จแล้ว 80% รอติดตั้ง LED module ส่วนท้าย"       │
│   [View 2 photos]                                      │
│                                                        │
│ ● 06/03/2025 09:15 - ช่างสมชาย                        │
│   ✏️ Status changed: รอวัสดุ → กำลังผลิต              │
│                                                        │
│ ● 05/03/2025 16:45 - คลังวัสดุ                        │
│   📦 Materials issued                                  │
│   - LED Module P10 (60 pcs)                            │
│   - Aluminum Frame 2x3m (1 set)                        │
│                                                        │
│ ● 05/03/2025 14:00 - พนักงานขาย A                     │
│   ✏️ Status changed: รอดำเนินการ → รอวัสดุ             │
│                                                        │
│ ● 05/03/2025 10:30 - พนักงานขาย A                     │
│   ✨ Job created from QT-202503-0042                   │
│                                                        │
│ [Load More...]                                         │
└────────────────────────────────────────────────────────┘
```

**Timeline Events:**
- Job creation
- Status changes
- Assignments
- Progress updates
- File uploads
- Comments
- Material issues
- Quality checks
- Installation
- Completion

#### 4.3.3 Photo Gallery

**Gallery View:**
```
┌────────────────────────────────────────────────────────┐
│ 📸 Progress Photos (12)                      [Upload]  │
├────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │ [Image] │ │ [Image] │ │ [Image] │ │ [Image] │      │
│ │ 06/03   │ │ 06/03   │ │ 05/03   │ │ 05/03   │      │
│ │ 14:30   │ │ 14:30   │ │ 16:45   │ │ 16:45   │      │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │ [Image] │ │ [Image] │ │ [Image] │ │ [Image] │      │
│ │ 04/03   │ │ 04/03   │ │ 03/03   │ │ 03/03   │      │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
└────────────────────────────────────────────────────────┘
```

**Photo Actions:**
- Click to view full-size
- Swipe gallery
- Download photo
- Delete photo (uploader only)
- Add caption/notes
- Share via LINE/Email

### 4.4 Feature: Quality Control & Approval

**User Story:**
- AS a production manager
- I WANT to review completed work before delivery
- SO THAT we maintain quality standards

**Functional Requirements:**

#### 4.4.1 Submit for Review

**Worker Action:**
```
┌────────────────────────────────────────┐
│ OR-202503-0042                         │
│ Status: 🔵 กำลังผลิต                   │
├────────────────────────────────────────┤
│ ✅ Ready for quality check?            │
│                                        │
│ Before submitting:                     │
│ [✓] All work completed                 │
│ [✓] Photos uploaded                    │
│ [✓] Materials returned to stock        │
│                                        │
│ 📸 Final Photos Required:              │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │[📷] │ │[📷] │ │[📷] │               │
│ └─────┘ └─────┘ └─────┘               │
│ (At least 3 photos required)           │
│                                        │
│ 📝 Completion Notes:                   │
│ ┌────────────────────────────────────┐ │
│ │ งานเสร็จตามแบบ ทดสอบไฟแล้ว       │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Cancel]     [🚀 Submit for Review]    │
└────────────────────────────────────────┘
```

**Validation Rules:**
- Minimum 3 photos required
- Progress must be 100%
- Completion notes required
- All design files must be acknowledged

#### 4.4.2 Review Dashboard

**Manager View:**
```
┌──────────────────────────────────────────────────────┐
│ 🔍 Pending Reviews (4)                    [Settings] │
├──────────────────────────────────────────────────────┤
│ 🟡 OR-202503-0042 • ป้าย LED 2×3m                   │
│ ├─ Completed by: ช่างสมชาย • 30 min ago             │
│ ├─ Customer: คุณสมชาย • Due: 15/03 (9 days)        │
│ ├─ Photos: 5 • Notes: "งานเสร็จตามแบบ..."           │
│ └─ [🔍 Review] [✅ Approve] [❌ Reject]               │
├──────────────────────────────────────────────────────┤
│ 🟡 OR-202503-0038 • ป้ายอะคริลิค                    │
│ └─ ... (similar)                                     │
└──────────────────────────────────────────────────────┘
```

#### 4.4.3 Review Interface

**Detailed Review Screen:**
```
┌──────────────────────────────────────────────────────┐
│ Quality Review: OR-202503-0042         [← Back]      │
├──────────────────────────────────────────────────────┤
│ 📸 Final Photos (5)          [< >] 1/5               │
│ ┌────────────────────────────────────────────────┐   │
│ │                                                │   │
│ │          [Large Photo Display]                 │   │
│ │                                                │   │
│ └────────────────────────────────────────────────┘   │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                       │
│ │[•]│ │[ ]│ │[ ]│ │[ ]│ │[ ]│  Thumbnails           │
│ └───┘ └───┘ └───┘ └───┘ └───┘                       │
├──────────────────────────────────────────────────────┤
│ 📝 Worker Notes:                                     │
│ "งานเสร็จตามแบบ ทดสอบไฟแล้วครบทุก module"           │
├──────────────────────────────────────────────────────┤
│ ✅ Quality Checklist:                                │
│ [✓] Dimensions correct                               │
│ [✓] Materials as specified                           │
│ [✓] Finish quality acceptable                        │
│ [✓] Electrical testing passed (if applicable)        │
│ [✓] Packaging/protection adequate                    │
├──────────────────────────────────────────────────────┤
│ 📋 Review Decision:                                  │
│ ( ) ✅ Approve - Ready for delivery                  │
│ ( ) ⚠️ Approve with notes                            │
│ ( ) ❌ Reject - Rework required                      │
│                                                      │
│ Reviewer Notes:                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │                                                │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ [Cancel]                 [Submit Review]             │
└──────────────────────────────────────────────────────┘
```

**Review Actions:**

**Approve:**
- Move job to "Installing" or "Completed"
- Notify customer (optional)
- Notify installation team (if applicable)

**Approve with Notes:**
- Move to next stage
- Add notes for installation team
- Track minor issues

**Reject:**
- Return to "In Progress"
- Add detailed rejection reasons
- Notify worker
- Create rework task

**Rejection Form:**
```
┌────────────────────────────────────────┐
│ ❌ Reject for Rework                   │
├────────────────────────────────────────┤
│ Issues Found:                          │
│ [✓] Dimension mismatch                 │
│ [✓] Poor finish quality                │
│ [ ] Wrong materials                    │
│ [ ] Damage during production           │
│ [ ] Other                              │
│                                        │
│ Detailed Explanation:                  │
│ ┌────────────────────────────────────┐ │
│ │ ขนาดสูงต่ำกว่าที่ต้องการ 5cm      │ │
│ │ ขอให้ตรวจสอบและผลิตใหม่          │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Attach Reference Photos:               │
│ [+ Upload Photos]                      │
│                                        │
│ Severity:                              │
│ ( ) Minor - Can fix quickly            │
│ (•) Major - Requires rework            │
│ ( ) Critical - Start over              │
│                                        │
│ [Cancel]           [Submit Rejection]  │
└────────────────────────────────────────┘
```

---

## 5. Financial Management

### 5.1 Feature: Invoice Generation

**User Story:**
- AS an accountant
- I WANT to generate invoices from completed orders
- SO THAT I can bill customers accurately

**Functional Requirements:**

#### 5.1.1 Invoice Creation

**Auto-Generate from Order:**
```typescript
async function createInvoiceFromOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: true,
      organization: true
    }
  });
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber('INVOICE'); // IV-202503-0042
  
  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      organizationId: order.organizationId,
      invoiceNumber,
      orderId,
      customerId: order.customerId,
      status: 'DRAFT',
      
      // Copy financial data
      totalAmount: order.totalAmount,
      vatAmount: order.vatAmount,
      grandTotal: order.grandTotal,
      
      // Due date (30 days default, or based on customer terms)
      dueDate: addDays(new Date(), 30),
      
      // Copy items
      items: {
        create: order.items.map(item => ({
          name: item.name,
          description: item.details,
          width: item.width,
          height: item.height,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }
    }
  });
  
  // Deduct materials from stock
  await deductMaterialsFromStock(order);
  
  return invoice;
}
```

**Invoice Number Generation:**
```typescript
function generateInvoiceNumber(type: 'INVOICE' | 'TAX_INVOICE'): string {
  const prefix = type === 'TAX_INVOICE' ? 'TX' : 'IV';
  const yearMonth = format(new Date(), 'yyyyMM'); // 202503
  const sequence = getNextSequenceNumber(prefix, yearMonth); // 0042
  
  return `${prefix}-${yearMonth}-${sequence.toString().padStart(4, '0')}`;
  // Returns: IV-202503-0042 or TX-202503-0042
}
```

#### 5.1.2 Tax Invoice Support

**Thai Tax Invoice Requirements:**
- Official tax invoice number (separate from regular invoice)
- Company tax ID (13 digits)
- Customer tax ID (if applicable)
- VAT breakdown
- Official format and wording

**Tax Invoice Toggle:**
```
┌────────────────────────────────────────┐
│ Create Invoice                         │
├────────────────────────────────────────┤
│ Type:                                  │
│ ( ) Invoice (ใบแจ้งหนี้)               │
│ (•) Tax Invoice (ใบกำกับภาษี)         │
│                                        │
│ ℹ️ Tax invoice will be used for       │
│    VAT deduction                       │
└────────────────────────────────────────┘
```

**Tax Invoice Generation:**
```typescript
async function createTaxInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });
  
  // Generate tax invoice number
  const taxInvoiceNumber = await generateInvoiceNumber('TAX_INVOICE');
  
  // Update invoice
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      isTaxInvoice: true,
      taxInvoiceNumber,
      taxInvoiceDate: new Date()
    }
  });
  
  // Log in tax register (legal requirement)
  await logTaxInvoice(taxInvoiceNumber, invoice);
  
  return taxInvoiceNumber;
}
```

#### 5.1.3 Invoice PDF Export

**Similar to Quotation PDF but with differences:**

**Header:**
```
ใบแจ้งหนี้ / INVOICE               [Or] ใบกำกับภาษี / TAX INVOICE
เลขที่ (No.): IV-202503-0042               TX-202503-0042
วันที่ (Date): 06/03/2025
ครบกำหนด (Due): 05/04/2025 (30 วัน)
อ้างอิง (Ref): OR-202503-0042
```

**Payment Status Stamp:**
- "UNPAID" (red) - ยังไม่ชำระ
- "PARTIALLY PAID" (yellow) - ชำระบางส่วน
- "PAID" (green stamp) - ชำระแล้ว

**Payment Information Section:**
```
┌─────────────────────────────────────────────────────────┐
│ วิธีการชำระเงิน / PAYMENT METHOD                        │
├─────────────────────────────────────────────────────────┤
│ โอนเงินผ่านบัญชีธนาคาร:                                 │
│ ธนาคารกสิกรไทย                                          │
│ ชื่อบัญชี: บริษัท XYZ จำกัด                            │
│ เลขที่บัญชี: 123-4-56789-0                             │
│                                                         │
│ พร้อมเพย์:                                              │
│ [QR Code]     เลขประจำตัวผู้เสียภาษี: 0123456789012    │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Feature: Payment Receipt

**User Story:**
- AS an accountant
- I WANT to record payments and issue receipts
- SO THAT I can track cash flow

**Functional Requirements:**

#### 5.2.1 Payment Recording

**Payment Form:**
```
┌────────────────────────────────────────────────────────┐
│ Record Payment                                  [X]    │
├────────────────────────────────────────────────────────┤
│ Invoice: IV-202503-0042                                │
│ Customer: คุณสมชาย ใจดี                                │
│ Amount Due: 66,072.50 บาท                              │
├────────────────────────────────────────────────────────┤
│ Payment Date: [06/03/2025]  [Today]                    │
│                                                        │
│ Payment Method:                                        │
│ (•) Cash (เงินสด)                                      │
│ ( ) Bank Transfer (โอนเงิน)                            │
│ ( ) Cheque (เช็ค)                                      │
│ ( ) Credit Card (บัตรเครดิต)                          │
│                                                        │
│ [Bank Transfer Details]                                │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Bank: [ธนาคารกสิกรไทย          ▼]                 │ │
│ │ Account: [บช. บริษัท (xxx-xxx-x789-0) ▼]          │ │
│ │ Transfer Date/Time: [06/03/2025 14:30]             │ │
│ │ Reference: [TXN123456789]                          │ │
│ │                                                    │ │
│ │ Attach Proof:                                      │ │
│ │ [📎 slip-20250306.jpg] [x]                         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ Amount Received: [66,072.50] บาท                       │
│                                                        │
│ Notes:                                                 │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Cancel]              [💰 Record Payment & Issue Receipt] │
└────────────────────────────────────────────────────────┘
```

**Partial Payment Support:**
```
┌────────────────────────────────────────┐
│ Invoice: IV-202503-0042                │
│ Total Amount: 66,072.50 บาท            │
│ Paid: 33,000.00 บาท                    │
│ Outstanding: 33,072.50 บาท             │
├────────────────────────────────────────┤
│ Payment #1:                            │
│ 33,000.00฿ • 05/03/2025 • Cash        │
│ ─────────────────────────────          │
│ Payment #2:                            │
│ [Record new payment...]                │
└────────────────────────────────────────┘
```

#### 5.2.2 Auto-Status Updates

**Workflow Automation:**
```typescript
async function recordPayment(data: PaymentData) {
  const { invoiceId, amount, method, reference } = data;
  
  // 1. Create payment record
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      paymentMethod: method,
      reference,
      paymentDate: new Date(),
      organizationId: currentUser.organizationId
    }
  });
  
  // 2. Update invoice paid amount
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });
  
  const newAmountPaid = invoice.amountPaid + amount;
  const isFullyPaid = newAmountPaid >= invoice.grandTotal;
  
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: newAmountPaid,
      status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID'
    }
  });
  
  // 3. If fully paid, update order status
  if (isFullyPaid && invoice.orderId) {
    await prisma.order.update({
      where: { id: invoice.orderId },
      data: {
        status: 'completed'
      }
    });
  }
  
  // 4. Generate receipt
  const receipt = await generateReceipt(payment);
  
  // 5. Notify customer (optional)
  if (shouldNotifyCustomer) {
    await sendPaymentConfirmation(invoice.customerId, receipt);
  }
  
  return { payment, receipt };
}
```

#### 5.2.3 Receipt PDF

**Receipt Format:**
```
┌─────────────────────────────────────────────────────────┐
│                   ใบเสร็จรับเงิน                        │
│                  OFFICIAL RECEIPT                        │
├─────────────────────────────────────────────────────────┤
│ [Company Logo]          บริษัท XYZ จำกัด               │
│                         123 ถนนสุขุมวิท                  │
│                         กรุงเทพฯ 10110                   │
│                         เลขประจำตัวผู้เสียภาษี:          │
│                         0123456789012                    │
├─────────────────────────────────────────────────────────┤
│ เลขที่ใบเสร็จ (Receipt No.): RC-202503-0042            │
│ วันที่ (Date): 06/03/2025                               │
│ ใบแจ้งหนี้อ้างอิง (Invoice Ref): IV-202503-0042        │
├─────────────────────────────────────────────────────────┤
│ ได้รับเงินจาก (Received from):                          │
│ คุณสมชาย ใจดี                                           │
│ บริษัท ABC จำกัด                                        │
│ เลขประจำตัวผู้เสียภาษี: 9876543210123                  │
├─────────────────────────────────────────────────────────┤
│ รายการ (Description)              จำนวนเงิน (Amount)    │
│ ชำระค่าสินค้า/บริการ               66,072.50 บาท       │
│ ตามใบแจ้งหนี้เลขที่ IV-202503-0042                     │
├─────────────────────────────────────────────────────────┤
│ วิธีการชำระเงิน: โอนเงิน - ธนาคารกสิกรไทย              │
│ เลขที่อ้างอิง: TXN123456789                            │
├─────────────────────────────────────────────────────────┤
│                         รวมเงิน: 66,072.50 บาท         │
│                         (หกหมื่นหกพันเจ็ดสิบสองบาท       │
│                         ห้าสิบสตางค์)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ผู้รับเงิน: _______________________                    │
│             (พนักงานบัญชี)                              │
│                                                         │
│                                    [PAID Stamp]         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Feature: Financial Reports

**User Story:**
- AS a business owner
- I WANT to see financial reports
- SO THAT I can make informed decisions

**Functional Requirements:**

#### 5.3.1 Revenue Dashboard

**Dashboard Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ 💰 Financial Overview                    [Export] [...]  │
├──────────────────────────────────────────────────────────┤
│ Period: [This Month ▼]  [01/03/25 - 06/03/25]           │
├─────────────────┬────────────────┬────────────────────────┤
│ 💵 Revenue      │ 📊 Orders      │ 💸 Outstanding         │
│ 2,450,000 บาท  │ 45 orders      │ 385,000 บาท           │
│ +15% vs last   │ +8 orders      │ 5 customers            │
└─────────────────┴────────────────┴────────────────────────┘
```

**Revenue Chart:**
```
┌──────────────────────────────────────────────────────────┐
│ 📈 Revenue Trend                              [Daily ▼] │
├──────────────────────────────────────────────────────────┤
│ 150K ┤                                           ╭──     │
│      │                                    ╭─────╯        │
│ 100K ┤                         ╭─────────╯               │
│      │              ╭─────────╯                          │
│  50K ┤     ╭───────╯                                     │
│      │────╯                                              │
│    0 └────┬────┬────┬────┬────┬────┬────                │
│         01  02  03  04  05  06  Today                    │
└──────────────────────────────────────────────────────────┘
```

**Top Customers:**
```
┌──────────────────────────────────────────────────────────┐
│ 🏆 Top Customers                              [View All] │
├──────────────────────────────────────────────────────────┤
│ 1. คุณสมชาย        385,000฿    8 orders    [View]      │
│ 2. บริษัท ABC      245,000฿    5 orders    [View]      │
│ 3. คุณสมหญิง       180,000฿    12 orders   [View]      │
│ 4. ร้าน XYZ        155,000฿    6 orders    [View]      │
│ 5. คุณมานะ         142,000฿    4 orders    [View]      │
└──────────────────────────────────────────────────────────┘
```

**Top Products:**
```
┌──────────────────────────────────────────────────────────┐
│ 📦 Top Products                               [View All] │
├──────────────────────────────────────────────────────────┤
│ 1. ป้าย LED          850,000฿    25 orders             │
│ 2. ป้ายอะคริลิค      420,000฿    35 orders             │
│ 3. สติ๊กเกอร์         285,000฿    18 orders             │
│ 4. ป้ายไฟ            195,000฿    12 orders             │
└──────────────────────────────────────────────────────────┘
```

#### 5.3.2 Aging Report

**Outstanding Receivables:**
```
┌──────────────────────────────────────────────────────────┐
│ 📅 Aging Report                          [Export Excel]  │
├──────────────────────────────────────────────────────────┤
│ 🟢 Current (0-30 days):        185,000฿  (48%)          │
│ 🟡 31-60 days:                  95,000฿  (25%)          │
│ 🟠 61-90 days:                  65,000฿  (17%)          │
│ 🔴 Over 90 days:                40,000฿  (10%)          │
│ ──────────────────────────────────────                  │
│ Total Outstanding:             385,000฿                  │
├──────────────────────────────────────────────────────────┤
│ Customer             │ Invoice │ Days│ Amount  │ Action │
├──────────────────────┼─────────┼─────┼─────────┼────────┤
│🔴 คุณมานี           │ IV-0025 │ 95  │ 40,000฿│[Follow]│
│🟠 บริษัท DEF        │ IV-0032 │ 75  │ 65,000฿│[Follow]│
│🟡 คุณสมพร           │ IV-0041 │ 45  │ 35,000฿│[Remind]│
│🟡 ร้าน GHI          │ IV-0039 │ 40  │ 60,000฿│[Remind]│
│🟢 คุณสมชาย          │ IV-0042 │ 15  │ 66,072฿│   -    │
│🟢 บริษัท ABC        │ IV-0040 │ 10  │ 85,000฿│   -    │
└──────────────────────┴─────────┴─────┴─────────┴────────┘
```

**Follow-up Actions:**
- Send reminder (email/LINE)
- Schedule phone call
- Flag for collection
- Apply late fees (if configured)

#### 5.3.3 Profit Analysis

**Profit Breakdown:**
```
┌──────────────────────────────────────────────────────────┐
│ 💹 Profit Analysis - March 2025                          │
├──────────────────────────────────────────────────────────┤
│ Total Revenue:                    2,450,000 บาท          │
│ ├─ Material Costs:    980,000฿   (40%)                  │
│ ├─ Labor Costs:       490,000฿   (20%)                  │
│ ├─ Overhead:          245,000฿   (10%)                  │
│ └─ Profit:            735,000฿   (30%)                  │
│                                                          │
│ Profit Margin: ████████████░░░░░░░░ 30%                 │
│                                                          │
│ Target: 35% │ Status: -5% below target ⚠️               │
└──────────────────────────────────────────────────────────┘
```

**By Product Category:**
```
┌──────────────────────────────────────────────────────────┐
│ Product       │Revenue  │Cost     │Profit  │Margin      │
├───────────────┼─────────┼─────────┼────────┼────────────┤
│ป้าย LED      │850,000฿ │425,000฿ │425,000฿│50% 🟢     │
│ป้ายอะคริลิค  │420,000฿ │210,000฿ │210,000฿│50% 🟢     │
│สติ๊กเกอร์     │285,000฿ │171,000฿ │114,000฿│40% 🟢     │
│ป้ายไฟ        │195,000฿ │156,000฿ │ 39,000฿│20% 🟡     │
└───────────────┴─────────┴─────────┴────────┴────────────┘
```

---

## 6. Inventory & Materials

### 6.1 Feature: Material Management

**User Story:**
- AS a warehouse manager
- I WANT to track material inventory
- SO THAT I can prevent stockouts

**Functional Requirements:**

#### 6.1.1 Material Master Data

**Material Form:**
```typescript
interface Material {
  id: string;
  organizationId: string;
  
  // Basic info
  name: string;
  sku?: string;              // Stock Keeping Unit code
  category: string;           // 'LED', 'Acrylic', 'Vinyl', etc.
  unit: string;               // 'pcs', 'sqm', 'meter', 'kg'
  
  // Pricing
  costPrice: number;          // Purchase price
  sellingPrice: number;       // Default selling price
  
  // Inventory
  inStock: number;            // Current stock level
  minStock: number;           // Reorder point
  maxStock?: number;          // Maximum stock level
  
  // Waste factor
  wasteFactor: number;        // Default: 1.15 (15% waste)
  
  // Supplier info
  supplierName?: string;
  supplierContact?: string;
  leadTimeDays?: number;      // Days to receive after order
  
  // Additional fields
  description?: string;
  imageUrl?: string;
  barcode?: string;
  location?: string;          // Warehouse location
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**Material Form UI:**
```
┌────────────────────────────────────────────────────────┐
│ Add New Material                            [Save][X]  │
├────────────────────────────────────────────────────────┤
│ Basic Information                                      │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Name: [LED Module P10                         ] │   │
│ │ SKU:  [LED-P10-001                            ] │   │
│ │ Category: [LED Modules            ▼]            │   │
│ │ Unit: [pieces                     ▼]            │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Pricing                                                │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Cost Price:    [450.00] บาท/piece               │   │
│ │ Selling Price: [650.00] บาท/piece               │   │
│ │ Markup: 44.4%                                    │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Inventory                                              │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Current Stock: [0    ] pieces                    │   │
│ │ Min Stock:     [50   ] pieces (Reorder point)   │   │
│ │ Max Stock:     [500  ] pieces                    │   │
│ │                                                  │   │
│ │ Waste Factor: [1.15] (15% waste)                 │   │
│ │ ℹ️ System will order 15% extra to account      │   │
│ │    for cutting/waste                             │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ Supplier Information                                   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Supplier: [LED Supply Co.                     ] │   │
│ │ Contact:  [02-xxx-xxxx                        ] │   │
│ │ Lead Time: [7   ] days                          │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ [Cancel]                                        [Save] │
└────────────────────────────────────────────────────────┘
```

#### 6.1.2 Material List

**List View:**
```
┌──────────────────────────────────────────────────────────┐
│ 📦 Materials (45)              [+ Add] [Import] [Export] │
├──────────────────────────────────────────────────────────┤
│ Filters: [All ▼] [Category ▼] [Low Stock Only]          │
├──────────────────────────────────────────────────────────┤
│ Name           │Cat.│Stock│Min│Unit│Cost│Sell│Actions   │
├────────────────┼────┼─────┼───┼────┼────┼────┼──────────┤
│🔴 LED P10      │LED │ 25  │50 │pcs │450 │650 │[⚠️][Edit]│
│   (Below min)  │    │     │   │    │    │    │          │
├────────────────┼────┼─────┼───┼────┼────┼────┼──────────┤
│🟢 Acrylic 5mm │Acr │150  │50 │sqm │120 │250 │[✓][Edit] │
├────────────────┼────┼─────┼───┼────┼────┼────┼──────────┤
│🟢 Vinyl Matt  │Vin │ 85  │30 │sqm │ 80 │180 │[✓][Edit] │
├────────────────┼────┼─────┼───┼────┼────┼────┼──────────┤
│🟡 LED P8       │LED │ 52  │50 │pcs │580 │850 │[⚠️][Edit]│
│   (Near min)   │    │     │   │    │    │    │          │
└────────────────┴────┴─────┴───┴────┴────┴────┴──────────┘
```

**Status Indicators:**
- 🟢 Green: Stock > min + 20%
- 🟡 Yellow: Stock between min and min + 20%
- 🔴 Red: Stock < min (reorder alert)

#### 6.1.3 Stock Adjustment

**Adjustment Form:**
```
┌────────────────────────────────────────────────────────┐
│ Adjust Stock: LED Module P10                    [X]    │
├────────────────────────────────────────────────────────┤
│ Current Stock: 25 pieces                               │
│                                                        │
│ Adjustment Type:                                       │
│ (•) Stock In (Purchase/Receive)                        │
│ ( ) Stock Out (Sale/Use)                               │
│ ( ) Adjustment (Count correction)                      │
│ ( ) Return (from customer/supplier)                    │
│ ( ) Damage/Loss                                        │
│                                                        │
│ Quantity: [+ 100] pieces                               │
│                                                        │
│ New Stock Level: 125 pieces 🟢                         │
│                                                        │
│ Reference/Notes:                                       │
│ ┌────────────────────────────────────────────────────┐ │
│ │ PO-20250306-001                                    │ │
│ │ Received from LED Supply Co.                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Cancel]                            [Confirm Adjustment]│
└────────────────────────────────────────────────────────┘
```

**Batch Operations:**
```
┌────────────────────────────────────────────────────────┐
│ Batch Stock Adjustment                          [X]    │
├────────────────────────────────────────────────────────┤
│ Import from Excel or enter manually:                   │
│                                                        │
│ SKU          │Type  │Qty │Reference                   │
│──────────────┼──────┼────┼────────────────────────────│
│ LED-P10-001  │IN    │100 │PO-20250306-001            │
│ LED-P8-001   │IN    │ 50 │PO-20250306-001            │
│ ACR-5MM-001  │IN    │ 75 │PO-20250306-002            │
│                                                        │
│ [+ Add Row]  [Import Excel]                            │
│                                                        │
│ [Cancel]                          [Process 3 Adjustments]│
└────────────────────────────────────────────────────────┘
```

#### 6.1.4 Stock Transaction History

**Transaction Log:**
```
┌──────────────────────────────────────────────────────────┐
│ Stock History: LED Module P10                            │
├──────────────────────────────────────────────────────────┤
│ Date       │Type│Qty  │Bal │Reference    │By            │
├────────────┼────┼─────┼────┼─────────────┼──────────────┤
│06/03 14:30 │IN  │+100 │125 │PO-0306-001  │Warehouse Mgr │
│05/03 09:15 │OUT │ -60 │ 25 │IV-0042      │Auto (System) │
│04/03 16:20 │OUT │ -35 │ 85 │IV-0040      │Auto (System) │
│03/03 10:00 │IN  │+120 │120 │PO-0303-001  │Warehouse Mgr │
│01/03 08:30 │ADJ │  -5 │  0 │Stocktake    │Warehouse Mgr │
│                                             [Load More...] │
└──────────────────────────────────────────────────────────┘
```

**Filter Options:**
- Date range
- Transaction type
- Reference (PO, Invoice, etc.)
- User who made transaction

### 6.2 Feature: Low Stock Alerts

**User Story:**
- AS a warehouse manager
- I WANT to be notified when stock is low
- SO THAT I can reorder before running out

**Functional Requirements:**

#### 6.2.1 Alert Configuration

**Alert Settings:**
```
┌────────────────────────────────────────────────────────┐
│ ⚙️ Low Stock Alert Settings                     [Save] │
├────────────────────────────────────────────────────────┤
│ Notification Methods:                                  │
│ [✓] In-app notification                                │
│ [✓] Email                                              │
│     Email to: [warehouse@company.com            ]     │
│ [✓] LINE Notify                                        │
│     LINE Token: [********************          ]      │
│                                                        │
│ Alert Triggers:                                        │
│ [✓] When stock falls below minimum                     │
│ [✓] Daily summary of low stock items                   │
│     Time: [09:00] AM                                   │
│ [ ] Weekly inventory report                            │
│                                                        │
│ Alert Recipients:                                      │
│ [✓] Warehouse Manager                                  │
│ [✓] Purchase Officer                                   │
│ [ ] Owner                                              │
│                                                        │
│ [Cancel]                                        [Save] │
└────────────────────────────────────────────────────────┘
```

#### 6.2.2 Alert Display

**In-App Notification:**
```
┌────────────────────────────────────────────────────────┐
│ 🔔 Notifications (3)                            [Clear]│
├────────────────────────────────────────────────────────┤
│ ⚠️ Low Stock Alert • 2 minutes ago                     │
│ LED Module P10 is below minimum stock                  │
│ Current: 25 pcs | Min: 50 pcs                         │
│ [View Material] [Create PO]                            │
├────────────────────────────────────────────────────────┤
│ ⚠️ Low Stock Alert • 1 hour ago                        │
│ LED Module P8 is approaching minimum                   │
│ Current: 52 pcs | Min: 50 pcs                         │
│ [View Material]                                        │
└────────────────────────────────────────────────────────┘
```

**Email Notification:**
```
Subject: 🚨 Low Stock Alert - 2 materials need reordering

Dear Warehouse Manager,

The following materials are below their minimum stock levels:

1. LED Module P10
   Current Stock: 25 pieces
   Minimum Stock: 50 pieces
   Suggested Order: 75 pieces (to reach max stock of 100)

2. LED Module P8
   Current Stock: 52 pieces  
   Minimum Stock: 50 pieces
   Status: Approaching minimum

Please review and create purchase orders as needed.

View Materials: https://app.craftflow.com/materials?filter=low_stock

---
This is an automated message from CraftFlow ERP
```

#### 6.2.3 Reorder Suggestions

**Smart Reorder:**
```typescript
function calculateReorderQuantity(material: Material): number {
  const { inStock, minStock, maxStock, leadTimeDays } = material;
  
  // Calculate average daily usage (from past 30 days)
  const avgDailyUsage = getAverageDailyUsage(material.id, 30);
  
  // Calculate safety stock (usage during lead time + buffer)
  const safetyStock = Math.ceil(avgDailyUsage * (leadTimeDays + 7));
  
  // Calculate order quantity to reach max stock
  const orderQty = maxStock - inStock + safetyStock;
  
  // Round up to supplier's minimum order quantity
  const supplierMinQty = material.supplierMinOrderQty || 1;
  const roundedQty = Math.ceil(orderQty / supplierMinQty) * supplierMinQty;
  
  return roundedQty;
}
```

**Reorder Suggestion UI:**
```
┌────────────────────────────────────────────────────────┐
│ 📊 Reorder Suggestion: LED Module P10                  │
├────────────────────────────────────────────────────────┤
│ Current Situation:                                     │
│ ├─ Current Stock: 25 pieces                            │
│ ├─ Minimum Stock: 50 pieces                            │
│ ├─ Maximum Stock: 500 pieces                           │
│ └─ Daily Usage (avg): 12 pieces                        │
│                                                        │
│ Analysis:                                              │
│ ├─ Days until stockout: ~2 days ⚠️                     │
│ ├─ Lead time: 7 days                                   │
│ └─ Safety stock needed: 168 pieces                     │
│                                                        │
│ 💡 Recommended Order:                                  │
│    175 pieces                                          │
│                                                        │
│ Result after delivery:                                 │
│ └─ New stock: 200 pieces (above minimum) 🟢            │
│                                                        │
│ [Adjust Quantity] [Create Purchase Order]              │
└────────────────────────────────────────────────────────┘
```

### 6.3 Feature: Auto Stock Deduction

**User Story:**
- AS an accountant
- I WANT materials to be deducted automatically when invoiced
- SO THAT stock levels are always accurate

**Functional Requirements:**

#### 6.3.1 Deduction Rules

**Configuration:**
```typescript
interface StockDeductionRule {
  trigger: 'on_invoice' | 'on_order' | 'on_completion' | 'manual';
  applyWasteFactor: boolean;
  allowNegativeStock: boolean;
  blockInvoiceIfInsufficient: boolean;
}

// Default settings
const defaultRule: StockDeductionRule = {
  trigger: 'on_invoice',
  applyWasteFactor: true,
  allowNegativeStock: false,
  blockInvoiceIfInsufficient: true
};
```

#### 6.3.2 Deduction Logic

**Auto-Deduct on Invoice:**
```typescript
async function deductMaterialsFromStock(order: Order) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    include: { product: { include: { materials: true } } }
  });
  
  for (const item of items) {
    // Get materials required for this product
    const materials = item.product.materials;
    
    for (const materialReq of materials) {
      const material = await prisma.material.findUnique({
        where: { id: materialReq.materialId }
      });
      
      // Calculate quantity needed
      const baseQty = calculateMaterialQuantity(
        item,
        materialReq.quantityFormula
      );
      
      // Apply waste factor
      const qtyWithWaste = baseQty * material.wasteFactor;
      
      // Check if sufficient stock
      if (material.inStock < qtyWithWaste && !allowNegativeStock) {
        throw new Error(
          `Insufficient stock for ${material.name}. ` +
          `Need: ${qtyWithWaste}, Available: ${material.inStock}`
        );
      }
      
      // Deduct from stock
      await prisma.material.update({
        where: { id: material.id },
        data: {
          inStock: { decrement: qtyWithWaste }
        }
      });
      
      // Log transaction
      await prisma.stockTransaction.create({
        data: {
          materialId: material.id,
          type: 'OUT',
          quantity: -qtyWithWaste,
          reference: order.orderNumber,
          notes: `Auto-deducted for order ${order.orderNumber}`
        }
      });
      
      // Check if now below minimum
      const updatedMaterial = await prisma.material.findUnique({
        where: { id: material.id }
      });
      
      if (updatedMaterial.inStock < updatedMaterial.minStock) {
        await triggerLowStockAlert(updatedMaterial);
      }
    }
  }
}
```

#### 6.3.3 Insufficient Stock Handling

**Warning Dialog:**
```
┌────────────────────────────────────────────────────────┐
│ ⚠️ Insufficient Stock                           [X]    │
├────────────────────────────────────────────────────────┤
│ Cannot create invoice. The following materials are     │
│ insufficient:                                          │
│                                                        │
│ 1. LED Module P10                                      │
│    Required: 75 pcs (with 15% waste)                  │
│    Available: 25 pcs                                   │
│    Short: 50 pcs                                       │
│                                                        │
│ 2. Aluminum Frame 2x3m                                 │
│    Required: 1.15 sets (with 15% waste)               │
│    Available: 0 sets                                   │
│    Short: 1.15 sets                                    │
│                                                        │
│ Options:                                               │
│ ( ) Block invoice creation (recommended)               │
│ ( ) Create invoice anyway (negative stock)             │
│ ( ) Create purchase order first                        │
│                                                        │
│ [Cancel]                              [Proceed Anyway] │
└────────────────────────────────────────────────────────┘
```

---

## 7. Backend Administration

### 7.1 Feature: Organization Settings

**User Story:**
- AS an admin
- I WANT to configure company information
- SO THAT it appears on documents

**Functional Requirements:**

#### 7.1.1 Company Profile

**Settings Form:**
```
┌────────────────────────────────────────────────────────┐
│ ⚙️ Organization Settings                        [Save] │
├────────────────────────────────────────────────────────┤
│ 📋 Basic Information                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Company Name (TH): [บริษัท ป้ายสวย จำกัด       ] │ │
│ │ Company Name (EN): [Signage Beautiful Co Ltd  ] │ │
│ │ Tax ID: [0123456789012]  Branch: [สำนักงานใหญ่] │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 📍 Address                                             │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [123 ถนนสุขุมวิท แขวงคลองเตย              ]       │ │
│ │ [เขตคลองเตย กรุงเทพมหานคร 10110            ]      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 📞 Contact                                             │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Phone: [02-123-4567]                               │ │
│ │ Mobile: [089-123-4567]                             │ │
│ │ Email: [info@signagebeautiful.com]                │ │
│ │ Website: [www.signagebeautiful.com]               │ │
│ │ LINE OA: [@signagebeautiful]                      │ │
│ │ Facebook: [facebook.com/signagebeautiful]         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 🏦 Bank Accounts                        [+ Add Account]│
│ ┌────────────────────────────────────────────────────┐ │
│ │ ธนาคารกสิกรไทย • 123-4-56789-0                    │ │
│ │ บริษัท ป้ายสวย จำกัด                              │ │
│ │ [Default] [Edit] [Delete]                          │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ ธนาคารไทยพาณิชย์ • 987-6-54321-0                  │ │
│ │ บริษัท ป้ายสวย จำกัด                              │ │
│ │ [Edit] [Delete]                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 🖼️ Branding                                            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Company Logo:                                      │ │
│ │ ┌──────────┐                                       │ │
│ │ │ [Logo]   │  [Change Logo]                        │ │
│ │ └──────────┘                                       │ │
│ │ Recommended: PNG, square, min 500x500px            │ │
│ │                                                    │ │
│ │ Digital Signature:                                 │ │
│ │ ┌──────────┐                                       │ │
│ │ │[Signature]│ [Upload Signature]                   │ │
│ │ └──────────┘                                       │ │
│ │ For PDF documents                                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Cancel]                                        [Save] │
└────────────────────────────────────────────────────────┘
```

#### 7.1.2 Payment Account Management

**Add Bank Account:**
```
┌────────────────────────────────────────────────────────┐
│ Add Bank Account                                [X]    │
├────────────────────────────────────────────────────────┤
│ Account Type:                                          │
│ (•) Company Account                                    │
│ ( ) Personal Account (Owner)                           │
│                                                        │
│ Bank: [ธนาคารกสิกรไทย                          ▼]     │
│                                                        │
│ Account Number: [123-4-56789-0]                        │
│                                                        │
│ Account Name: [บริษัท ป้ายสวย จำกัด            ]     │
│                                                        │
│ Branch: [สาขาสุขุมวิท                          ]     │
│                                                        │
│ [✓] Set as default account                             │
│ [✓] Show QR PromptPay on documents                     │
│                                                        │
│ PromptPay ID:                                          │
│ (•) Use Tax ID (0123456789012)                         │
│ ( ) Use Phone Number                                   │
│ ( ) Use e-Wallet ID                                    │
│                                                        │
│ [Cancel]                                        [Save] │
└────────────────────────────────────────────────────────┘
```

### 7.2 Feature: User Management

**User Story:**
- AS an owner
- I WANT to manage user accounts and permissions
- SO THAT I can control who accesses what

**Functional Requirements:**

#### 7.2.1 User List

**User Management Dashboard:**
```
┌──────────────────────────────────────────────────────────┐
│ 👥 Users (8)                          [+ Invite User]    │
├──────────────────────────────────────────────────────────┤
│ Filters: [All ▼] [Role ▼] [Active Only ✓]               │
├──────────────────────────────────────────────────────────┤
│ Name          │Role          │Status│Last Active│Actions│
├───────────────┼──────────────┼──────┼───────────┼───────┤
│ 👑 คุณสมชาย   │Owner         │🟢 Active│Just now│[Edit] │
│ somchai@...   │All access    │      │           │       │
├───────────────┼──────────────┼──────┼───────────┼───────┤
│ 💼 พนักงานขาย A│Sales Manager│🟢 Active│5 min ago│[Edit] │
│ sales-a@...   │Sales + View  │      │           │[Block]│
├───────────────┼──────────────┼──────┼───────────┼───────┤
│ 💼 พนักงานขาย B│Sales Staff  │🟢 Active│1 hr ago │[Edit] │
│ sales-b@...   │Sales only    │      │           │[Block]│
├───────────────┼──────────────┼──────┼───────────┼───────┤
│ 🔨 ช่างสมชาย  │Production   │🟢 Active│2 hrs ago│[Edit] │
│ worker1@...   │Own jobs      │      │           │[Block]│
├───────────────┼──────────────┼──────┼───────────┼───────┤
│ 💰 บัญชี      │Accountant    │🟢 Active│Today    │[Edit] │
│ accounting@.. │Financial     │      │           │[Block]│
├───────────────┼──────────────┼──────┼───────────┼───────┤
│ 📦 คลังวัสดุ  │Warehouse Mgr │🟡 Away │Yesterday│[Edit] │
│ warehouse@... │Inventory     │      │           │[Block]│
└───────────────┴──────────────┴──────┴───────────┴───────┘
```

#### 7.2.2 Role-Based Access Control

**Pre-defined Roles:**
```typescript
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description: string;
}

const roles: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full system access',
    permissions: ['*']  // All permissions
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Manage sales team and approve quotations',
    permissions: [
      'customers.*',
      'quotations.*',
      'orders.view',
      'invoices.view',
      'reports.view',
      'quotations.approve'
    ]
  },
  {
    id: 'sales_staff',
    name: 'Sales Staff',
    description: 'Create quotations and manage customers',
    permissions: [
      'customers.*',
      'quotations.create',
      'quotations.edit_own',
      'quotations.view',
      'orders.view_own',
      'invoices.view_own'
    ]
  },
  {
    id: 'production_manager',
    name: 'Production Manager',
    description: 'Manage production and quality',
    permissions: [
      'orders.*',
      'materials.*',
      'kanban.*',
      'quality_control.*'
    ]
  },
  {
    id: 'production_staff',
    name: 'Production Staff',
    description: 'Update assigned jobs',
    permissions: [
      'orders.view_assigned',
      'orders.update_status',
      'orders.upload_photos',
      'materials.view'
    ]
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Manage invoices and payments',
    permissions: [
      'invoices.*',
      'payments.*',
      'receipts.*',
      'reports.financial',
      'customers.view'
    ]
  },
  {
    id: 'warehouse',
    name: 'Warehouse Manager',
    description: 'Manage inventory',
    permissions: [
      'materials.*',
      'stock.*',
      'purchase_orders.*',
      'orders.view'
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      '*.view'
    ]
  }
];
```

**Permission Matrix:**
```
┌────────────────────────────────────────────────────────┐
│ 🔐 Permission Matrix                                   │
├────────────────────────────────────────────────────────┤
│ Feature      │Owner│Sales│Sales│Prod │Prod │Acct│View│
│              │     │ Mgr │Staff│ Mgr │Staff│    │    │
├──────────────┼─────┼─────┼─────┼─────┼─────┼────┼────┤
│Customers     │ ✓✓✓ │ ✓✓✓ │ ✓✓✓ │  👁️ │  👁️ │ 👁️│ 👁️│
│Quotations    │ ✓✓✓ │ ✓✓✓ │ ✓✓  │  👁️ │  👁️ │ 👁️│ 👁️│
│Orders/Kanban │ ✓✓✓ │  👁️ │  👁️ │ ✓✓✓ │ ✓   │ 👁️│ 👁️│
│Invoices      │ ✓✓✓ │  👁️ │  👁️ │     │     │✓✓✓ │ 👁️│
│Payments      │ ✓✓✓ │     │     │     │     │✓✓✓ │ 👁️│
│Materials     │ ✓✓✓ │     │     │ ✓✓✓ │  👁️ │    │ 👁️│
│Settings      │ ✓✓✓ │     │     │     │     │    │    │
│Reports       │ ✓✓✓ │  👁️ │  👁️ │  👁️ │     │✓✓✓ │ 👁️│
│Users         │ ✓✓✓ │     │     │     │     │    │    │
└──────────────┴─────┴─────┴─────┴─────┴─────┴────┴────┘

Legend: ✓✓✓ = Full access  ✓✓ = Edit own  ✓ = Limited  👁️ = View
```

#### 7.2.3 Invite User

**Invitation Form:**
```
┌────────────────────────────────────────────────────────┐
│ Invite New User                                 [X]    │
├────────────────────────────────────────────────────────┤
│ Email: [newuser@company.com                     ]     │
│                                                        │
│ Full Name: [พนักงานใหม่                         ]     │
│                                                        │
│ Role: [Sales Staff                              ▼]    │
│                                                        │
│ Permissions:                                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ✓ Create and edit quotations                      │ │
│ │ ✓ Manage customers                                │ │
│ │ ✓ View own orders and invoices                    │ │
│ │ ✗ View all financial data                         │ │
│ │ ✗ Approve quotations                              │ │
│ │ ✗ Access settings                                 │ │
│ │                                                    │ │
│ │ [View Full Permissions]                            │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ Send Invitation:                                       │
│ [✓] Send email invitation                              │
│ [✓] Include setup instructions                         │
│                                                        │
│ [Cancel]                          [Send Invitation]    │
└────────────────────────────────────────────────────────┘
```

**Invitation Email:**
```
Subject: You've been invited to CraftFlow

Hello พนักงานใหม่,

คุณสมชาย has invited you to join their team on CraftFlow ERP.

Role: Sales Staff

To accept this invitation and create your account:

1. Click the link below:
   https://app.craftflow.com/invite/abc123...

2. Set up your password

3. Start using the system!

This invitation link expires in 7 days.

If you have any questions, contact: somchai@company.com

---
CraftFlow ERP
```

#### 7.2.4 User Activity Log

**Activity Tracking:**
```
┌──────────────────────────────────────────────────────────┐
│ Activity Log: พนักงานขาย A                    [Export]   │
├──────────────────────────────────────────────────────────┤
│ Filter: [Last 7 days ▼] [All activities ▼]              │
├──────────────────────────────────────────────────────────┤
│ Today 14:35       │ Created quotation QT-202503-0043     │
│ Today 14:20       │ Updated customer "คุณมานี"           │
│ Today 10:15       │ Viewed order OR-202503-0042          │
│ Today 09:00       │ Logged in (IP: 203.xx.xx.xx)         │
│                                                          │
│ Yesterday 16:45   │ Created quotation QT-202503-0042     │
│ Yesterday 15:30   │ Uploaded design file to OR-0040      │
│ Yesterday 14:20   │ Created customer "คุณสมพร"           │
│ Yesterday 09:15   │ Logged in (IP: 203.xx.xx.xx)         │
│                                              [Load More...]│
└──────────────────────────────────────────────────────────┘
```

### 7.3 Feature: Approval Workflows

**User Story:**
- AS an owner
- I WANT to set up approval workflows
- SO THAT I can control important decisions

**Functional Requirements:**

#### 7.3.1 Workflow Configuration

**Approval Rules Setup:**
```
┌────────────────────────────────────────────────────────┐
│ ⚙️ Approval Workflows                          [+ Add] │
├────────────────────────────────────────────────────────┤
│ 📝 Quotations                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [✓] Require approval for:                          │ │
│ │     [✓] Discount > 10%                             │ │
│ │     [✓] Total amount > 500,000฿                    │ │
│ │     [✓] Profit margin < 20%                        │ │
│ │                                                    │ │
│ │ Approvers: [Sales Manager ▼] [Add]                │ │
│ │ - คุณสมชาย (Sales Manager)                         │ │
│ │ - คุณสมหญิง (Owner)                                │ │
│ │                                                    │ │
│ │ Approval Type: (•) Any approver ( ) All approvers │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 💰 Invoices                                            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [✓] Require approval for:                          │ │
│ │     [✓] Amount > 1,000,000฿                        │ │
│ │     [ ] Tax invoices                               │ │
│ │                                                    │ │
│ │ Approvers: [Owner ▼] [Add]                         │ │
│ │ - คุณสมชาย (Owner)                                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 📦 Purchase Orders                                     │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [✓] Require approval for:                          │ │
│ │     [✓] Amount > 100,000฿                          │ │
│ │                                                    │ │
│ │ Approvers: [Production Manager ▼] [Add]           │ │
│ │ - คุณมานะ (Production Manager)                     │ │
│ │ - คุณสมชาย (Owner)                                 │ │
│ │                                                    │ │
│ │ Approval Type: ( ) Any approver (•) All approvers │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Cancel]                                        [Save] │
└────────────────────────────────────────────────────────┘
```

#### 7.3.2 Custom Approval Rules

**Advanced Rule Builder:**
```
┌────────────────────────────────────────────────────────┐
│ Create Approval Rule                            [X]    │
├────────────────────────────────────────────────────────┤
│ Rule Name: [Large LED Sign Orders              ]      │
│                                                        │
│ Apply to: [Quotations                           ▼]    │
│                                                        │
│ Conditions (All must be true):                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 1. [Product Category  ▼] [contains ▼] [LED    ]   │ │
│ │ 2. [Total Amount      ▼] [greater than ▼] [300000]│ │
│ │ 3. [Size (sqm)        ▼] [greater than ▼] [10   ] │ │
│ │                                                    │ │
│ │ [+ Add Condition]                                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ Approvers:                                             │
│ 1st Level: [Production Manager ▼] [Add]               │
│ - Must verify technical feasibility                    │
│                                                        │
│ 2nd Level: [Owner ▼] [Add]                             │
│ - Final business decision                              │
│                                                        │
│ Approval Type: (•) Sequential ( ) Parallel             │
│                                                        │
│ Notification:                                          │
│ [✓] Email approvers immediately                        │
│ [✓] Send reminder after 24 hours                       │
│ [✓] Escalate to owner after 48 hours                   │
│                                                        │
│ [Cancel]                                        [Save] │
└────────────────────────────────────────────────────────┘
```

---

## 8. Modern Competitive Features

### 8.1 Feature: Real-time Collaboration

**User Story:**
- AS a team member
- I WANT to see what others are working on
- SO THAT we can coordinate better

**Functional Requirements:**

#### 8.1.1 Presence Indicators

**Show who's viewing/editing:**
```
┌────────────────────────────────────────────────────────┐
│ Quotation: QT-202503-0042                              │
│ 👁️ พนักงานขาย A is viewing this • Just now            │
│ ✏️ คุณสมชาย is editing customer info • 2 min ago      │
├────────────────────────────────────────────────────────┤
│ ...quotation content...                                │
└────────────────────────────────────────────────────────┘
```

**Active Users List:**
```
┌────────────────────────────────────────┐
│ 👥 Active Now (4)                      │
├────────────────────────────────────────┤
│ 🟢 คุณสมชาย (You)                     │
│    Editing QT-202503-0042              │
├────────────────────────────────────────┤
│ 🟢 พนักงานขาย A                       │
│    Viewing OR-202503-0040              │
├────────────────────────────────────────┤
│ 🟢 ช่างสมชาย                          │
│    Updating OR-202503-0038             │
├────────────────────────────────────────┤
│ 🟡 บัญชี (Away 5m)                    │
│    Last seen: Invoice page             │
└────────────────────────────────────────┘
```

#### 8.1.2 Internal Comments

**Comment System:**
```
┌────────────────────────────────────────────────────────┐
│ 💬 Comments (3)                         [Add Comment]  │
├────────────────────────────────────────────────────────┤
│ พนักงานขาย A • 2 hours ago                             │
│ @คุณสมชาย ลูกค้าถามว่าติดตั้งได้ภายใน 10 วันไหม?     │
│ [Reply]                                                │
│   ├─ คุณสมชาย • 1 hour ago                            │
│   │  @พนักงานขาย A ได้ครับ แต่ต้องมัดจำก่อน           │
│   │  [Reply]                                           │
│   └─ พนักงานขาย A • 30 min ago                        │
│      ได้เลยครับ จะแจ้งลูกค้า                           │
├────────────────────────────────────────────────────────┤
│ ช่างสมชาย • Yesterday                                 │
│ วัสดุ LED module ยังไม่มาครับ จะผลิตได้ก็ต่อเมื่อได้   │
│ รับของแล้ว                                             │
│ [Reply]                                                │
└────────────────────────────────────────────────────────┘
```

**@Mentions:**
- Tag users with @username
- Get notified when mentioned
- See all mentions in notification center

### 8.2 Feature: Customer Portal (Future)

**User Story:**
- AS a customer
- I WANT to check my order status online
- SO THAT I don't need to call the office

**Functional Requirements:**

#### 8.2.1 Customer Login

**Simple Authentication:**
- Login with phone number + OTP
- Or link LINE account
- No password needed

**Customer Dashboard:**
```
┌────────────────────────────────────────────────────────┐
│ 👋 สวัสดี คุณสมชาย                         [Logout]    │
├────────────────────────────────────────────────────────┤
│ 📊 My Orders (3 active)                                │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ OR-202503-0042 • ป้าย LED 2×3m                    │ │
│ │ Status: 🔵 กำลังผลิต (80% complete)                │ │
│ │ Expected: 15/03/2025 (9 days)                      │ │
│ │ [View Details] [Contact Support]                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ OR-202502-0038 • ป้ายอะคริลิค                     │ │
│ │ Status: 🚚 กำลังติดตั้ง                             │ │
│ │ Expected: Today 14:00                              │ │
│ │ [View Details] [Track Installation]                │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ 💰 Outstanding Balance: 185,000 บาท                   │
│ [View Invoices] [Make Payment]                         │
└────────────────────────────────────────────────────────┘
```

#### 8.2.2 Order Tracking

**Live Status Updates:**
```
┌────────────────────────────────────────────────────────┐
│ Order Details: OR-202503-0042                          │
├────────────────────────────────────────────────────────┤
│ 📍 Progress Timeline                                   │
│                                                        │
│ ✅ Order Confirmed         05/03/2025 10:30            │
│    Your order has been confirmed                       │
│                                                        │
│ ✅ Production Started      05/03/2025 14:00            │
│    Our team is working on your order                   │
│                                                        │
│ 🔵 In Production           06/03/2025 (Current)        │
│    80% complete                                        │
│    📸 Latest Progress Photo:                           │
│    [Photo showing 80% completed sign]                  │
│                                                        │
│ ⏳ Quality Check           Expected: 10/03/2025        │
│                                                        │
│ ⏳ Installation            Expected: 15/03/2025        │
│    Installation team will contact you 1 day before     │
└────────────────────────────────────────────────────────┘
```

### 8.3 Feature: WhatsApp Integration

**User Story:**
- AS a customer
- I WANT to contact via WhatsApp
- SO THAT I can use my preferred messaging app

**Similar to LINE integration but for WhatsApp:**
- WhatsApp Business API
- Auto-responses
- Unified inbox
- Template messages

### 8.4 Feature: Analytics Dashboard

**User Story:**
- AS a business owner
- I WANT to see business metrics
- SO THAT I can make data-driven decisions

**Functional Requirements:**

#### 8.4.1 Executive Dashboard

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Business Dashboard                  [Custom Range ▼] │
├──────────────────────────────────────────────────────────┤
│ Period: March 2025 (MTD)                                 │
├─────────────────────┬──────────────────┬─────────────────┤
│ 💰 Revenue          │ 📈 Growth        │ 📦 Orders       │
│ 2,450,000฿         │ +15.2%          │ 45              │
│ vs. last month      │ vs. last month   │ +8 from Feb     │
├─────────────────────┼──────────────────┼─────────────────┤
│ 💸 Outstanding      │ 💹 Profit        │ ⏱️ Avg Delivery │
│ 385,000฿           │ 735,000฿        │ 12 days         │
│ from 5 customers    │ 30% margin       │ -2 days         │
└─────────────────────┴──────────────────┴─────────────────┘

📈 Revenue Trend (Last 6 Months)
[Line chart showing monthly revenue]

🏆 Top 5 Products by Revenue
1. ป้าย LED          850,000฿ (35%)
2. ป้ายอะคริลิค      420,000฿ (17%)
3. สติ๊กเกอร์         285,000฿ (12%)
4. ป้ายไฟ            195,000฿ (8%)
5. ป้ายไวนิล          180,000฿ (7%)

👥 Top 5 Customers by Revenue
1. คุณสมชาย          385,000฿ (16%)
2. บริษัท ABC        245,000฿ (10%)
3. คุณสมหญิง         180,000฿ (7%)
4. ร้าน XYZ          155,000฿ (6%)
5. คุณมานะ           142,000฿ (6%)

⚠️ Alerts & Action Items
• 2 materials below minimum stock
• 3 overdue invoices (> 90 days)
• 5 orders approaching deadline
• 4 quotations pending approval
```

### 8.5 Feature: Mobile App (Future Phase)

**iOS/Android Native Apps:**
- Push notifications
- Offline mode for field workers
- Camera integration for photos
- QR code scanner
- GPS tracking for installations

### 8.6 Feature: API & Integrations

**Public API for third-party integrations:**
- RESTful API
- Webhook support
- OAuth 2.0 authentication
- Rate limiting
- API documentation

**Pre-built Integrations:**
- Accounting software (QuickBooks, Xero)
- Payment gateways (2C2P, Omise, PromptPay)
- Shipping providers
- Email marketing (Mailchimp)
- Google Workspace
- Microsoft 365

---

## 9. Universal File Attachment System

> **🎯 Key Differentiator:** FlowAccount ไม่มีระบบแนบไฟล์ยืดหยุ่น - นี่คือ Painpoint หลัก!

### 9.1 Feature Overview

**User Story:**
- AS a sales/production staff
- I WANT to attach multiple files to quotations, orders, and invoices
- SO THAT customers can see portfolio, product samples, and references

**What Makes This Different:**
- ✅ แนบไฟล์ได้**ทุกเอกสาร** (Quotation, Order, Invoice, Receipt)
- ✅ แนบ**ไฟล์ผลงาน** (portfolio/past projects)
- ✅ แนบ**ตัวอย่างสินค้า** (product samples/mockups)
- ✅ แนบ**ไฟล์อ้างอิง** (inspiration images)
- ✅ **Version control** - เก็บประวัติการเปลี่ยนแปลง

**FlowAccount's Limitation:**
- ❌ แนบไฟล์ไม่ได้ หรือจำกัดมาก
- ❌ ไม่สามารถแสดงผลงานให้ลูกค้าดู
- ❌ ต้องส่งไฟล์ทาง email แยก

### 9.2 Database Schema

```typescript
interface Attachment {
  id: string;
  organizationId: string;
  
  // Polymorphic relationship - แนบได้ทุก entity
  attachableType: 'quotation' | 'order' | 'invoice' | 'receipt' | 'customer' | 'product';
  attachableId: string;
  
  // File info
  fileName: string;
  fileUrl: string;
  fileType: string;           // MIME type
  fileSize: number;           // bytes
  thumbnailUrl?: string;      // for images/PDFs
  
  // Categorization
  category: 'design' | 'portfolio' | 'sample' | 'reference' | 'proof' | 'other';
  tags: string[];             // ['logo', 'outdoor', '2024']
  
  // Metadata
  title?: string;             // Display name
  description?: string;       // Notes about this file
  displayOrder: number;       // For sorting
  
  // Version control
  version: number;            // v1, v2, v3
  replacesFileId?: string;    // If this replaces an older file
  
  // Permissions
  isPublic: boolean;          // Can customer see this?
  uploadedBy: string;         // User ID
  
  // Timestamps
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**SQL Migration:**

```sql
CREATE TABLE Attachment (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  organizationId TEXT NOT NULL REFERENCES Organization(id),
  
  -- Polymorphic relationship
  attachableType TEXT NOT NULL,
  attachableId TEXT NOT NULL,
  
  -- File details
  fileName TEXT NOT NULL,
  fileUrl TEXT NOT NULL,
  fileType TEXT NOT NULL,
  fileSize BIGINT NOT NULL,
  thumbnailUrl TEXT,
  
  -- Categorization
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata  
  title TEXT,
  description TEXT,
  displayOrder INTEGER DEFAULT 0,
  
  -- Version control
  version INTEGER DEFAULT 1,
  replacesFileId TEXT REFERENCES Attachment(id),
  
  -- Permissions
  isPublic BOOLEAN DEFAULT FALSE,
  uploadedBy UUID REFERENCES profiles(id),
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CHECK (attachableType IN ('quotation', 'order', 'invoice', 'receipt', 'customer', 'product')),
  CHECK (category IN ('design', 'portfolio', 'sample', 'reference', 'proof', 'other'))
);

-- Index for polymorphic queries
CREATE INDEX idx_attachment_attachable ON Attachment(attachableType, attachableId);
CREATE INDEX idx_attachment_category ON Attachment(category);
CREATE INDEX idx_attachment_organization ON Attachment(organizationId);
```

### 9.3 UI/UX Design

#### 9.3.1 File Upload Component

```tsx
<FileAttachmentZone
  entityType="quotation"
  entityId="qt_001"
  maxFiles={20}
  maxSizePerFile={50 * 1024 * 1024}  // 50MB
  allowedTypes={[
    'image/*',
    'application/pdf',
    '.ai', '.psd', '.sketch', '.fig',  // Design files
    '.dwg', '.dxf'  // CAD files
  ]}
  categories={[
    { value: 'portfolio', label: 'ผลงานที่ผ่านมา', icon: '🏆' },
    { value: 'sample', label: 'ตัวอย่างสินค้า', icon: '📦' },
    { value: 'reference', label: 'ภาพอ้างอิง', icon: '🖼️' },
    { value: 'design', label: 'ไฟล์ออกแบบ', icon: '🎨' }
  ]}
>
  <div className="dropzone">
    <Upload size={48} />
    <p>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด</p>
    <p className="text-sm text-gray-500">
      รองรับ: รูปภาพ, PDF, AI, PSD, DWG (สูงสุด 50MB)
    </p>
  </div>
</FileAttachmentZone>
```

#### 9.3.2 File Gallery Display

```
┌──────────────────────────────────────────────────────────┐
│ 📎 ไฟล์แนบ (8)                    [+ อัปโหลด] [จัดการ]│
├──────────────────────────────────────────────────────────┤
│ 🏆 ผลงานที่ผ่านมา (3)                                   │
│ ┌──────┐ ┌──────┐ ┌──────┐                             │
│ │[IMG] │ │[IMG] │ │[IMG] │                             │
│ │ LED  │ │Acryl │ │Vinyl │                             │
│ │ 2MB  │ │ 1.5MB│ │ 3MB  │                             │
│ └──────┘ └──────┘ └──────┘                             │
│                                                          │
│ 📦 ตัวอย่างสินค้า (2)                                   │
│ ┌──────┐ ┌──────┐                                       │
│ │[IMG] │ │[PDF] │                                       │
│ │Mock  │ │Spec  │                                       │
│ │ 5MB  │ │ 2MB  │                                       │
│ └──────┘ └──────┘                                       │
│                                                          │
│ 🎨 ไฟล์ออกแบบ (3)                                       │
│ ┌──────┐ ┌──────┐ ┌──────┐                             │
│ │[AI]  │ │[PSD] │ │[DWG] │                             │
│ │ 12MB │ │ 25MB │ │ 8MB  │                             │
│ └──────┘ └──────┘ └──────┘                             │
└──────────────────────────────────────────────────────────┘
```

#### 9.3.3 Inline Display in Documents

**In Quotation PDF:**

```
┌─────────────────────────────────────────────────────────┐
│ ใบเสนอราคา QT-202503-0042                              │
│ ...                                                     │
│                                                         │
│ 📎 ไฟล์แนบเพื่อประกอบการพิจารณา:                      │
│                                                         │
│ 🏆 ผลงานที่ผ่านมา:                                     │
│    • ป้าย LED ขนาดใหญ่ - โครงการ ABC (portfolio_1.jpg)│
│    • ป้ายอะคริลิค - โครงการ XYZ (portfolio_2.jpg)     │
│                                                         │
│ 📦 ตัวอย่างสินค้า:                                     │
│    • Mockup ป้าย LED (mockup_v2.pdf)                   │
│                                                         │
│ 💡 สแกน QR Code เพื่อดูไฟล์แนบทั้งหมด:                │
│    [QR Code → https://app.com/qt/qt_001/files]        │
└─────────────────────────────────────────────────────────┘
```

### 9.4 Key Features

#### 9.4.1 Portfolio Management

**Use Case:** แสดงผลงานที่เคยทำให้ลูกค้าดู

```typescript
// เมื่อสร้าง quotation
async function attachPortfolio(quotationId: string) {
  // Get relevant portfolio based on product type
  const portfolios = await prisma.attachment.findMany({
    where: {
      organizationId: currentOrg.id,
      category: 'portfolio',
      tags: {
        hasSome: ['LED', 'large_format']  // Match product type
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  // Attach to quotation
  for (const portfolio of portfolios) {
    await prisma.attachment.create({
      data: {
        ...portfolio,
        id: undefined,  // New ID
        attachableType: 'quotation',
        attachableId: quotationId,
        isPublic: true  // Customer can see
      }
    });
  }
}
```

#### 9.4.2 Product Sample Library

**Pre-upload samples** for quick attachment:

```
┌────────────────────────────────────────────────────────┐
│ 📚 คลังตัวอย่างสินค้า                    [+ เพิ่ม]   │
├────────────────────────────────────────────────────────┤
│ ป้าย LED                                              │
│ ├─ P10 Standard (3 files)                             │
│ ├─ P8 Premium (5 files)                               │
│ └─ P16 Budget (2 files)                               │
│                                                        │
│ ป้ายอะคริลิค                                          │
│ ├─ 3mm ใส (4 files)                                   │
│ ├─ 5mm สี (3 files)                                   │
│ └─ 8mm หนา (2 files)                                  │
│                                                        │
│ Quick Attach:                                          │
│ [Drag files here] or [Click to attach]                │
└────────────────────────────────────────────────────────┘
```

#### 9.4.3 Customer File Sharing

**Public link for customers:**

```
https://app.craftflow.com/share/qt_001/files?token=abc123

Customer sees:
┌────────────────────────────────────────────────────────┐
│ 📎 ไฟล์แนบจากบริษัท XYZ                               │
│ ใบเสนอราคา QT-202503-0042                             │
├────────────────────────────────────────────────────────┤
│ ผลงานที่ผ่านมา:                                       │
│ [📷 View] LED_Project_ABC.jpg (2MB)                   │
│ [📷 View] Acrylic_Project_XYZ.jpg (1.5MB)            │
│                                                        │
│ ตัวอย่างสินค้า:                                       │
│ [📄 View] Mockup_Design_v2.pdf (5MB)                  │
│                                                        │
│ [⬇️ ดาวน์โหลดทั้งหมด (8.5MB)]                         │
└────────────────────────────────────────────────────────┘
```

### 9.5 Storage Strategy

**Supabase Storage Buckets:**

```typescript
const BUCKETS = {
  'quotation-files': {
    public: true,
    maxSize: 50 * 1024 * 1024,  // 50MB
    allowedMimeTypes: ['image/*', 'application/pdf', '.ai', '.psd']
  },
  'order-files': {
    public: false,  // Internal only
    maxSize: 100 * 1024 * 1024  // 100MB for CAD files
  },
  'portfolio': {
    public: true,
    maxSize: 20 * 1024 * 1024,
    allowedMimeTypes: ['image/*', 'application/pdf']
  }
};

// Upload with auto-thumbnail generation
async function uploadWithThumbnail(file: File, bucket: string) {
  const path = `${organizationId}/${Date.now()}-${file.name}`;
  
  // Upload original
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  
  if (error) throw error;
  
  // Generate thumbnail for images
  let thumbnailUrl;
  if (file.type.startsWith('image/')) {
    thumbnailUrl = await generateThumbnail(file);
  }
  
  return { fileUrl: data.path, thumbnailUrl };
}
```

---

## 10. Location Management & Google Maps

> **🎯 Key Feature:** ช่วยทีมติดตั้งและ logistics โดยไม่เสียค่า Google Maps API

### 10.1 Feature Overview

**User Story:**
- AS a sales/installation staff
- I WANT to save customer locations and share them easily
- SO THAT installation team and riders can navigate correctly

**What Makes This Cost-Effective:**
- ✅ **ไม่ใช้ Google Maps API** (แพง $200+/month)
- ✅ ใช้ **Google Maps URL** แทน (ฟรี!)
- ✅ แสดงแผนที่ใน UI ผ่าน **Static Maps** หรือ **Embed (free tier)**
- ✅ แชร์ location ผ่าน LINE/SMS ได้ทันที

### 10.2 Database Schema

```typescript
interface CustomerLocation {
  id: string;
  customerId: string;
  
  // Address components
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;      // ตำบล/แขวง
  district: string;         // อำเภอ/เขต
  province: string;         // จังหวัด
  postalCode: string;       // รหัสไปรษณีย์
  
  // Geo coordinates
  latitude?: number;        // ละติจูด
  longitude?: number;       // ลองจิจูด
  
  // Google Maps Integration (NO API COST!)
  googleMapsUrl?: string;   // https://maps.google.com/?q=13.7563,100.5018
  googlePlaceId?: string;   // Optional - for precise location
  
  // Installation details
  locationType: 'outdoor' | 'indoor' | 'rooftop' | 'storefront';
  accessNotes?: string;     // "ใช้ประตูด้านหลัง, มีหมา"
  parkingInfo?: string;     // "จอดรถได้หน้าร้าน"
  contactOnsite?: string;   // "นายสมชาย 089-xxx-xxxx"
  
  // Photos
  sitePhotoUrls: string[];  // รูปหน้าโครงการ
  
  // Metadata
  isDefault: boolean;       // Primary location
  label?: string;           // "สำนักงานใหญ่", "โรงงาน", "สาขา 2"
  
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**SQL Migration:**

```sql
CREATE TABLE CustomerLocation (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  customerId TEXT NOT NULL REFERENCES Customer(id) ON DELETE CASCADE,
  
  -- Address
  addressLine1 TEXT NOT NULL,
  addressLine2 TEXT,
  subdistrict TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  postalCode TEXT NOT NULL,
  
  -- Coordinates
  latitude NUMERIC(10, 8),    -- 13.7563309
  longitude NUMERIC(11, 8),   -- 100.5017651
  
  -- Google Maps (FREE!)
  googleMapsUrl TEXT,
  googlePlaceId TEXT,
  
  -- Installation details
  locationType TEXT DEFAULT 'storefront',
  accessNotes TEXT,
  parkingInfo TEXT,
  contactOnsite TEXT,
  
  -- Photos
  sitePhotoUrls TEXT[] DEFAULT '{}',
  
  -- Metadata
  isDefault BOOLEAN DEFAULT FALSE,
  label TEXT,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  CHECK (locationType IN ('outdoor', 'indoor', 'rooftop', 'storefront'))
);

-- Index
CREATE INDEX idx_location_customer ON CustomerLocation(customerId);
CREATE INDEX idx_location_coords ON CustomerLocation(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Only one default location per customer
CREATE UNIQUE INDEX idx_location_default 
  ON CustomerLocation(customerId) 
  WHERE isDefault = TRUE;
```

### 10.3 UI/UX Design

#### 10.3.1 Location Input Form

```tsx
<LocationForm customerId="cust_001">
  {/* Address */}
  <AddressInput
    addressLine1="123 ถนนสุขุมวิท"
    subdistrict="คลองเตย"
    district="คลองเตย"
    province="กรุงเทพมหานคร"
    postalCode="10110"
  />
  
  {/* Map Picker */}
  <MapPicker
    onLocationSelect={(lat, lng) => {
      // Generate Google Maps URL (FREE!)
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      setLocation({ latitude: lat, longitude: lng, googleMapsUrl: mapsUrl });
    }}
  >
    {/* Display map using Leaflet (free) or Google Maps Embed (free tier) */}
    <div className="map-container">
      <iframe
        width="100%"
        height="300"
        frameBorder="0"
        src={`https://www.google.com/maps?q=${lat},${lng}&output=embed`}
      />
      <button onClick={openGoogleMaps}>
        📍 เปิดใน Google Maps
      </button>
    </div>
  </MapPicker>
  
  {/* Installation Details */}
  <InstallationDetails
    locationType="outdoor"
    accessNotes="ใช้ประตูด้านหลัง มีที่จอดรถ"
    contactOnsite="นายสมชาย 089-xxx-xxxx"
  />
</LocationForm>
```

#### 10.3.2 Location Display Card

```
┌────────────────────────────────────────────────────────┐
│ 📍 ที่อยู่ติดตั้ง                     [แก้ไข] [แชร์] │
├────────────────────────────────────────────────────────┤
│ 🏢 สำนักงานใหญ่ (ค่าเริ่มต้น)                        │
│                                                        │
│ 123 ถนนสุขุมวิท แขวงคลองเตย                           │
│ เขตคลองเตย กรุงเทพมหานคร 10110                        │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │                                                  │   │
│ │          [Google Maps Preview]                   │   │
│ │                                                  │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ [📍 เปิดใน Google Maps] [🧭 Navigate] [📤 แชร์]      │
│                                                        │
│ ℹ️ รายละเอียดเพิ่มเติม:                               │
│ • ประเภท: ติดตั้งกลางแจ้ง (Outdoor)                  │
│ • ที่จอดรถ: จอดหน้าร้านได้                            │
│ • ผู้ติดต่อ: นายสมชาย 089-xxx-xxxx                   │
│ • หมายเหตุ: ใช้ประตูด้านหลัง มีหมา                   │
└────────────────────────────────────────────────────────┘
```

### 10.4 Google Maps Integration (FREE!)

#### 10.4.1 Generate Maps URL (No API needed!)

```typescript
// Method 1: Simple coordinate link
function generateGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// Method 2: With address search
function generateGoogleMapsSearchUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

// Method 3: Navigation mode
function generateNavigationUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Usage
const location = {
  latitude: 13.7563309,
  longitude: 100.5017651,
  address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
};

// Open in Google Maps app or browser
window.open(generateGoogleMapsUrl(location.latitude, location.longitude));
```

#### 10.4.2 Embed Map (Free Tier - No API Key!)

```tsx
<iframe
  width="600"
  height="450"
  style={{ border: 0 }}
  loading="lazy"
  allowFullScreen
  referrerPolicy="no-referrer-when-downgrade"
  src={`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`}
/>

// Or use place ID
<iframe
  src={`https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d...`}
/>
```

#### 10.4.3 Share Location

**Share via LINE:**

```typescript
function shareLocationViaLINE(location: CustomerLocation) {
  const message = encodeURIComponent(
    `📍 ที่อยู่ติดตั้ง\n` +
    `${location.addressLine1}\n` +
    `${location.district}, ${location.province}\n\n` +
    `🗺️ แผนที่: ${location.googleMapsUrl}\n` +
    `ผู้ติดต่อ: ${location.contactOnsite}`
  );
  
  const lineUrl = `https://line.me/R/share?text=${message}`;
  window.open(lineUrl);
}
```

**Share via SMS:**

```typescript
function shareLocationViaSMS(phone: string, location: CustomerLocation) {
  const message = encodeURIComponent(
    `ที่อยู่ติดตั้ง: ${location.addressLine1}, ${location.district}\n` +
    `แผนที่: ${location.googleMapsUrl}`
  );
  
  window.location.href = `sms:${phone}?body=${message}`;
}
```

### 10.5 Installation Management

#### 10.5.1 Installation Schedule with Map

```
┌────────────────────────────────────────────────────────┐
│ 📅 กำหนดการติดตั้ง - 15/03/2025                       │
├────────────────────────────────────────────────────────┤
│ Job 1: OR-202503-0042 • บริษัท ABC                    │
│ ├─ เวลา: 09:00-12:00                                  │
│ ├─ ที่อยู่: 123 ถนนสุขุมวิท คลองเตย                   │
│ ├─ [🗺️ แผนที่] [📞 โทร] [💬 LINE]                    │
│ └─ ทีม: ช่างสมชาย, ช่างสมหญิง                         │
│                                                        │
│ Job 2: OR-202503-0038 • ร้าน XYZ                      │
│ ├─ เวลา: 13:00-16:00                                  │
│ ├─ ที่อยู่: 456 ถนนพระราม 4 ปทุมวัน                  │
│ ├─ [🗺️ แผนที่] [📞 โทร] [💬 LINE]                    │
│ └─ ทีม: ช่างสมชาย, ช่างมานะ                          │
│                                                        │
│ [🚗 เปิด Route Planning] - แสดงเส้นทางทั้งหมด        │
└────────────────────────────────────────────────────────┘
```

#### 10.5.2 Route Optimization (Multiple Jobs)

```typescript
// Generate route for multiple installations
function generateMultiStopRoute(locations: CustomerLocation[]) {
  // Build waypoints
  const waypoints = locations
    .map(loc => `${loc.latitude},${loc.longitude}`)
    .join('|');
  
  // Google Maps Directions URL (FREE!)
  const url = `https://www.google.com/maps/dir/?api=1&` +
    `waypoints=${waypoints}&` +
    `travelmode=driving`;
  
  return url;
}

// Usage
const jobs = await getInstallationJobs(date);
const route = generateMultiStopRoute(jobs.map(j => j.location));
window.open(route);  // Opens optimized route in Google Maps
```

---

## 11. Custom Authentication System

> **🎯 Key Benefit:** ไม่ lock-in กับ Supabase Auth - ย้าย platform ได้ง่าย

### 11.1 Why Custom Auth?

**Problems with Supabase Auth:**
- ❌ **Lock-in:** ย้าย platform ลำบาก (ต้อง migrate users)
- ❌ **Limited control:** ไม่ควบคุม login flow เอง
- ❌ **Dependency:** พึ่งพา Supabase infrastructure

**Benefits of Custom Auth:**
- ✅ **Portable:** ย้ายไปไหนก็ได้ (Vercel, AWS, self-hosted)
- ✅ **Full control:** ควบคุม login flow, session ได้หมด
- ✅ **Independent:** ไม่พึ่งพา Supabase Auth service
- ✅ **Standard:** ใช้ JWT + bcrypt (industry standard)

### 11.2 Database Schema

```typescript
interface User {
  id: string;
  organizationId: string;
  
  // Credentials
  email: string;              // Unique
  passwordHash: string;       // bcrypt hash
  
  // Profile
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  
  // Role & Permissions
  roleId: string;
  permissions: string[];      // Cached from role
  
  // Status
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: DateTime;
  
  // Security
  passwordResetToken?: string;
  passwordResetExpires?: DateTime;
  emailVerificationToken?: string;
  
  // 2FA (Optional)
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  
  // Sessions
  sessions: Session[];
  
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Session {
  id: string;
  userId: string;
  
  // JWT token
  token: string;              // Stored hash
  refreshToken: string;       // For token refresh
  
  // Session info
  ipAddress: string;
  userAgent: string;
  device?: string;            // "Chrome on Windows"
  
  // Expiry
  expiresAt: DateTime;
  
  // Status
  isRevoked: boolean;
  revokedAt?: DateTime;
  
  createdAt: DateTime;
  lastActivityAt: DateTime;
}
```

**SQL Migration:**

```sql
-- Drop Supabase Auth dependency
-- Use custom users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT NOT NULL REFERENCES Organization(id),
  
  -- Credentials
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  
  -- Profile
  fullName TEXT NOT NULL,
  phone TEXT,
  avatarUrl TEXT,
  
  -- Role
  roleId UUID REFERENCES roles(id),
  permissions JSONB DEFAULT '[]',
  
  -- Status
  isActive BOOLEAN DEFAULT TRUE,
  emailVerified BOOLEAN DEFAULT FALSE,
  lastLoginAt TIMESTAMP,
  
  -- Security
  passwordResetToken TEXT,
  passwordResetExpires TIMESTAMP,
  emailVerificationToken TEXT,
  
  -- 2FA
  twoFactorEnabled BOOLEAN DEFAULT FALSE,
  twoFactorSecret TEXT,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tokens
  tokenHash TEXT NOT NULL,        -- Hash of JWT
  refreshToken TEXT NOT NULL,
  
  -- Session info
  ipAddress TEXT NOT NULL,
  userAgent TEXT NOT NULL,
  device TEXT,
  
  -- Expiry
  expiresAt TIMESTAMP NOT NULL,
  
  -- Status
  isRevoked BOOLEAN DEFAULT FALSE,
  revokedAt TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  lastActivityAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organizationId);
CREATE INDEX idx_sessions_user ON sessions(userId);
CREATE INDEX idx_sessions_token ON sessions(tokenHash);
CREATE INDEX idx_sessions_expires ON sessions(expiresAt) WHERE isRevoked = FALSE;
```

### 11.3 Authentication Flow

#### 11.3.1 Registration

```typescript
// API Route: /api/auth/register
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  const { email, password, fullName, organizationId } = await request.json();
  
  // Validate
  if (!email || !password || !fullName) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  // Check if email exists
  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: 'Email already exists' }, { status: 400 });
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate verification token
  const emailVerificationToken = nanoid(32);
  
  // Create user
  const user = await prisma.users.create({
    data: {
      email,
      passwordHash,
      fullName,
      organizationId,
      emailVerificationToken,
      isActive: true,
      emailVerified: false
    }
  });
  
  // Send verification email
  await sendVerificationEmail(email, emailVerificationToken);
  
  return Response.json({ 
    message: 'Registration successful. Please check your email.' 
  });
}
```

#### 11.3.2 Login

```typescript
// API Route: /api/auth/login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { email, password, rememberMe } = await request.json();
  
  // Find user
  const user = await prisma.users.findUnique({
    where: { email },
    include: { role: true }
  });
  
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Check password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Check if active
  if (!user.isActive) {
    return Response.json({ error: 'Account disabled' }, { status: 403 });
  }
  
  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role.name,
      permissions: user.permissions
    },
    process.env.JWT_SECRET!,
    { expiresIn: rememberMe ? '30d' : '24h' }
  );
  
  // Generate refresh token
  const refreshToken = nanoid(64);
  
  // Create session
  const session = await prisma.sessions.create({
    data: {
      userId: user.id,
      tokenHash: await hashToken(token),
      refreshToken,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000)
    }
  });
  
  // Update last login
  await prisma.users.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });
  
  return Response.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name
    }
  });
}
```

#### 11.3.3 Middleware (Protected Routes)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if session is still valid
    const session = await prisma.sessions.findFirst({
      where: {
        tokenHash: await hashToken(token),
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    // Update last activity
    await prisma.sessions.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    });
    
    // Add user info to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-organization-id', payload.organizationId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/customers/:path*', '/api/quotations/:path*', /* ... */]
};
```

### 11.4 Additional Features

#### 11.4.1 Password Reset

```typescript
// Request reset
export async function requestPasswordReset(email: string) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return; // Don't reveal if email exists
  
  const token = nanoid(32);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await prisma.users.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires
    }
  });
  
  await sendPasswordResetEmail(email, token);
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.users.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() }
    }
  });
  
  if (!user) {
    throw new Error('Invalid or expired token');
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.users.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });
  
  // Revoke all existing sessions
  await prisma.sessions.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true, revokedAt: new Date() }
  });
}
```

#### 11.4.2 Session Management

```typescript
// View active sessions
export async function getUserSessions(userId: string) {
  return await prisma.sessions.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { lastActivityAt: 'desc' }
  });
}

// Revoke session
export async function revokeSession(sessionId: string) {
  await prisma.sessions.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedAt: new Date()
    }
  });
}

// Revoke all sessions except current
export async function revokeOtherSessions(userId: string, currentSessionId: string) {
  await prisma.sessions.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      isRevoked: false
    },
    data: {
      isRevoked: true,
      revokedAt: new Date()
    }
  });
}
```

### 11.5 Migration from Supabase Auth

```typescript
// One-time migration script
async function migrateFromSupabaseAuth() {
  // Get all users from Supabase Auth
  const { data: supabaseUsers } = await supabase.auth.admin.listUsers();
  
  for (const supabaseUser of supabaseUsers) {
    // Check if already migrated
    const exists = await prisma.users.findUnique({
      where: { email: supabaseUser.email }
    });
    
    if (exists) continue;
    
    // Create in custom auth
    await prisma.users.create({
      data: {
        id: supabaseUser.id,  // Keep same ID
        email: supabaseUser.email!,
        passwordHash: '$2a$10$MIGRATED',  // Flag as migrated
        fullName: supabaseUser.user_metadata.full_name || supabaseUser.email!,
        organizationId: supabaseUser.user_metadata.organization_id,
        emailVerified: !!supabaseUser.email_confirmed_at,
        isActive: true,
        createdAt: new Date(supabaseUser.created_at)
      }
    });
  }
  
  console.log(`Migrated ${supabaseUsers.length} users`);
}
```

---

## 12. System Integration

### 9.1 LINE Official Account

**Setup Requirements:**
- LINE Official Account (verified)
- Messaging API enabled
- Webhook URL configured
- Channel Access Token
- Channel Secret

**Webhook Events:**
- Message received
- User follow/unfollow
- Postback (button clicks)

### 9.2 Facebook Messenger

**Setup Requirements:**
- Facebook Page
- Facebook App
- Messenger permission
- Webhook subscription
- Page Access Token

### 9.3 Email Service

**Transactional Emails:**
- Welcome emails
- Quotation sent
- Invoice/Receipt sent
- Payment confirmation
- Password reset
- Invitation emails

**Email Provider Options:**
- SendGrid
- AWS SES
- Mailgun
- Resend

### 9.4 SMS Notifications (Optional)

**Use Cases:**
- OTP for customer login
- Order status updates
- Payment reminders
- Appointment reminders

**SMS Providers (Thailand):**
- ThaiSMS
- SMSClub
- Thaibulksms

### 9.5 Payment Gateways

**Supported Methods:**
- Bank Transfer (manual)
- PromptPay QR
- Credit/Debit Card (via gateway)
- Installment plans (via gateway)

**Gateway Providers:**
- 2C2P
- Omise
- GB Prime Pay
- SCB Easy Pay

---

## 10. Data Model & Relationships

### 10.1 Core Entities

```typescript
// Customer
Customer {
  id
  name
  phone
  lineId?
  email?
  address?
  taxId?
  
  // Relations
  orders[]
  quotations[]
  invoices[]
  
  // Computed
  totalSpent
  outstandingBalance
  lastOrderDate
}

// Quotation
Quotation {
  id
  quotationNumber // QT-YYYYMM-XXXX
  customerId
  status // DRAFT, SENT, ACCEPTED, REJECTED
  totalAmount
  vatAmount
  grandTotal
  expiresAt
  notes
  
  // Relations
  customer
  items[]
  order? // If converted
  
  // Approval
  approvalStatus?
  approvedBy?
  approvedAt?
}

// Order (Production Job)
Order {
  id
  orderNumber // OR-YYYYMM-XXXX
  customerId
  quotationId?
  status // new, pending, in_progress, review, installing, completed
  priority // low, medium, high, urgent
  deadline
  assigneeId
  notes
  
  // Relations
  customer
  quotation?
  items[]
  designFiles[]
  history[]
  invoice?
  
  // Computed
  daysUntilDeadline
  progressPercent
}

// Invoice
Invoice {
  id
  invoiceNumber // IV-YYYYMM-XXXX
  orderId?
  customerId
  status // DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE
  totalAmount
  vatAmount
  grandTotal
  amountPaid
  dueDate
  
  // Tax invoice
  isTaxInvoice
  taxInvoiceNumber? // TX-YYYYMM-XXXX
  taxInvoiceDate?
  
  // Relations
  order?
  customer
  items[]
  payments[]
  receipt?
}

// Payment
Payment {
  id
  invoiceId
  amount
  paymentMethod // CASH, TRANSFER, CHEQUE, CARD
  paymentAccountId?
  reference
  paymentDate
  
  // Relations
  invoice
  paymentAccount?
  receipt
}

// Attachment (Universal File System) ⭐ NEW
Attachment {
  id
  organizationId
  
  // Polymorphic - can attach to anything
  attachableType // 'quotation' | 'order' | 'invoice' | 'customer' | 'product'
  attachableId
  
  // File info
  fileName
  fileUrl
  fileType // MIME type
  fileSize
  thumbnailUrl?
  
  // Categorization
  category // 'design' | 'portfolio' | 'sample' | 'reference' | 'proof'
  tags[]
  title?
  description?
  displayOrder
  
  // Version control
  version
  replacesFileId?
  
  // Permissions
  isPublic // Can customer see?
  uploadedBy
  
  // Relations
  organization
  uploader (User)
}

// CustomerLocation (Google Maps Integration) ⭐ NEW
CustomerLocation {
  id
  customerId
  
  // Address
  addressLine1
  addressLine2?
  subdistrict
  district
  province
  postalCode
  
  // Geo coordinates
  latitude?
  longitude?
  
  // Google Maps (NO API COST!)
  googleMapsUrl? // https://maps.google.com/?q=13.7563,100.5018
  googlePlaceId?
  
  // Installation details
  locationType // 'outdoor' | 'indoor' | 'rooftop' | 'storefront'
  accessNotes?
  parkingInfo?
  contactOnsite?
  sitePhotoUrls[]
  
  // Metadata
  isDefault
  label? // "สำนักงานใหญ่", "โรงงาน"
  
  // Relations
  customer
}

// User (Custom Auth - NOT Supabase!) ⭐ NEW
User {
  id
  organizationId
  
  // Credentials
  email // Unique
  passwordHash // bcrypt
  
  // Profile
  fullName
  phone?
  avatarUrl?
  
  // Role & Permissions
  roleId
  permissions[] // Cached from role
  
  // Status
  isActive
  emailVerified
  lastLoginAt?
  
  // Security
  passwordResetToken?
  passwordResetExpires?
  
  // 2FA (optional)
  twoFactorEnabled
  twoFactorSecret?
  
  // Relations
  organization
  role
  sessions[]
  uploadedFiles (Attachment[])
}

// Session (Custom Auth) ⭐ NEW
Session {
  id
  userId
  
  // JWT tokens
  tokenHash // Stored hash of JWT
  refreshToken
  
  // Session info
  ipAddress
  userAgent
  device? // "Chrome on Windows"
  
  // Expiry
  expiresAt
  
  // Status
  isRevoked
  revokedAt?
  lastActivityAt
  
  // Relations
  user
}

// Material
Material {
  id
  name
  sku?
  category
  unit
  costPrice
  sellingPrice
  inStock
  minStock
  maxStock
  wasteFactor
  
  // Relations
  transactions[]
  
  // Computed
  availableStock
  needsReorder
}
```

### 10.2 Database Relationships

```
Organization
├── Customer (1:N)
│   ├── Quotation (1:N)
│   ├── Order (1:N)
│   ├── Invoice (1:N)
│   └── CustomerLocation (1:N) ⭐ NEW
│       └── Attachment (polymorphic)
│
├── Quotation (1:N)
│   ├── QuotationItem (1:N)
│   ├── Order (1:1)
│   └── Attachment (1:N) ⭐ NEW
│
├── Order (1:N)
│   ├── OrderItem (1:N)
│   ├── DesignFile (1:N)
│   ├── OrderHistory (1:N)
│   ├── Invoice (1:1)
│   └── Attachment (1:N) ⭐ NEW
│
├── Invoice (1:N)
│   ├── InvoiceItem (1:N)
│   ├── Payment (1:N)
│   ├── Receipt (1:1)
│   └── Attachment (1:N) ⭐ NEW
│
├── Material (1:N)
│   └── StockTransaction (1:N)
│
├── User (1:N) ⭐ CUSTOM AUTH
│   ├── Role (N:1)
│   ├── Session (1:N) ⭐ NEW
│   ├── OrderHistory (1:N)
│   └── Attachment (1:N) [as uploader]
│
├── PaymentAccount (1:N)
│   └── Payment (1:N)
│
└── Attachment (1:N) ⭐ UNIVERSAL FILE SYSTEM
    └── Can attach to: Quotation, Order, Invoice, Receipt, Customer, Product
```

**Key Relationships:**
- **Attachment** = Polymorphic (can attach to any entity)
- **CustomerLocation** = 1:N with Customer (multiple locations per customer)
- **User** = Custom auth (independent of Supabase Auth)
- **Session** = JWT-based (portable across platforms)

---

## 📋 Implementation Priorities

### Phase 1: Core MVP (Weeks 1-2)
**Goal:** System can replace current operations

Critical path:
1. ✅ **Custom Authentication** ⭐ (Login, Register, Password Reset)
2. ✅ **PDF Export** (3 templates: Quotation, Invoice, Receipt)
3. ✅ **Universal File Attachments** ⭐ (Upload to Quotation/Order/Invoice)
4. ✅ **Customer Location** ⭐ (Save address + Google Maps link)
5. ✅ Design File Upload
6. ✅ Customer Detail Page
7. Edit Quotation
8. Material Edit/Delete
9. Bank Account Settings
10. Logo/Signature Upload

**New Requirements:**
- Multiple bank accounts (company + owner personal)
- Account type validation for tax invoices
- Location sharing via LINE/SMS

**Acceptance:** Can operate business 100% on new system

### Phase 2: Team Efficiency (Weeks 3-4)
**Goal:** Reduce manual work and errors

1. LINE Notification Automation
2. Low Stock Alerts
3. Partial Payments
4. Edit/Cancel Invoices
5. User Activity Logs
6. Approval Workflow Improvements

**Acceptance:** 30% less manual work, fewer errors

### Phase 3: Customer Experience (Weeks 5-6)
**Goal:** Better customer service

1. Customer Portal
2. WhatsApp Integration
3. Email Templates
4. SMS Notifications
5. Automated Follow-ups

**Acceptance:** Customers can self-serve, faster response times

### Phase 4: Business Intelligence (Weeks 7-8)
**Goal:** Data-driven decisions

1. Advanced Analytics
2. Custom Reports
3. Forecasting
4. Mobile App (basic)

**Acceptance:** Management has real-time insights

---

## 🎯 Success Metrics

### Operational Metrics:
- Time to create quotation: < 5 minutes
- Order processing time: < 10 minutes
- Average response time to customers: < 30 minutes
- Stock accuracy: > 95%
- On-time delivery: > 90%

### Financial Metrics:
- Invoice accuracy: 100%
- Days sales outstanding (DSO): < 45 days
- Inventory turnover: > 6x per year
- Profit margin visibility: Real-time

### User Adoption:
- Daily active users: 80% of team
- Mobile usage: > 50% for field workers
- Customer portal adoption: > 30% of customers

---

## 🔒 Security & Compliance

### Data Security:
- HTTPS only
- Encrypted passwords (bcrypt)
- Row-level security (RLS)
- Regular backups
- Audit logs

### Privacy:
- PDPA compliance (Thailand)
- Customer data protection
- Right to deletion
- Data export

### Business Continuity:
- Daily automated backups
- Disaster recovery plan
- Uptime SLA: 99.9%

---

## 📱 Technical Stack Summary

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Prisma ORM
- Next.js API Routes / Server Actions

**Integrations:**
- LINE Messaging API
- Facebook Graph API
- Email (SendGrid/AWS SES)
- Payment Gateways (2C2P/Omise)

**DevOps:**
- Vercel hosting
- GitHub Actions CI/CD
- Monitoring (Sentry)
- Analytics (PostHog/Mixpanel)

---

## 🎬 Next Steps for AI Agents

This specification is designed to be consumed by AI coding agents (like Windsurf with Claude Sonnet 4.5) to implement features autonomously.

**For each feature, the agent should:**
1. Read this specification thoroughly
2. Understand the database schema
3. Check existing code structure
4. Implement following best practices
5. Test thoroughly before marking complete
6. Update documentation
7. Request code review if uncertain

**Priority order for implementation:**
1. Start with Phase 1 features (blocking items)
2. Follow the dependency graph
3. Test each feature before moving to next
4. Deploy incrementally

**Quality checklist:**
- [ ] Code follows TypeScript best practices
- [ ] Proper error handling
- [ ] Loading states for async operations
- [ ] Mobile responsive design
- [ ] Accessibility (WCAG 2.1 Level A minimum)
- [ ] Thai language support
- [ ] User feedback (toasts, confirmations)
- [ ] Data validation (client + server)
- [ ] Security checks (authentication, authorization)
- [ ] Performance optimized (lazy loading, etc.)

---

**End of Specification**

This document should be updated as requirements evolve and new features are discovered through user feedback.
