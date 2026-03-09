-- T-DB-001 Wave C: OrderStatusConfig + Phase 2 Tables
-- Generated: 2026-03-09
-- Project: CraftFlow ERP

-- ============================================================
-- OrderStatusConfig (NEW - Hybrid Approach)
-- User-defined custom statuses per organization
-- Built-in statuses seeded as isDefault=TRUE (non-editable)
-- ============================================================
CREATE TABLE IF NOT EXISTS "OrderStatusConfig" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE,
  statusKey TEXT NOT NULL, -- e.g., 'pending_review', 'waiting_material'
  labelThai TEXT NOT NULL, -- e.g., 'รอตรวจสอบ'
  labelEnglish TEXT,       -- e.g., 'Pending Review'
  color TEXT DEFAULT '#6B7280', -- Hex color code
  icon TEXT DEFAULT '📋',   -- Emoji icon
  sortOrder INTEGER DEFAULT 0,
  isDefault BOOLEAN DEFAULT FALSE, -- TRUE = built-in, user cannot edit/delete
  isActive BOOLEAN DEFAULT TRUE,
  kanbanColumn BOOLEAN DEFAULT TRUE, -- Show in Kanban board
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organizationId, statusKey)
);

COMMENT ON TABLE "OrderStatusConfig" IS 'User-defined order statuses per organization (Hybrid: built-in + custom)';
COMMENT ON COLUMN "OrderStatusConfig".isDefault IS 'Built-in status from system - cannot be edited or deleted by users';
COMMENT ON COLUMN "OrderStatusConfig".kanbanColumn IS 'Whether this status appears as a column in Kanban board';

-- Seed default statuses for all existing organizations (as non-editable)
-- These match the current OrderStatus values in lib/types.ts
INSERT INTO "OrderStatusConfig" (organizationId, statusKey, labelThai, labelEnglish, color, icon, sortOrder, isDefault, kanbanColumn)
SELECT 
  o.id as organizationId,
  s.statusKey,
  s.labelThai,
  s.labelEnglish,
  s.color,
  s.icon,
  s.sortOrder,
  TRUE as isDefault,
  TRUE as kanbanColumn
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

-- ============================================================
-- ApprovalWorkflow (Phase 2)
-- Track approval requests for quotations, invoices, purchase orders
-- ============================================================
CREATE TABLE IF NOT EXISTS "ApprovalWorkflow" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entityType TEXT NOT NULL CHECK (entityType IN ('quotation', 'invoice', 'purchase_order')),
  entityId TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requestedBy UUID REFERENCES profiles(id),
  approvedBy UUID REFERENCES profiles(id),
  approvedAt TIMESTAMPTZ,
  reason TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "ApprovalWorkflow" IS 'Approval workflow tracking for business documents';

-- ============================================================
-- Notification (Phase 2)
-- In-app and external notification system
-- ============================================================
CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT REFERENCES "Organization"(id),
  userId UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'low_stock', 'approval_request', 'payment_received', 'deadline_approaching'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  actionUrl TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "Notification" IS 'System notifications for users';

-- ============================================================
-- SystemSettings (Phase 2)
-- Global and organization-specific configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS "SystemSettings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT REFERENCES "Organization"(id),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  category TEXT, -- 'approval', 'notification', 'pdf', 'inventory'
  updatedBy UUID REFERENCES profiles(id),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organizationId, key)
);

COMMENT ON TABLE "SystemSettings" IS 'Organization-specific system configuration stored as JSON';

-- ============================================================
-- Wave C Complete
-- ============================================================
SELECT 'Wave C: OrderStatusConfig and Phase 2 tables created successfully' as status;
