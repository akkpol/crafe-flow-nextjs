-- T-DB-001 Wave D: Performance Indexes
-- Generated: 2026-03-09
-- Project: CraftFlow ERP

-- ============================================================
-- Customer Search Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customer_phone ON "Customer"(phone);
CREATE INDEX IF NOT EXISTS idx_customer_name ON "Customer"(name);
CREATE INDEX IF NOT EXISTS idx_customer_lineid ON "Customer"(lineId) WHERE lineId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_org ON "Customer"(organizationId);

-- ============================================================
-- Quotation Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quotation_number ON "Quotation"(quotationNumber);
CREATE INDEX IF NOT EXISTS idx_quotation_customer ON "Quotation"(customerId);
CREATE INDEX IF NOT EXISTS idx_quotation_created ON "Quotation"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_approval ON "Quotation"(approvalStatus) WHERE approvalStatus IS NOT NULL;

-- ============================================================
-- Order/Kanban Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_number ON "Order"(orderNumber);
CREATE INDEX IF NOT EXISTS idx_order_customer ON "Order"(customerId);
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_order_assignee ON "Order"(assigneeId) WHERE assigneeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_deadline ON "Order"(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_created ON "Order"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_order_quotation ON "Order"(quotationId) WHERE quotationId IS NOT NULL;

-- ============================================================
-- Invoice Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoice_number ON "Invoice"(invoiceNumber);
CREATE INDEX IF NOT EXISTS idx_invoice_customer ON "Invoice"(customerId);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON "Invoice"(status);
CREATE INDEX IF NOT EXISTS idx_invoice_due ON "Invoice"(dueDate) WHERE dueDate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_order ON "Invoice"(orderId) WHERE orderId IS NOT NULL;

-- ============================================================
-- Material/Inventory Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_material_name ON "Material"(name);
CREATE INDEX IF NOT EXISTS idx_material_type ON "Material"(type);
CREATE INDEX IF NOT EXISTS idx_material_sku ON "Material"(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_material_org ON "Material"(organizationId);
CREATE INDEX IF NOT EXISTS idx_material_low_stock ON "Material"(inStock, minStock) WHERE inStock <= minStock;

-- ============================================================
-- Payment Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payment_invoice ON "Payment"(invoiceId);
CREATE INDEX IF NOT EXISTS idx_payment_date ON "Payment"(paymentDate DESC);

-- ============================================================
-- Stock Transaction Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stock_transaction_material ON "StockTransaction"(materialId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transaction_actor ON "StockTransaction"(actorId) WHERE actorId IS NOT NULL;

-- ============================================================
-- Attachment Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_attachment_entity ON "Attachment"(attachableType, attachableId);
CREATE INDEX IF NOT EXISTS idx_attachment_org ON "Attachment"(organizationId);

-- ============================================================
-- CustomerLocation Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customer_location_customer ON "CustomerLocation"(customerId);
CREATE INDEX IF NOT EXISTS idx_customer_location_default ON "CustomerLocation"(customerId, isDefault) WHERE isDefault = TRUE;

-- ============================================================
-- OrderStatusConfig Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_status_config ON "OrderStatusConfig"(organizationId, sortOrder) WHERE isActive = TRUE;

-- ============================================================
-- Audit Log Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- Wave D Complete
-- ============================================================
SELECT 'Wave D: Performance indexes created successfully' as status;
