-- T-DB-001 Wave E: Row Level Security (RLS) Policies
-- Generated: 2026-03-09
-- Project: CraftFlow ERP
-- CRITICAL: Must be applied for data security

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuotationItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DesignFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Receipt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Material" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PricingTier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApprovalWorkflow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: Get current user's organization
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
-- Customer RLS Policies
-- ============================================================
CREATE POLICY "Users can view customers in their organization"
  ON "Customer" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create customers in their organization"
  ON "Customer" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can update customers in their organization"
  ON "Customer" FOR UPDATE
  USING (organizationId = get_user_organization())
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can delete customers in their organization"
  ON "Customer" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Quotation RLS Policies
-- ============================================================
CREATE POLICY "Users can view quotations in their organization"
  ON "Quotation" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create quotations in their organization"
  ON "Quotation" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can update quotations in their organization"
  ON "Quotation" FOR UPDATE
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can delete quotations in their organization"
  ON "Quotation" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Order RLS Policies
-- ============================================================
CREATE POLICY "Users can view orders in their organization"
  ON "Order" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create orders in their organization"
  ON "Order" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can update orders in their organization"
  ON "Order" FOR UPDATE
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can delete orders in their organization"
  ON "Order" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Invoice RLS Policies
-- ============================================================
CREATE POLICY "Users can view invoices in their organization"
  ON "Invoice" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create invoices in their organization"
  ON "Invoice" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can update invoices in their organization"
  ON "Invoice" FOR UPDATE
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can delete invoices in their organization"
  ON "Invoice" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Payment RLS Policies
-- ============================================================
CREATE POLICY "Users can view payments in their organization"
  ON "Payment" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create payments in their organization"
  ON "Payment" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can update payments in their organization"
  ON "Payment" FOR UPDATE
  USING (organizationId = get_user_organization());

-- ============================================================
-- Material RLS Policies
-- ============================================================
CREATE POLICY "Users can view materials in their organization"
  ON "Material" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create materials in their organization"
  ON "Material" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can update materials in their organization"
  ON "Material" FOR UPDATE
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can delete materials in their organization"
  ON "Material" FOR DELETE
  USING (organizationId = get_user_organization());

-- ============================================================
-- CustomerLocation RLS Policies
-- ============================================================
CREATE POLICY "Users can view locations in their organization"
  ON "CustomerLocation" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Customer" c 
    WHERE c.id = "CustomerLocation".customerId 
    AND c.organizationId = get_user_organization()
  ));

CREATE POLICY "Users can manage locations in their organization"
  ON "CustomerLocation" FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "Customer" c 
    WHERE c.id = "CustomerLocation".customerId 
    AND c.organizationId = get_user_organization()
  ));

-- ============================================================
-- Attachment RLS Policies
-- ============================================================
CREATE POLICY "Users can view attachments in their organization"
  ON "Attachment" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create attachments in their organization"
  ON "Attachment" FOR INSERT
  WITH CHECK (organizationId = get_user_organization());

CREATE POLICY "Users can delete their own attachments"
  ON "Attachment" FOR DELETE
  USING (uploadedBy = auth.uid() OR organizationId = get_user_organization());

-- ============================================================
-- OrderStatusConfig RLS Policies
-- ============================================================
CREATE POLICY "Users can view status config in their organization"
  ON "OrderStatusConfig" FOR SELECT
  USING (organizationId = get_user_organization());

CREATE POLICY "Users can create custom statuses in their organization"
  ON "OrderStatusConfig" FOR INSERT
  WITH CHECK (organizationId = get_user_organization() AND isDefault = FALSE);

CREATE POLICY "Users can update custom statuses in their organization"
  ON "OrderStatusConfig" FOR UPDATE
  USING (organizationId = get_user_organization() AND isDefault = FALSE);

CREATE POLICY "Users can delete custom statuses in their organization"
  ON "OrderStatusConfig" FOR DELETE
  USING (organizationId = get_user_organization() AND isDefault = FALSE);

-- ============================================================
-- Organization RLS Policies (Users can only see their own org)
-- ============================================================
CREATE POLICY "Users can view their organization"
  ON "Organization" FOR SELECT
  USING (id = get_user_organization());

-- ============================================================
-- Wave E Complete
-- ============================================================
SELECT 'Wave E: RLS policies enabled successfully - CRITICAL SECURITY COMPLETE' as status;
