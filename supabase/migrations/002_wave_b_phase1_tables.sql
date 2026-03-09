-- T-DB-001 Wave B: Create Phase 1 Missing Tables
-- Generated: 2026-03-09
-- Project: CraftFlow ERP

-- ============================================================
-- CustomerLocation (Spec §8.3 — Phase 1 Critical)
-- Store multiple addresses per customer with GPS coordinates
-- ============================================================
CREATE TABLE IF NOT EXISTS "CustomerLocation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customerId TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  label TEXT,
  addressLine1 TEXT NOT NULL,
  addressLine2 TEXT,
  subdistrict TEXT,
  district TEXT,
  province TEXT,
  postalCode TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  googleMapsUrl TEXT,
  googlePlaceId TEXT,
  locationType TEXT DEFAULT 'installation', -- billing | installation | warehouse | other
  accessNotes TEXT,
  parkingInfo TEXT,
  contactOnsite TEXT,
  sitePhotoUrls TEXT[],
  isDefault BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "CustomerLocation" IS 'Multiple addresses per customer with GPS coordinates for installation teams';
COMMENT ON COLUMN "CustomerLocation".googleMapsUrl IS 'Generated Google Maps URL for navigation';
COMMENT ON COLUMN "CustomerLocation".isDefault IS 'Default address for this customer (billing or service)';

-- ============================================================
-- Attachment (Spec §8.2 — Phase 1 Critical)
-- Universal polymorphic file attachment system
-- ============================================================
CREATE TABLE IF NOT EXISTS "Attachment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId TEXT NOT NULL REFERENCES "Organization"(id),
  attachableType TEXT NOT NULL, -- 'quotation' | 'order' | 'invoice' | 'receipt' | 'customer'
  attachableId TEXT NOT NULL,
  fileName TEXT NOT NULL,
  fileUrl TEXT NOT NULL,
  fileType TEXT NOT NULL,
  fileSize BIGINT,
  thumbnailUrl TEXT,
  category TEXT, -- 'design' | 'portfolio' | 'sample' | 'reference' | 'proof' | 'payment'
  tags TEXT[],
  title TEXT,
  description TEXT,
  version INTEGER DEFAULT 1,
  replacesFileId UUID REFERENCES "Attachment"(id),
  isPublic BOOLEAN DEFAULT FALSE,
  uploadedBy UUID REFERENCES profiles(id),
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "Attachment" IS 'Universal polymorphic file attachment across all entities';
COMMENT ON COLUMN "Attachment".attachableType IS 'Entity type this file is attached to';
COMMENT ON COLUMN "Attachment".category IS 'File category for filtering and organization';
COMMENT ON COLUMN "Attachment".isPublic IS 'Whether file can be shared publicly via secure link';

-- ============================================================
-- Wave B Complete
-- ============================================================
SELECT 'Wave B: Phase 1 tables created successfully' as status;
