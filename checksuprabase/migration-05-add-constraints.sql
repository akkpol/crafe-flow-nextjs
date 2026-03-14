-- ============================================================================
-- Migration 05: Add Constraints & Validation Rules
-- ============================================================================
-- Purpose: Add data validation constraints to ensure data quality
-- Priority: P1 - Data integrity
-- Run Order: #5 (last, to validate existing data)
-- 
-- Note: Some constraints may fail if existing data violates them!
-- Check data first before running!
-- ============================================================================

-- ============================================================================
-- UNIQUE Constraints
-- ============================================================================

-- Organization code must be unique
ALTER TABLE "Organization" 
ADD CONSTRAINT unique_organization_code 
UNIQUE (code);

-- Order numbers must be unique
ALTER TABLE "Order" 
ADD CONSTRAINT unique_order_number 
UNIQUE ("orderNumber");

-- Quotation numbers must be unique
ALTER TABLE "Quotation" 
ADD CONSTRAINT unique_quotation_number 
UNIQUE ("quotationNumber");

-- Invoice numbers must be unique
ALTER TABLE "Invoice" 
ADD CONSTRAINT unique_invoice_number 
UNIQUE ("invoiceNumber");

-- Tax invoice numbers must be unique (when not null)
CREATE UNIQUE INDEX IF NOT EXISTS unique_tax_invoice_number 
ON "Invoice"("taxInvoiceNumber") 
WHERE "taxInvoiceNumber" IS NOT NULL;

-- Receipt numbers must be unique
ALTER TABLE "Receipt" 
ADD CONSTRAINT unique_receipt_number 
UNIQUE ("receiptNumber");

-- Material SKU must be unique (when not null)
-- Already has UNIQUE constraint!
-- ALTER TABLE "Material" 
-- ADD CONSTRAINT unique_material_sku 
-- UNIQUE (sku);

-- Only one default location per customer
CREATE UNIQUE INDEX IF NOT EXISTS unique_customer_default_location 
ON "CustomerLocation"("customerid") 
WHERE "isdefault" = TRUE;

-- Only one default payment account per organization
CREATE UNIQUE INDEX IF NOT EXISTS unique_default_payment_account 
ON "PaymentAccount"("organizationId") 
WHERE "isDefault" = TRUE;

-- ============================================================================
-- CHECK Constraints - Positive Values
-- ============================================================================

-- Prices must be positive
ALTER TABLE "Material" 
ADD CONSTRAINT check_material_positive_prices 
CHECK ("costPrice" >= 0 AND "sellingPrice" >= 0);

-- Stock must be non-negative
ALTER TABLE "Material" 
ADD CONSTRAINT check_material_positive_stock 
CHECK ("inStock" >= 0 AND "minStock" >= 0);

-- Quotation amounts must be non-negative
ALTER TABLE "Quotation" 
ADD CONSTRAINT check_quotation_positive_amounts 
CHECK ("totalAmount" >= 0 AND "vatAmount" >= 0 AND "grandTotal" >= 0);

-- Order amounts must be non-negative
ALTER TABLE "Order" 
ADD CONSTRAINT check_order_positive_amounts 
CHECK ("totalAmount" >= 0 AND "vatAmount" >= 0 AND "grandTotal" >= 0);

-- Invoice amounts must be non-negative
ALTER TABLE "Invoice" 
ADD CONSTRAINT check_invoice_positive_amounts 
CHECK (
  "totalAmount" >= 0 AND 
  "vatAmount" >= 0 AND 
  "grandTotal" >= 0 AND 
  "amountPaid" >= 0
);

-- Payment amounts must be positive
ALTER TABLE "Payment" 
ADD CONSTRAINT check_payment_positive_amount 
CHECK (amount > 0);

-- Order items must have positive quantity and prices
ALTER TABLE "OrderItem" 
ADD CONSTRAINT check_orderitem_positive 
CHECK (quantity > 0 AND "unitPrice" >= 0 AND "totalPrice" >= 0);

-- Quotation items must have positive quantity and prices
ALTER TABLE "QuotationItem" 
ADD CONSTRAINT check_quotationitem_positive 
CHECK (quantity > 0 AND "unitPrice" >= 0 AND "totalPrice" >= 0);

-- Invoice items must have positive quantity and prices
ALTER TABLE "InvoiceItem" 
ADD CONSTRAINT check_invoiceitem_positive 
CHECK (quantity > 0 AND "unitPrice" >= 0 AND "totalPrice" >= 0);

-- Customer credit limit must be non-negative
ALTER TABLE "Customer" 
ADD CONSTRAINT check_customer_positive_credit 
CHECK ("creditlimit" >= 0);

-- ============================================================================
-- CHECK Constraints - Formats
-- ============================================================================

-- Thai phone number format (10 digits starting with 0)
ALTER TABLE "Customer" 
ADD CONSTRAINT check_customer_phone_format 
CHECK (
  phone IS NULL OR 
  phone ~ '^0[0-9]{9}$' OR 
  phone ~ '^0[0-9]{1,2}-[0-9]{3}-[0-9]{4}$'
);

-- Organization phone format
ALTER TABLE "Organization" 
ADD CONSTRAINT check_org_phone_format 
CHECK (
  phone IS NULL OR 
  phone ~ '^0[0-9]{9}$' OR 
  phone ~ '^0[0-9]{1,2}-[0-9]{3}-[0-9]{4}$'
);

-- Thai Tax ID format (13 digits)
ALTER TABLE "Customer" 
ADD CONSTRAINT check_customer_taxid_format 
CHECK (
  "taxId" IS NULL OR 
  "taxId" ~ '^[0-9]{13}$'
);

-- Organization Tax ID format (13 digits)
ALTER TABLE "Organization" 
ADD CONSTRAINT check_org_taxid_format 
CHECK (
  "taxId" IS NULL OR 
  "taxId" ~ '^[0-9]{13}$'
);

-- Email format (basic validation)
ALTER TABLE "Customer" 
ADD CONSTRAINT check_customer_email_format 
CHECK (
  email IS NULL OR 
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Postal code format (5 digits)
ALTER TABLE "Organization" 
ADD CONSTRAINT check_org_postalcode_format 
CHECK (
  "postalCode" IS NULL OR 
  "postalCode" ~ '^[0-9]{5}$'
);

-- CustomerLocation postal code
ALTER TABLE "CustomerLocation" 
ADD CONSTRAINT check_location_postalcode_format 
CHECK (
  "postalcode" IS NULL OR 
  "postalcode" ~ '^[0-9]{5}$'
);

-- ============================================================================
-- CHECK Constraints - Business Logic
-- ============================================================================

-- Invoice paid amount cannot exceed grand total
ALTER TABLE "Invoice" 
ADD CONSTRAINT check_invoice_payment_limit 
CHECK ("amountPaid" <= "grandTotal");

-- Order progress must be between 0-100
ALTER TABLE "Order" 
ADD CONSTRAINT check_order_progress_range 
CHECK ("progresspercent" >= 0 AND "progresspercent" <= 100);

-- Quotation expires after issue date
ALTER TABLE "Quotation" 
ADD CONSTRAINT check_quotation_expiry 
CHECK (
  "expiresAt" IS NULL OR 
  "expiresAt" > "createdAt"
);

-- Invoice due date must be after creation
ALTER TABLE "Invoice" 
ADD CONSTRAINT check_invoice_duedate 
CHECK (
  "dueDate" IS NULL OR 
  "dueDate" >= "createdAt"::date
);

-- Order deadline should be in the future (warning only)
-- Note: Can't enforce this strictly as deadlines can be in the past
-- ALTER TABLE "Order" 
-- ADD CONSTRAINT check_order_deadline 
-- CHECK (deadline >= CURRENT_DATE);

-- Material waste factor must be >= 1.0
ALTER TABLE "Material" 
ADD CONSTRAINT check_material_waste_factor 
CHECK ("wasteFactor" >= 1.0);

-- Discount cannot exceed total
ALTER TABLE "Quotation" 
ADD CONSTRAINT check_quotation_discount 
CHECK (discount <= "totalAmount");

-- ============================================================================
-- CHECK Constraints - Enum Values
-- ============================================================================

-- Order priority values
ALTER TABLE "Order" 
ADD CONSTRAINT check_order_priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Order status values (add more as needed)
ALTER TABLE "Order" 
ADD CONSTRAINT check_order_status 
CHECK (status IN ('new', 'pending', 'in_progress', 'review', 'installing', 'completed', 'cancelled'));

-- Payment method values
ALTER TABLE "Payment" 
ADD CONSTRAINT check_payment_method 
CHECK ("paymentMethod" IN ('CASH', 'TRANSFER', 'CHEQUE', 'CARD', 'PROMPTPAY'));

-- Receipt payment method
ALTER TABLE "Receipt" 
ADD CONSTRAINT check_receipt_payment_method 
CHECK ("paymentMethod" IN ('CASH', 'TRANSFER', 'CHEQUE', 'CARD', 'PROMPTPAY'));

-- Customer source values
ALTER TABLE "Customer" 
ADD CONSTRAINT check_customer_source 
CHECK (source IN ('walk-in', 'phone', 'line', 'facebook', 'email', 'website', 'referral', 'other'));

-- Attachment category values
ALTER TABLE "Attachment" 
ADD CONSTRAINT check_attachment_category 
CHECK (category IN ('design', 'portfolio', 'sample', 'reference', 'proof', 'payment', 'other'));

-- Attachment type values (polymorphic)
ALTER TABLE "Attachment" 
ADD CONSTRAINT check_attachment_type 
CHECK ("attachabletype" IN ('quotation', 'order', 'invoice', 'receipt', 'customer', 'product'));

-- Location type values
ALTER TABLE "CustomerLocation" 
ADD CONSTRAINT check_location_type 
CHECK ("locationtype" IN ('billing', 'installation', 'warehouse', 'other'));

-- Payment account type
ALTER TABLE "PaymentAccount" 
ADD CONSTRAINT check_account_type 
CHECK (type IN ('company', 'personal', 'other'));

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check all constraints:
-- SELECT 
--   conname as constraint_name,
--   conrelid::regclass as table_name,
--   contype as type,
--   pg_get_constraintdef(oid) as definition
-- FROM pg_constraint
-- WHERE connamespace = 'public'::regnamespace
-- AND contype IN ('c', 'u')
-- ORDER BY conrelid::regclass::text, conname;

-- Test constraints with invalid data:
-- INSERT INTO "Customer" (id, "organizationId", name, phone) 
-- VALUES ('test', 'org1', 'Test', '1234567890');
-- Should fail if phone doesn't match Thai format!

-- INSERT INTO "Material" (id, "organizationId", name, unit, "costPrice", "sellingPrice", "inStock")
-- VALUES ('test', 'org1', 'Test', 'pcs', -10, 100, -5);
-- Should fail due to negative values!
