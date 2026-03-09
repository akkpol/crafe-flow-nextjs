-- T-DB-001 Wave A: Add Missing Fields
-- Generated: 2026-03-09
-- Project: CraftFlow ERP

-- ============================================================
-- Customer Table - Add missing fields for CRM enhancement
-- ============================================================
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS companyName TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'สำนักงานใหญ่';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS creditLimit NUMERIC DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS paymentTerms INTEGER DEFAULT 30;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN "Customer".email IS 'Customer email for communication';
COMMENT ON COLUMN "Customer".companyName IS 'Company name for B2B customers';
COMMENT ON COLUMN "Customer".creditLimit IS 'Maximum credit allowed (THB)';
COMMENT ON COLUMN "Customer".paymentTerms IS 'Payment terms in days (default 30)';

-- ============================================================
-- Material Table - Add inventory management fields
-- ============================================================
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS maxStock NUMERIC;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS supplierName TEXT;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS imageUrl TEXT;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN "Material".sku IS 'Stock Keeping Unit for inventory management';
COMMENT ON COLUMN "Material".category IS 'Material category for filtering (LED, Acrylic, Vinyl, etc.)';
COMMENT ON COLUMN "Material".maxStock IS 'Maximum stock level for reorder calculations';

-- ============================================================
-- DesignFile Table - Add metadata and versioning
-- ============================================================
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS fileSize BIGINT;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS uploadedBy UUID REFERENCES profiles(id);
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS thumbnailUrl TEXT;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN "DesignFile".uploadedBy IS 'User who uploaded the file';
COMMENT ON COLUMN "DesignFile".version IS 'File version number for versioning system';
COMMENT ON COLUMN "DesignFile".thumbnailUrl IS 'Thumbnail URL for image previews';

-- ============================================================
-- Order Table - Add production tracking fields
-- ============================================================
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS quotationId TEXT REFERENCES "Quotation"(id);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS progressPercent INTEGER DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS completedAt TIMESTAMPTZ;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS installationDate DATE;

COMMENT ON COLUMN "Order".quotationId IS 'Link back to source quotation';
COMMENT ON COLUMN "Order".progressPercent IS 'Completion percentage (0-100) for Kanban display';
COMMENT ON COLUMN "Order".installationDate IS 'Scheduled installation date';

-- ============================================================
-- Quotation Table - Add approval workflow fields
-- ============================================================
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS approvalStatus TEXT CHECK (approvalStatus IN ('pending', 'approved', 'rejected'));
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS approvedBy UUID REFERENCES profiles(id);
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS approvedAt TIMESTAMPTZ;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS rejectionReason TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS paymentTermsText TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS createdBy UUID REFERENCES profiles(id);

COMMENT ON COLUMN "Quotation".approvalStatus IS 'Approval workflow status';
COMMENT ON COLUMN "Quotation".paymentTermsText IS 'Payment terms description for PDF display';

-- ============================================================
-- StockTransaction Table - Add audit fields
-- ============================================================
ALTER TABLE "StockTransaction" ADD COLUMN IF NOT EXISTS actorId UUID REFERENCES profiles(id);
ALTER TABLE "StockTransaction" ADD COLUMN IF NOT EXISTS balanceAfter NUMERIC;
ALTER TABLE "StockTransaction" ADD COLUMN IF NOT EXISTS organizationId TEXT REFERENCES "Organization"(id);

COMMENT ON COLUMN "StockTransaction".actorId IS 'User who performed the transaction';
COMMENT ON COLUMN "StockTransaction".balanceAfter IS 'Stock balance after this transaction';

-- ============================================================
-- Receipt Table - Add consistency fields
-- ============================================================
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS organizationId TEXT REFERENCES "Organization"(id);
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS paymentId TEXT REFERENCES "Payment"(id);

COMMENT ON COLUMN "Receipt".paymentId IS 'Link to source payment record';

-- ============================================================
-- Wave A Complete
-- ============================================================
SELECT 'Wave A: Missing fields added successfully' as status;
