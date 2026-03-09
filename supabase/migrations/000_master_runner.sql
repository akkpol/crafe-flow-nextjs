-- T-DB-001 Master Migration Runner
-- Generated: 2026-03-09
-- Project: CraftFlow ERP
-- 
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard/project/pucxyzgjwkkkbgwbjxuy
-- 2. Navigate to SQL Editor
-- 3. Run each section separately in order (Wave A → Wave E)
-- 4. Or run this entire file at once
--
-- WARNING: Make a backup before running in production!

-- ============================================================
-- WAVE A: Add Missing Fields (Additive - Safe)
-- ============================================================
-- Customer fields
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS companyName TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'สำนักงานใหญ่';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS creditLimit NUMERIC DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS paymentTerms INTEGER DEFAULT 30;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;

-- Material fields
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS maxStock NUMERIC;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS supplierName TEXT;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS imageUrl TEXT;
ALTER TABLE "Material" ADD COLUMN IF NOT EXISTS description TEXT;

-- DesignFile fields
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS fileSize BIGINT;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS uploadedBy UUID REFERENCES profiles(id);
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS thumbnailUrl TEXT;
ALTER TABLE "DesignFile" ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;

-- Order fields
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS quotationId TEXT REFERENCES "Quotation"(id);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS progressPercent INTEGER DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS completedAt TIMESTAMPTZ;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS installationDate DATE;

-- Quotation fields
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS approvalStatus TEXT CHECK (approvalStatus IN ('pending', 'approved', 'rejected'));
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS approvedBy UUID REFERENCES profiles(id);
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS approvedAt TIMESTAMPTZ;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS rejectionReason TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS paymentTermsText TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS createdBy UUID REFERENCES profiles(id);

-- StockTransaction fields
ALTER TABLE "StockTransaction" ADD COLUMN IF NOT EXISTS actorId UUID REFERENCES profiles(id);
ALTER TABLE "StockTransaction" ADD COLUMN IF NOT EXISTS balanceAfter NUMERIC;
ALTER TABLE "StockTransaction" ADD COLUMN IF NOT EXISTS organizationId TEXT REFERENCES "Organization"(id);

-- Receipt fields
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS organizationId TEXT REFERENCES "Organization"(id);
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS paymentId TEXT REFERENCES "Payment"(id);

-- ============================================================
-- WAVE B: Create Phase 1 Tables
-- ============================================================
-- CustomerLocation
CREATE TABLE IF NOT EXISTS "CustomerLocation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customerId TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  label TEXT, addressLine1 TEXT NOT NULL, addressLine2 TEXT,
  subdistrict TEXT, district TEXT, province TEXT, postalCode TEXT,
  latitude NUMERIC, longitude NUMERIC, googleMapsUrl TEXT, googlePlaceId TEXT,
  locationType TEXT DEFAULT 'installation',
  accessNotes TEXT, parkingInfo TEXT, contactOnsite TEXT, sitePhotoUrls TEXT[],
  isDefault BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Attachment (Polymorphic)
CREATE TABLE IF NOT EXISTS "Attachment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT NOT NULL REFERENCES "Organization"(id),
  attachableType TEXT NOT NULL, attachableId TEXT NOT NULL,
  fileName TEXT NOT NULL, fileUrl TEXT NOT NULL, fileType TEXT NOT NULL,
  fileSize BIGINT, thumbnailUrl TEXT, category TEXT, tags TEXT[],
  title TEXT, description TEXT, version INTEGER DEFAULT 1,
  replacesFileId UUID REFERENCES "Attachment"(id),
  isPublic BOOLEAN DEFAULT FALSE, uploadedBy UUID REFERENCES profiles(id),
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WAVE C: OrderStatusConfig + Phase 2 Tables
-- ============================================================
-- OrderStatusConfig
CREATE TABLE IF NOT EXISTS "OrderStatusConfig" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE,
  statusKey TEXT NOT NULL, labelThai TEXT NOT NULL, labelEnglish TEXT,
  color TEXT DEFAULT '#6B7280', icon TEXT DEFAULT '📋',
  sortOrder INTEGER DEFAULT 0, isDefault BOOLEAN DEFAULT FALSE,
  isActive BOOLEAN DEFAULT TRUE, kanbanColumn BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMPTZ DEFAULT NOW(), updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organizationId, statusKey)
);

-- Seed default statuses
INSERT INTO "OrderStatusConfig" (organizationId, statusKey, labelThai, labelEnglish, color, icon, sortOrder, isDefault, kanbanColumn)
SELECT o.id, s.statusKey, s.labelThai, s.labelEnglish, s.color, s.icon, s.sortOrder, TRUE, TRUE
FROM "Organization" o
CROSS JOIN (VALUES
  ('new', 'รับงาน', 'New', '#06B6D4', '📥', 10),
  ('designing', 'ออกแบบ', 'Designing', '#D946EF', '🎨', 20),
  ('approved', 'ยืนยันแบบ', 'Approved', '#EAB308', '✅', 30),
  ('production', 'ผลิต', 'Production', '#06B6D4', '🏭', 40),
  ('qc', 'QC', 'QC', '#D946EF', '🔍', 50),
  ('installing', 'ติดตั้ง', 'Installing', '#EAB308', '🔧', 60),
  ('done', 'เสร็จ', 'Done', '#10B981', '🎉', 70)
) AS s(statusKey, labelThai, labelEnglish, color, icon, sortOrder)
ON CONFLICT (organizationId, statusKey) DO NOTHING;

-- Phase 2 Tables
CREATE TABLE IF NOT EXISTS "ApprovalWorkflow" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entityType TEXT NOT NULL CHECK (entityType IN ('quotation', 'invoice', 'purchase_order')),
  entityId TEXT NOT NULL, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requestedBy UUID REFERENCES profiles(id), approvedBy UUID REFERENCES profiles(id),
  approvedAt TIMESTAMPTZ, reason TEXT, createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT REFERENCES "Organization"(id), userId UUID REFERENCES profiles(id),
  type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE, actionUrl TEXT, createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SystemSettings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT REFERENCES "Organization"(id),
  key TEXT NOT NULL, value JSONB NOT NULL, category TEXT,
  updatedBy UUID REFERENCES profiles(id), updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organizationId, key)
);

-- ============================================================
-- WAVE D: Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customer_phone ON "Customer"(phone);
CREATE INDEX IF NOT EXISTS idx_customer_name ON "Customer"(name);
CREATE INDEX IF NOT EXISTS idx_customer_lineid ON "Customer"(lineId) WHERE lineId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_org ON "Customer"(organizationId);
CREATE INDEX IF NOT EXISTS idx_quotation_number ON "Quotation"(quotationNumber);
CREATE INDEX IF NOT EXISTS idx_quotation_customer ON "Quotation"(customerId);
CREATE INDEX IF NOT EXISTS idx_quotation_approval ON "Quotation"(approvalStatus) WHERE approvalStatus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_number ON "Order"(orderNumber);
CREATE INDEX IF NOT EXISTS idx_order_customer ON "Order"(customerId);
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_order_assignee ON "Order"(assigneeId) WHERE assigneeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_deadline ON "Order"(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_number ON "Invoice"(invoiceNumber);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON "Invoice"(status);
CREATE INDEX IF NOT EXISTS idx_invoice_due ON "Invoice"(dueDate) WHERE dueDate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_material_sku ON "Material"(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_material_low_stock ON "Material"(inStock, minStock) WHERE inStock <= minStock;
CREATE INDEX IF NOT EXISTS idx_payment_invoice ON "Payment"(invoiceId);
CREATE INDEX IF NOT EXISTS idx_attachment_entity ON "Attachment"(attachableType, attachableId);
CREATE INDEX IF NOT EXISTS idx_customer_location_customer ON "CustomerLocation"(customerId);
CREATE INDEX IF NOT EXISTS idx_order_status_config ON "OrderStatusConfig"(organizationId, sortOrder) WHERE isActive = TRUE;

-- ============================================================
-- WAVE E: Enable RLS
-- ============================================================
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Material" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusConfig" ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Basic policies (organization-scoped)
CREATE POLICY "org_customer_select" ON "Customer" FOR SELECT USING (organizationId = get_user_organization());
CREATE POLICY "org_customer_insert" ON "Customer" FOR INSERT WITH CHECK (organizationId = get_user_organization());
CREATE POLICY "org_customer_update" ON "Customer" FOR UPDATE USING (organizationId = get_user_organization());
CREATE POLICY "org_customer_delete" ON "Customer" FOR DELETE USING (organizationId = get_user_organization());

CREATE POLICY "org_quotation_select" ON "Quotation" FOR SELECT USING (organizationId = get_user_organization());
CREATE POLICY "org_quotation_insert" ON "Quotation" FOR INSERT WITH CHECK (organizationId = get_user_organization());
CREATE POLICY "org_quotation_update" ON "Quotation" FOR UPDATE USING (organizationId = get_user_organization());

CREATE POLICY "org_order_select" ON "Order" FOR SELECT USING (organizationId = get_user_organization());
CREATE POLICY "org_order_insert" ON "Order" FOR INSERT WITH CHECK (organizationId = get_user_organization());
CREATE POLICY "org_order_update" ON "Order" FOR UPDATE USING (organizationId = get_user_organization());

CREATE POLICY "org_invoice_select" ON "Invoice" FOR SELECT USING (organizationId = get_user_organization());
CREATE POLICY "org_invoice_insert" ON "Invoice" FOR INSERT WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "org_material_select" ON "Material" FOR SELECT USING (organizationId = get_user_organization());
CREATE POLICY "org_material_insert" ON "Material" FOR INSERT WITH CHECK (organizationId = get_user_organization());
CREATE POLICY "org_material_update" ON "Material" FOR UPDATE USING (organizationId = get_user_organization());

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
SELECT 'T-DB-001: ALL MIGRATIONS COMPLETED SUCCESSFULLY' as status;
