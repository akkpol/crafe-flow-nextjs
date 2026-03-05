# 📖 CraftFlow Data Book & Technical Architecture (For Refactoring & AI Collaboration)

**Document Purpose:** This document serves as the absolute technical source of truth ("Data Book") for the CraftFlow ERP system. It outlines the database schema, core workflows, and architectural rules to ensure that any future refactoring or feature additions by other AI models do NOT break the existing system.

---

## 🏗️ 1. Tech Stack & Architecture Rules

- **Framework:** Next.js 15 (App Router), React 19
- **Database:** PostgreSQL (managed via Supabase)
- **ORM:** Prisma Client
- **Validation:** Zod (Strict validation applied at the **Server Action** boundary `app/actions/*.ts`)
- **Styling UI:** Tailwind CSS v4, Shadcn UI, Lucide Icons
- **Theme:** Dark/Light mode supported via `next-themes`

> **⚠️ Refactoring Rule (The "Any" Ban):**
> *DO NOT use `any` types in Server Actions.* All incoming payload data from client components MUST be parsed through `z.input<typeof Schema>` or `Schema.safeParse()` defined in `lib/schemas.ts`. Data inherently coming from HTML inputs (e.g., quantities, prices) MUST be coerced to numbers (`z.coerce.number()`).

---

## 🗄️ 2. Database Schema (Prisma Models / Raw SQL Concept)

Here is the core mapping of our relational database.

### 🏢 2.1 Organization & Users

- **`Organization`**: `id` (PK), `name`, `code`. The root of multi-tenancy. Every table below (except users) must reference `organizationId`.
- **`User/Profile`**: (Supabase Auth) Linked to Organization. Governed by Role-Based Access Control (RBAC).

### 👥 2.2 Customer & LINE Integration

- **`Customer`**: `id` (PK), `organizationId`, `name`, `phone`, `lineId`, `address`, `taxId`.
- **`line_users`**: Auto-synced from Webhooks (`/api/webhooks/line`). Fields: `line_user_id`, `display_name`, `picture_url`, `is_friend`.
- *Architecture Note:* The frontend uses a component `<LineUserSearch />` to query `line_users` and autofill the `Customer` creation form.

### 📦 2.3 Inventory (Material & Stock)

- **`Material`**: `id` (PK), `name`, `unit`, `costPrice`, `sellingPrice`, `inStock`, `type`, `wasteFactor` (Default: 1.15), `minStock`.
- **`StockTransaction`**: Tracks `IN/OUT` movements referencing `materialId`.
- *Architecture Note:* When fetching materials for pricing, the `wasteFactor` MUST be multiplied against the base area (width * height) BEFORE calculating the final material cost.

### 📄 2.4 Document Engine (Quotation / Order / Invoice / Receipt)

All financial documents share a similar Header-Item structure.

- **`Quotation`**: `id` (PK), `quotationNumber`, `status` (DRAFT, SENT, ACCEPTED, REJECTED), `customerId`, `totalAmount`, `vatAmount`, `grandTotal`, `expiresAt`.
- **`QuotationItem`**: `id` (PK), `quotationId`, `name`, `width`, `height`, `quantity`, `unitPrice`, `totalPrice`.
- **`Order (Job)`**: The production ticket. Generated automatically from `Quotation` if the user toggles "Auto Create Job". Contains `priority`, `deadline`, and `status` (DRAFT -> IN_PROGRESS -> COMPLETED).
- **`Invoice`**: Created when billing a Customer or Order. Status: `DRAFT`, `ISSUED`, `PAID`, `CANCELLED`.
- **`Receipt / Payment`**: Tracks `InvoiceId`, `amount`, `paymentMethod` (CASH, TRANSFER, CHEQUE).

---

## 🔄 3. Core Workflows & Logic

### 3.1 The Document Layout Engine (`DocumentLayout.tsx`)

- **Location:** `components/documents/DocumentLayout.tsx`
- **Behavior:** This is a universal print-layout component used for PREVIEW and PRINTING of Quotations, Invoices, and Receipts.
- **Safety Protocol:** It uses Optional Chaining extensively (`org?.logoUrl`, `customer?.name || "ลูกค้าทั่วไป"`) because page components sometimes render this layout *before* async data fetches (`getOrganization`) finish. **Never remove these null-checks.**

### 3.2 Kanban Board State Management

- **Location:** `app/kanban/page.tsx`
- **Behavior:** Uses `@hello-pangea/dnd`. State updates run optimistically on the client, then sync via server actions (`updateOrderStatus`). If the server action fails, the UI does NOT currently rollback automatically (Area for future improvement).

### 3.3 Zod Validation Flow (Example)

1. **Frontend:** User fills out `@/app/billing/new/page.tsx`.
2. **Component:** Calls `createQuotationAndJob({ quotationData, items, jobOptions })`.
3. **Server Action (`actions/quotations.ts`):**

   ```typescript
   const parsedQuotation = QuotationSchema.parse(quotationData);
   const parsedItems = z.array(QuotationItemSchema).parse(items);
   ```

4. **Database:** Prisma `create` operations execute within a `$transaction` (if applicable) to ensure quotation and job are created atomically.

---

## 🛠️ 4. Known Fixes & Current Status (Do Not Revert)

- **Issue #1 (Fixed):** `"TypeError: Cannot read properties of null (reading 'logoUrl')"`
  - *Context:* Fixed in commit `[Latest]`. `DocumentLayout.tsx` was crashing during initial render of `app/billing/new/page.tsx`.
  - *Resolution:* Implemented `org?.logoUrl` and added `useEffect` fetch inside `billing/new/page.tsx`.
- **Issue #2 (Fixed):** `"NEXT_REDIRECT Error in Server Actions"`
  - *Context:* Cannot use `redirect()` inside a try-catch block in Server Actions if the catch block catches generic `Error`. Next.js throws a specific `NEXT_REDIRECT` error which was being accidentally caught.
  - *Resolution:* Rely on returning `{ success: true, redirectUrl: '...' }` and let the client-side `router.push()` handle navigation.

---

> **For AI Assistants:** Read this document BEFORE suggesting any architectural changes. If you are asked to add a new document type (e.g., Purchase Order), you must replicate the Zod Schema -> Server Action -> `DocumentLayout.tsx` pattern defined above.
