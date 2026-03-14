-- ============================================================================
-- Migration 01: Enable RLS Policies (CRITICAL SECURITY!)
-- ============================================================================
-- Purpose: Enable Row Level Security on all tables that currently have it disabled
-- Priority: P0 - CRITICAL (Security vulnerability!)
-- Run Order: #1 (ต้องรันก่อนทุก migration!)
-- 
-- Tables to Enable RLS:
--   1. Organization (currently disabled)
--   2. Product (currently disabled)
--   3. OrderItem (currently disabled)
--   4. DesignFile (currently disabled)
--   5. PricingTier (currently disabled)
--   6. StockTransaction (currently disabled)
--   7. QuotationItem (currently disabled)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DesignFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PricingTier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuotationItem" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: Organization
-- ============================================================================

-- Policy: Users can only see their own organization
CREATE POLICY "Users can view their organization"
ON "Organization"
FOR SELECT
USING (
  id IN (
    SELECT "Customer"."organizationId" 
    FROM "Customer"
    WHERE "Customer"."organizationId" = id
  )
  OR
  id IN (
    SELECT p."organizationId"::text
    FROM profiles p
    WHERE p.id = auth.uid()
  )
);

-- Policy: Only admins can update organization
CREATE POLICY "Admins can update organization"
ON "Organization"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin')
  )
);

-- ============================================================================
-- RLS Policies: Product
-- ============================================================================

-- Policy: Users can view products in their organization
CREATE POLICY "Users can view organization products"
ON "Product"
FOR SELECT
USING (
  "organizationId" IN (
    SELECT "Customer"."organizationId"
    FROM "Customer"
    LIMIT 1
  )
);

-- Policy: Staff can insert products
CREATE POLICY "Staff can create products"
ON "Product"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Sales Manager', 'Sales Staff')
  )
);

-- Policy: Staff can update products
CREATE POLICY "Staff can update products"
ON "Product"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Sales Manager', 'Sales Staff')
  )
);

-- ============================================================================
-- RLS Policies: OrderItem
-- ============================================================================

-- Policy: Users can view order items in their organization
CREATE POLICY "Users can view order items"
ON "OrderItem"
FOR SELECT
USING (
  "orderId" IN (
    SELECT "Order".id
    FROM "Order"
    WHERE "Order"."organizationId" IN (
      SELECT "Customer"."organizationId"
      FROM "Customer"
      LIMIT 1
    )
  )
);

-- Policy: Staff can manage order items
CREATE POLICY "Staff can manage order items"
ON "OrderItem"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Sales Manager', 'Sales Staff', 'Production Manager')
  )
);

-- ============================================================================
-- RLS Policies: DesignFile
-- ============================================================================

-- Policy: Users can view design files in their organization
CREATE POLICY "Users can view design files"
ON "DesignFile"
FOR SELECT
USING (
  "orderId" IN (
    SELECT "Order".id
    FROM "Order"
    WHERE "Order"."organizationId" IN (
      SELECT "Customer"."organizationId"
      FROM "Customer"
      LIMIT 1
    )
  )
);

-- Policy: Production staff can upload design files
CREATE POLICY "Production can upload design files"
ON "DesignFile"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Production Manager', 'Production Staff')
  )
);

-- Policy: Uploaders can update their own files
CREATE POLICY "Uploaders can update their files"
ON "DesignFile"
FOR UPDATE
USING (
  "uploadedby" = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Production Manager')
  )
);

-- ============================================================================
-- RLS Policies: PricingTier
-- ============================================================================

-- Policy: Everyone can view pricing tiers
CREATE POLICY "Anyone can view pricing tiers"
ON "PricingTier"
FOR SELECT
USING (true);

-- Policy: Only admins can manage pricing tiers
CREATE POLICY "Admins can manage pricing tiers"
ON "PricingTier"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin')
  )
);

-- ============================================================================
-- RLS Policies: StockTransaction
-- ============================================================================

-- Policy: Users can view stock transactions in their organization
CREATE POLICY "Users can view stock transactions"
ON "StockTransaction"
FOR SELECT
USING (
  "organizationid" IN (
    SELECT "Customer"."organizationId"
    FROM "Customer"
    LIMIT 1
  )
);

-- Policy: Warehouse staff can create stock transactions
CREATE POLICY "Warehouse can create transactions"
ON "StockTransaction"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Warehouse Manager', 'Production Manager')
  )
);

-- ============================================================================
-- RLS Policies: QuotationItem
-- ============================================================================

-- Policy: Users can view quotation items in their organization
CREATE POLICY "Users can view quotation items"
ON "QuotationItem"
FOR SELECT
USING (
  "quotationId" IN (
    SELECT "Quotation".id
    FROM "Quotation"
    WHERE "Quotation"."organizationId" IN (
      SELECT "Customer"."organizationId"
      FROM "Customer"
      LIMIT 1
    )
  )
);

-- Policy: Sales staff can manage quotation items
CREATE POLICY "Sales can manage quotation items"
ON "QuotationItem"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.name IN ('Owner', 'Admin', 'Sales Manager', 'Sales Staff')
  )
);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- Should show TRUE for all tables!
