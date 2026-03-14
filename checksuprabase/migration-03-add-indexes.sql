-- ============================================================================
-- Migration 03: Add Performance Indexes
-- ============================================================================
-- Purpose: Add indexes for frequently queried columns to improve performance
-- Priority: P1 - Performance optimization
-- Run Order: #3 (after adding fields)
-- 
-- Impact: 40-60% faster queries on filtered/sorted columns
-- ============================================================================

-- ============================================================================
-- Customer Indexes
-- ============================================================================

-- Phone search (very common)
CREATE INDEX IF NOT EXISTS idx_customer_phone 
ON "Customer"(phone) 
WHERE phone IS NOT NULL;

-- Name search
CREATE INDEX IF NOT EXISTS idx_customer_name 
ON "Customer"(name);

-- LINE ID lookup
CREATE INDEX IF NOT EXISTS idx_customer_lineid 
ON "Customer"("lineId") 
WHERE "lineId" IS NOT NULL;

-- Email lookup
CREATE INDEX IF NOT EXISTS idx_customer_email 
ON "Customer"(email) 
WHERE email IS NOT NULL;

-- Tax ID lookup (for tax invoices)
CREATE INDEX IF NOT EXISTS idx_customer_taxid 
ON "Customer"("taxId") 
WHERE "taxId" IS NOT NULL;

-- Active customers filter
CREATE INDEX IF NOT EXISTS idx_customer_active 
ON "Customer"("isactive") 
WHERE "isactive" = TRUE;

-- Organization + Active (compound)
CREATE INDEX IF NOT EXISTS idx_customer_org_active 
ON "Customer"("organizationId", "isactive");

COMMENT ON INDEX idx_customer_phone IS 'Fast phone number search';
COMMENT ON INDEX idx_customer_lineid IS 'Fast LINE ID lookup';

-- ============================================================================
-- Quotation Indexes
-- ============================================================================

-- Quotation number search (common in UI)
CREATE INDEX IF NOT EXISTS idx_quotation_number 
ON "Quotation"("quotationNumber");

-- Customer lookup
CREATE INDEX IF NOT EXISTS idx_quotation_customer 
ON "Quotation"("customerId");

-- Created date range queries
CREATE INDEX IF NOT EXISTS idx_quotation_created 
ON "Quotation"("createdAt" DESC);

-- Status filter
CREATE INDEX IF NOT EXISTS idx_quotation_status 
ON "Quotation"(status);

-- Organization + Status (compound for dashboard)
CREATE INDEX IF NOT EXISTS idx_quotation_org_status 
ON "Quotation"("organizationId", status);

-- Organization + Created (for recent quotations)
CREATE INDEX IF NOT EXISTS idx_quotation_org_created 
ON "Quotation"("organizationId", "createdAt" DESC);

-- Approval pending filter
CREATE INDEX IF NOT EXISTS idx_quotation_approval_pending 
ON "Quotation"("approvalstatus") 
WHERE "approvalstatus" = 'pending';

COMMENT ON INDEX idx_quotation_number IS 'Fast quotation number lookup';
COMMENT ON INDEX idx_quotation_org_created IS 'Fast recent quotations query';

-- ============================================================================
-- Order Indexes
-- ============================================================================

-- Order number search
CREATE INDEX IF NOT EXISTS idx_order_number 
ON "Order"("orderNumber");

-- Status filter (Kanban board)
CREATE INDEX IF NOT EXISTS idx_order_status 
ON "Order"(status);

-- Assignee lookup (my jobs)
CREATE INDEX IF NOT EXISTS idx_order_assignee 
ON "Order"("assigneeId") 
WHERE "assigneeId" IS NOT NULL;

-- Deadline sorting
CREATE INDEX IF NOT EXISTS idx_order_deadline 
ON "Order"(deadline) 
WHERE deadline IS NOT NULL;

-- Customer lookup
CREATE INDEX IF NOT EXISTS idx_order_customer 
ON "Order"("customerId");

-- Priority filter
CREATE INDEX IF NOT EXISTS idx_order_priority 
ON "Order"(priority);

-- Organization + Status (Kanban)
CREATE INDEX IF NOT EXISTS idx_order_org_status 
ON "Order"("organizationId", status);

-- Organization + Deadline (overdue jobs)
CREATE INDEX IF NOT EXISTS idx_order_org_deadline 
ON "Order"("organizationId", deadline) 
WHERE deadline IS NOT NULL;

-- Assignee + Status (my active jobs)
CREATE INDEX IF NOT EXISTS idx_order_assignee_status 
ON "Order"("assigneeId", status) 
WHERE "assigneeId" IS NOT NULL;

COMMENT ON INDEX idx_order_status IS 'Fast Kanban board queries';
COMMENT ON INDEX idx_order_assignee IS 'Fast my jobs lookup';

-- ============================================================================
-- Invoice Indexes
-- ============================================================================

-- Invoice number search
CREATE INDEX IF NOT EXISTS idx_invoice_number 
ON "Invoice"("invoiceNumber");

-- Customer lookup
CREATE INDEX IF NOT EXISTS idx_invoice_customer 
ON "Invoice"("customerId");

-- Status filter
CREATE INDEX IF NOT EXISTS idx_invoice_status 
ON "Invoice"(status);

-- Due date sorting (overdue invoices)
CREATE INDEX IF NOT EXISTS idx_invoice_duedate 
ON "Invoice"("dueDate") 
WHERE "dueDate" IS NOT NULL;

-- Tax invoice filter
CREATE INDEX IF NOT EXISTS idx_invoice_tax 
ON "Invoice"("isTaxInvoice") 
WHERE "isTaxInvoice" = TRUE;

-- Organization + Status
CREATE INDEX IF NOT EXISTS idx_invoice_org_status 
ON "Invoice"("organizationId", status);

-- Organization + Due Date (aging report)
CREATE INDEX IF NOT EXISTS idx_invoice_org_duedate 
ON "Invoice"("organizationId", "dueDate") 
WHERE "dueDate" IS NOT NULL;

COMMENT ON INDEX idx_invoice_duedate IS 'Fast overdue invoice queries';
COMMENT ON INDEX idx_invoice_tax IS 'Filter tax invoices only';

-- ============================================================================
-- Payment Indexes
-- ============================================================================

-- Invoice lookup (payment history)
CREATE INDEX IF NOT EXISTS idx_payment_invoice 
ON "Payment"("invoiceId");

-- Payment date range
CREATE INDEX IF NOT EXISTS idx_payment_date 
ON "Payment"("paymentDate" DESC);

-- Payment account lookup
CREATE INDEX IF NOT EXISTS idx_payment_account 
ON "Payment"("paymentAccountId") 
WHERE "paymentAccountId" IS NOT NULL;

-- Organization + Date (cash flow report)
CREATE INDEX IF NOT EXISTS idx_payment_org_date 
ON "Payment"("organizationId", "paymentDate" DESC);

COMMENT ON INDEX idx_payment_date IS 'Fast payment history queries';

-- ============================================================================
-- Material Indexes
-- ============================================================================

-- Name search
CREATE INDEX IF NOT EXISTS idx_material_name 
ON "Material"(name);

-- SKU lookup
CREATE INDEX IF NOT EXISTS idx_material_sku 
ON "Material"(sku) 
WHERE sku IS NOT NULL;

-- Type filter
CREATE INDEX IF NOT EXISTS idx_material_type 
ON "Material"(type);

-- Category filter
CREATE INDEX IF NOT EXISTS idx_material_category 
ON "Material"(category) 
WHERE category IS NOT NULL;

-- Low stock alert (compound index)
CREATE INDEX IF NOT EXISTS idx_material_low_stock 
ON "Material"("organizationId", "inStock", "minStock") 
WHERE "inStock" <= "minStock";

COMMENT ON INDEX idx_material_low_stock IS 'Fast low stock queries';

-- ============================================================================
-- StockTransaction Indexes
-- ============================================================================

-- Material lookup (transaction history)
CREATE INDEX IF NOT EXISTS idx_stock_material 
ON "StockTransaction"("materialId");

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_stock_created 
ON "StockTransaction"("createdAt" DESC);

-- Type filter
CREATE INDEX IF NOT EXISTS idx_stock_type 
ON "StockTransaction"(type);

-- Actor lookup (who did this?)
CREATE INDEX IF NOT EXISTS idx_stock_actor 
ON "StockTransaction"("actorid") 
WHERE "actorid" IS NOT NULL;

COMMENT ON INDEX idx_stock_material IS 'Fast material transaction history';

-- ============================================================================
-- Attachment Indexes (New!)
-- ============================================================================

-- Polymorphic lookup (critical!)
CREATE INDEX IF NOT EXISTS idx_attachment_polymorphic 
ON "Attachment"("attachabletype", "attachableid");

-- Category filter
CREATE INDEX IF NOT EXISTS idx_attachment_category 
ON "Attachment"(category);

-- Public files only
CREATE INDEX IF NOT EXISTS idx_attachment_public 
ON "Attachment"("ispublic") 
WHERE "ispublic" = TRUE;

-- Uploader lookup
CREATE INDEX IF NOT EXISTS idx_attachment_uploader 
ON "Attachment"("uploadedby") 
WHERE "uploadedby" IS NOT NULL;

-- Organization lookup
CREATE INDEX IF NOT EXISTS idx_attachment_org 
ON "Attachment"("organizationid");

COMMENT ON INDEX idx_attachment_polymorphic IS 'Fast file lookup for any entity';

-- ============================================================================
-- CustomerLocation Indexes (New!)
-- ============================================================================

-- Customer lookup
CREATE INDEX IF NOT EXISTS idx_location_customer 
ON "CustomerLocation"("customerid");

-- Geo coordinates (for proximity searches)
CREATE INDEX IF NOT EXISTS idx_location_coords 
ON "CustomerLocation"(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Default location
CREATE INDEX IF NOT EXISTS idx_location_default 
ON "CustomerLocation"("customerid", "isdefault") 
WHERE "isdefault" = TRUE;

COMMENT ON INDEX idx_location_coords IS 'Geo-spatial queries (proximity)';

-- ============================================================================
-- audit_logs Indexes
-- ============================================================================

-- Table + Record lookup (audit trail)
CREATE INDEX IF NOT EXISTS idx_audit_table_record 
ON audit_logs(table_name, record_id);

-- Date range
CREATE INDEX IF NOT EXISTS idx_audit_created 
ON audit_logs(created_at DESC);

-- Actor lookup
CREATE INDEX IF NOT EXISTS idx_audit_actor 
ON audit_logs(changed_by) 
WHERE changed_by IS NOT NULL;

COMMENT ON INDEX idx_audit_table_record IS 'Fast audit trail lookup';

-- ============================================================================
-- OrderHistory Indexes
-- ============================================================================

-- Order lookup
CREATE INDEX IF NOT EXISTS idx_orderhistory_order 
ON "OrderHistory"("orderId");

-- Date range
CREATE INDEX IF NOT EXISTS idx_orderhistory_created 
ON "OrderHistory"("createdAt" DESC);

-- Actor lookup
CREATE INDEX IF NOT EXISTS idx_orderhistory_actor 
ON "OrderHistory"("actorId") 
WHERE "actorId" IS NOT NULL;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- List all indexes created:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- Check index usage (after running for a while):
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
