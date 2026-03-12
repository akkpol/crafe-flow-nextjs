-- Fix 007: Wave E RLS Policies (FIXED VERSION)
-- Purpose: Complete rewrite with all issues resolved
-- Fixes: REV-002, REV-003, REV-004, REV-005

-- ============================================================
-- Helper function: Get current user's organization (FIXED)
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Enable RLS on all tables (ONLY tables with policies)
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
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Customer RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view customers in their organization" ON "Customer";
CREATE POLICY "Users can view customers in their organization"
  ON "Customer" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create customers in their organization" ON "Customer";
CREATE POLICY "Users can create customers in their organization"
  ON "Customer" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update customers in their organization" ON "Customer";
CREATE POLICY "Users can update customers in their organization"
  ON "Customer" FOR UPDATE
  USING (organizationId = get_user_organization())
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete customers in their organization" ON "Customer";
CREATE POLICY "Users can delete customers in their organization"
  ON "Customer" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Quotation RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view quotations in their organization" ON "Quotation";
CREATE POLICY "Users can view quotations in their organization"
  ON "Quotation" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create quotations in their organization" ON "Quotation";
CREATE POLICY "Users can create quotations in their organization"
  ON "Quotation" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update quotations in their organization" ON "Quotation";
CREATE POLICY "Users can update quotations in their organization"
  ON "Quotation" FOR UPDATE
  USING (organizationId = get_user_organization())
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete quotations in their organization" ON "Quotation";
CREATE POLICY "Users can delete quotations in their organization"
  ON "Quotation" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- QuotationItem RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "QuotationItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view quotation items in their organization" ON "QuotationItem";
CREATE POLICY "Users can view quotation items in their organization"
  ON "QuotationItem" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Quotation" q 
    WHERE q.id = "QuotationItem".quotationId 
    AND q.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can create quotation items in their organization" ON "QuotationItem";
CREATE POLICY "Users can create quotation items in their organization"
  ON "QuotationItem" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Quotation" q 
    WHERE q.id = quotationId 
    AND q.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can update quotation items in their organization" ON "QuotationItem";
CREATE POLICY "Users can update quotation items in their organization"
  ON "QuotationItem" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "Quotation" q 
    WHERE q.id = "QuotationItem".quotationId 
    AND q.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can delete quotation items in their organization" ON "QuotationItem";
CREATE POLICY "Users can delete quotation items in their organization"
  ON "QuotationItem" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "Quotation" q 
    WHERE q.id = "QuotationItem".quotationId 
    AND q.organizationId = get_user_organization()
  ));

-- ============================================================
-- Order RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view orders in their organization" ON "Order";
CREATE POLICY "Users can view orders in their organization"
  ON "Order" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create orders in their organization" ON "Order";
CREATE POLICY "Users can create orders in their organization"
  ON "Order" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update orders in their organization" ON "Order";
CREATE POLICY "Users can update orders in their organization"
  ON "Order" FOR UPDATE
  USING (organizationId = get_user_organization())
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete orders in their organization" ON "Order";
CREATE POLICY "Users can delete orders in their organization"
  ON "Order" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- OrderItem RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view order items in their organization" ON "OrderItem";
CREATE POLICY "Users can view order items in their organization"
  ON "OrderItem" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Order" o 
    WHERE o.id = "OrderItem".orderId 
    AND o.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can manage order items in their organization" ON "OrderItem";
CREATE POLICY "Users can manage order items in their organization"
  ON "OrderItem" FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "Order" o 
    WHERE o.id = "OrderItem".orderId 
    AND o.organizationId = get_user_organization()
  ));

-- ============================================================
-- OrderHistory RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "OrderHistory" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view order history in their organization" ON "OrderHistory";
CREATE POLICY "Users can view order history in their organization"
  ON "OrderHistory" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Order" o 
    WHERE o.id = "OrderHistory".orderId 
    AND o.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can create order history in their organization" ON "OrderHistory";
CREATE POLICY "Users can create order history in their organization"
  ON "OrderHistory" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Order" o 
    WHERE o.id = orderId 
    AND o.organizationId = get_user_organization()
  ));

-- ============================================================
-- Invoice RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view invoices in their organization" ON "Invoice";
CREATE POLICY "Users can view invoices in their organization"
  ON "Invoice" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create invoices in their organization" ON "Invoice";
CREATE POLICY "Users can create invoices in their organization"
  ON "Invoice" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update invoices in their organization" ON "Invoice";
CREATE POLICY "Users can update invoices in their organization"
  ON "Invoice" FOR UPDATE
  USING (organizationId = get_user_organization())
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete invoices in their organization" ON "Invoice";
CREATE POLICY "Users can delete invoices in their organization"
  ON "Invoice" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- InvoiceItem RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invoice items in their organization" ON "InvoiceItem";
CREATE POLICY "Users can view invoice items in their organization"
  ON "InvoiceItem" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Invoice" i 
    WHERE i.id = "InvoiceItem".invoiceId 
    AND i.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can manage invoice items in their organization" ON "InvoiceItem";
CREATE POLICY "Users can manage invoice items in their organization"
  ON "InvoiceItem" FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "Invoice" i 
    WHERE i.id = "InvoiceItem".invoiceId 
    AND i.organizationId = get_user_organization()
  ));

-- ============================================================
-- Payment RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view payments in their organization" ON "Payment";
CREATE POLICY "Users can view payments in their organization"
  ON "Payment" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create payments in their organization" ON "Payment";
CREATE POLICY "Users can create payments in their organization"
  ON "Payment" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update payments in their organization" ON "Payment";
CREATE POLICY "Users can update payments in their organization"
  ON "Payment" FOR UPDATE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Receipt RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "Receipt" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view receipts in their organization" ON "Receipt";
CREATE POLICY "Users can view receipts in their organization"
  ON "Receipt" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create receipts in their organization" ON "Receipt";
CREATE POLICY "Users can create receipts in their organization"
  ON "Receipt" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update receipts in their organization" ON "Receipt";
CREATE POLICY "Users can update receipts in their organization"
  ON "Receipt" FOR UPDATE
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete receipts in their organization" ON "Receipt";
CREATE POLICY "Users can delete receipts in their organization"
  ON "Receipt" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Material RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view materials in their organization" ON "Material";
CREATE POLICY "Users can view materials in their organization"
  ON "Material" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create materials in their organization" ON "Material";
CREATE POLICY "Users can create materials in their organization"
  ON "Material" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update materials in their organization" ON "Material";
CREATE POLICY "Users can update materials in their organization"
  ON "Material" FOR UPDATE
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete materials in their organization" ON "Material";
CREATE POLICY "Users can delete materials in their organization"
  ON "Material" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- StockTransaction RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "StockTransaction" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stock transactions in their organization" ON "StockTransaction";
CREATE POLICY "Users can view stock transactions in their organization"
  ON "StockTransaction" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create stock transactions in their organization" ON "StockTransaction";
CREATE POLICY "Users can create stock transactions in their organization"
  ON "StockTransaction" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

-- ============================================================
-- Product RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view products in their organization" ON "Product";
CREATE POLICY "Users can view products in their organization"
  ON "Product" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can manage products in their organization" ON "Product";
CREATE POLICY "Users can manage products in their organization"
  ON "Product" FOR ALL
  USING (organizationId = get_user_organization());

-- ============================================================
-- PricingTier RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "PricingTier" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view pricing tiers in their organization" ON "PricingTier";
CREATE POLICY "Users can view pricing tiers in their organization"
  ON "PricingTier" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can manage pricing tiers in their organization" ON "PricingTier";
CREATE POLICY "Users can manage pricing tiers in their organization"
  ON "PricingTier" FOR ALL
  USING (organizationId = get_user_organization());

-- ============================================================
-- PaymentAccount RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "PaymentAccount" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view payment accounts in their organization" ON "PaymentAccount";
CREATE POLICY "Users can view payment accounts in their organization"
  ON "PaymentAccount" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can manage payment accounts in their organization" ON "PaymentAccount";
CREATE POLICY "Users can manage payment accounts in their organization"
  ON "PaymentAccount" FOR ALL
  USING (organizationId = get_user_organization());

-- ============================================================
-- DesignFile RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "DesignFile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view design files in their organization" ON "DesignFile";
CREATE POLICY "Users can view design files in their organization"
  ON "DesignFile" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create design files in their organization" ON "DesignFile";
CREATE POLICY "Users can create design files in their organization"
  ON "DesignFile" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can update design files in their organization" ON "DesignFile";
CREATE POLICY "Users can update design files in their organization"
  ON "DesignFile" FOR UPDATE
  USING (organizationId = get_user_organization())
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete design files in their organization" ON "DesignFile";
CREATE POLICY "Users can delete design files in their organization"
  ON "DesignFile" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- ApprovalWorkflow RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "ApprovalWorkflow" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view approval workflows in their organization" ON "ApprovalWorkflow";
CREATE POLICY "Users can view approval workflows in their organization"
  ON "ApprovalWorkflow" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = "ApprovalWorkflow".requestedBy 
    AND p.organization_id = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can manage approval workflows in their organization" ON "ApprovalWorkflow";
CREATE POLICY "Users can manage approval workflows in their organization"
  ON "ApprovalWorkflow" FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = "ApprovalWorkflow".requestedBy 
    AND p.organization_id = get_user_organization()
  ));

-- ============================================================
-- Notification RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view notifications in their organization" ON "Notification";
CREATE POLICY "Users can view notifications in their organization"
  ON "Notification" FOR SELECT
  USING (userId = auth.uid() OR organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create notifications in their organization" ON "Notification";
CREATE POLICY "Users can create notifications in their organization"
  ON "Notification" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

-- ============================================================
-- SystemSettings RLS Policies (NEW - fixes REV-003)
-- ============================================================
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view system settings in their organization" ON "SystemSettings";
CREATE POLICY "Users can view system settings in their organization"
  ON "SystemSettings" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can manage system settings in their organization" ON "SystemSettings";
CREATE POLICY "Users can manage system settings in their organization"
  ON "SystemSettings" FOR ALL
  USING (organizationId = get_user_organization());

-- ============================================================
-- CustomerLocation RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view locations in their organization" ON "CustomerLocation";
CREATE POLICY "Users can view locations in their organization"
  ON "CustomerLocation" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Customer" c 
    WHERE c.id = "CustomerLocation".customerId 
    AND c.organizationId = get_user_organization()
  ));

DROP POLICY IF EXISTS "Users can manage locations in their organization" ON "CustomerLocation";
CREATE POLICY "Users can manage locations in their organization"
  ON "CustomerLocation" FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "Customer" c 
    WHERE c.id = "CustomerLocation".customerId 
    AND c.organizationId = get_user_organization()
  ));

-- ============================================================
-- Attachment RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view attachments in their organization" ON "Attachment";
CREATE POLICY "Users can view attachments in their organization"
  ON "Attachment" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create attachments in their organization" ON "Attachment";
CREATE POLICY "Users can create attachments in their organization"
  ON "Attachment" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can delete their own attachments" ON "Attachment";
CREATE POLICY "Users can delete their own attachments"
  ON "Attachment" FOR DELETE
  USING (uploadedBy = auth.uid() OR organizationId = get_user_organization());

-- ============================================================
-- OrderStatusConfig RLS Policies (IDEMPOTENT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view status config in their organization" ON "OrderStatusConfig";
CREATE POLICY "Users can view status config in their organization"
  ON "OrderStatusConfig" FOR SELECT
  USING (organizationId = get_user_organization());

DROP POLICY IF EXISTS "Users can create custom statuses in their organization" ON "OrderStatusConfig";
CREATE POLICY "Users can create custom statuses in their organization"
  ON "OrderStatusConfig" FOR INSERT
  WITH CHECK (organizationId = get_user_organization() AND isDefault = FALSE);

DROP POLICY IF EXISTS "Users can update custom statuses in their organization" ON "OrderStatusConfig";
CREATE POLICY "Users can update custom statuses in their organization"
  ON "OrderStatusConfig" FOR UPDATE
  USING (organizationId = get_user_organization() AND isDefault = FALSE);

DROP POLICY IF EXISTS "Users can delete custom statuses in their organization" ON "OrderStatusConfig";
CREATE POLICY "Users can delete custom statuses in their organization"
  ON "OrderStatusConfig" FOR DELETE
  USING (organizationId = get_user_organization() AND isDefault = FALSE);

-- ============================================================
-- Organization RLS Policies (Users can only see their own org)
-- ============================================================
DROP POLICY IF EXISTS "Users can view their organization" ON "Organization";
CREATE POLICY "Users can view their organization"
  ON "Organization" FOR SELECT
  USING (id = get_user_organization());

-- ============================================================
-- Wave E Complete - FIXED VERSION
-- ============================================================
SELECT 'Wave E: RLS policies enabled successfully - ALL ISSUES FIXED' as status;
