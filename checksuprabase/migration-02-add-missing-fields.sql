-- ============================================================================
-- Migration 02: Add Missing Fields to Existing Tables
-- ============================================================================
-- Purpose: Add fields that are missing from current schema
-- Priority: P0 - Required for v3.0 features
-- Run Order: #2 (after RLS policies)
-- ============================================================================

-- ============================================================================
-- PaymentAccount - Add Account Type Support
-- ============================================================================
-- Purpose: Support both company and owner personal accounts for tax invoices

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "accountHolderType" TEXT DEFAULT 'company'
CHECK ("accountHolderType" IN ('company', 'owner', 'other'));

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "accountHolderName" TEXT;

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "accountHolderIdCard" TEXT;

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "ownerRole" TEXT;

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "canIssueTaxInvoice" BOOLEAN DEFAULT TRUE;

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "disclaimer" TEXT;

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "promptPayId" TEXT;

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "promptPayType" TEXT 
CHECK ("promptPayType" IN ('mobile', 'citizen_id', 'tax_id', 'ewallet'));

ALTER TABLE "PaymentAccount" 
ADD COLUMN IF NOT EXISTS "qrCodeUrl" TEXT;

COMMENT ON COLUMN "PaymentAccount"."accountHolderType" IS 'Type of account holder: company (default), owner (personal), other';
COMMENT ON COLUMN "PaymentAccount"."accountHolderName" IS 'Full name of account holder (for personal accounts)';
COMMENT ON COLUMN "PaymentAccount"."accountHolderIdCard" IS 'ID card number for personal accounts';
COMMENT ON COLUMN "PaymentAccount"."ownerRole" IS 'Role in company (กรรมการ, ผู้จัดการ, เจ้าของ)';
COMMENT ON COLUMN "PaymentAccount"."canIssueTaxInvoice" IS 'Can this account be used for tax invoices?';
COMMENT ON COLUMN "PaymentAccount"."disclaimer" IS 'Disclaimer text shown on documents (e.g., บัญชีส่วนตัวของกรรมการ)';

-- ============================================================================
-- Receipt - Add Account Information
-- ============================================================================

ALTER TABLE "Receipt" 
ADD COLUMN IF NOT EXISTS "accountType" TEXT;

ALTER TABLE "Receipt" 
ADD COLUMN IF NOT EXISTS "accountDisclaimer" TEXT;

ALTER TABLE "Receipt" 
ADD COLUMN IF NOT EXISTS "paymentAccountId" TEXT 
REFERENCES "PaymentAccount"(id);

COMMENT ON COLUMN "Receipt"."accountType" IS 'Type of account used (company/owner/other)';
COMMENT ON COLUMN "Receipt"."accountDisclaimer" IS 'Disclaimer text from payment account';

-- ============================================================================
-- Customer - Add Missing Fields (from spec)
-- ============================================================================
-- Note: email, companyname, branch, creditlimit, paymentterms, isactive 
-- already exist! Only add truly missing fields.

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "industry" TEXT;

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "notes" TEXT;

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "source" TEXT 
CHECK ("source" IN ('walk-in', 'phone', 'line', 'facebook', 'email', 'website', 'referral', 'other'));

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "referralSource" TEXT;

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "lastOrderDate" TIMESTAMP WITH TIME ZONE;

ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "totalSpent" NUMERIC DEFAULT 0;

COMMENT ON COLUMN "Customer"."industry" IS 'Business industry/category';
COMMENT ON COLUMN "Customer"."tags" IS 'Auto and manual tags for segmentation';
COMMENT ON COLUMN "Customer"."source" IS 'How customer found us';
COMMENT ON COLUMN "Customer"."referralSource" IS 'Details of referral source';

-- ============================================================================
-- Material - Add Missing Fields
-- ============================================================================
-- Note: sku, category, maxstock, suppliername, imageurl, description exist!

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "supplierContact" TEXT;

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "leadTimeDays" INTEGER;

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "location" TEXT;

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "barcode" TEXT;

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "reorderPoint" NUMERIC;

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "reorderQuantity" NUMERIC;

ALTER TABLE "Material" 
ADD COLUMN IF NOT EXISTS "lastRestockDate" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "Material"."supplierContact" IS 'Supplier contact info (phone/email)';
COMMENT ON COLUMN "Material"."leadTimeDays" IS 'Days from order to delivery';
COMMENT ON COLUMN "Material"."location" IS 'Warehouse location/bin';
COMMENT ON COLUMN "Material"."barcode" IS 'Barcode for scanning';

-- ============================================================================
-- Order - Add Missing Fields (installationNotes)
-- ============================================================================
-- Note: quotationid, progresspercent, completedat, installationdate exist!

ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "installationNotes" TEXT;

ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER;

ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "actualDuration" INTEGER;

ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "serviceLocationId" UUID 
REFERENCES "CustomerLocation"(id);

COMMENT ON COLUMN "Order"."installationNotes" IS 'Special instructions for installation';
COMMENT ON COLUMN "Order"."serviceLocationId" IS 'Link to customer location for this job';

-- ============================================================================
-- Quotation - Add Missing Fields
-- ============================================================================
-- Note: approvalstatus, approvedby, approvedat, rejectionreason, discount exist!
-- Note: paymenttermstext, createdby exist!

ALTER TABLE "Quotation" 
ADD COLUMN IF NOT EXISTS "discountPercent" NUMERIC;

ALTER TABLE "Quotation" 
ADD COLUMN IF NOT EXISTS "deliveryDays" INTEGER;

ALTER TABLE "Quotation" 
ADD COLUMN IF NOT EXISTS "validityDays" INTEGER DEFAULT 30;

COMMENT ON COLUMN "Quotation"."discountPercent" IS 'Discount as percentage (for reference)';
COMMENT ON COLUMN "Quotation"."deliveryDays" IS 'Estimated delivery time in days';
COMMENT ON COLUMN "Quotation"."validityDays" IS 'How many days quote is valid';

-- ============================================================================
-- Organization - Add Missing Fields
-- ============================================================================

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "nameTH" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "nameEN" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "branch" TEXT DEFAULT 'สำนักงานใหญ่';

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "addressLine1" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "addressLine2" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "subdistrict" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "district" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "province" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "postalCode" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "lineOAId" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "facebookPageId" TEXT;

ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN "Organization"."nameTH" IS 'Company name in Thai';
COMMENT ON COLUMN "Organization"."nameEN" IS 'Company name in English';
COMMENT ON COLUMN "Organization"."settings" IS 'Organization-wide settings (JSON)';

-- ============================================================================
-- Attachment - Add displayOrder field
-- ============================================================================

ALTER TABLE "Attachment" 
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER DEFAULT 0;

COMMENT ON COLUMN "Attachment"."displayOrder" IS 'Sort order for display (0 = first)';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify PaymentAccount fields:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'PaymentAccount' 
-- ORDER BY ordinal_position;

-- Verify all new fields exist:
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND column_name IN (
--   'accountHolderType', 'accountType', 'industry', 'tags', 
--   'supplierContact', 'installationNotes', 'serviceLocationId'
-- )
-- ORDER BY table_name, column_name;
