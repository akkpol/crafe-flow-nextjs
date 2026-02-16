-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Customer (
  id text NOT NULL,
  organizationId text NOT NULL,
  name text NOT NULL,
  phone text,
  lineId text,
  address text,
  taxId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Customer_pkey PRIMARY KEY (id),
  CONSTRAINT Customer_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id)
);
CREATE TABLE public.DesignFile (
  id text NOT NULL,
  orderId text NOT NULL,
  fileName text NOT NULL,
  fileUrl text NOT NULL,
  fileType text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT DesignFile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Invoice (
  id text NOT NULL,
  organizationId text NOT NULL,
  invoiceNumber text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'DRAFT'::"DocumentStatus",
  orderId text,
  customerId text,
  totalAmount double precision NOT NULL DEFAULT 0,
  vatAmount double precision NOT NULL DEFAULT 0,
  grandTotal double precision NOT NULL DEFAULT 0,
  amountPaid double precision NOT NULL DEFAULT 0,
  dueDate timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Invoice_pkey PRIMARY KEY (id),
  CONSTRAINT Invoice_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id),
  CONSTRAINT Invoice_orderId_fkey FOREIGN KEY (orderId) REFERENCES public.Order(id),
  CONSTRAINT Invoice_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.Customer(id)
);
CREATE TABLE public.Material (
  id text NOT NULL,
  organizationId text NOT NULL,
  name text NOT NULL,
  unit text NOT NULL,
  costPrice double precision NOT NULL,
  sellingPrice double precision NOT NULL,
  inStock double precision NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'OTHER'::"MaterialType",
  wasteFactor double precision NOT NULL DEFAULT 1.15,
  minStock double precision DEFAULT 0,
  CONSTRAINT Material_pkey PRIMARY KEY (id),
  CONSTRAINT Material_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id)
);
CREATE TABLE public.Order (
  id text NOT NULL,
  organizationId text NOT NULL,
  orderNumber text NOT NULL,
  customerId text,
  status text NOT NULL DEFAULT 'DRAFT'::text,
  totalAmount double precision NOT NULL DEFAULT 0,
  vatAmount double precision NOT NULL DEFAULT 0,
  grandTotal double precision NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  priority text DEFAULT 'medium'::text,
  deadline date,
  notes text,
  CONSTRAINT Order_pkey PRIMARY KEY (id),
  CONSTRAINT Order_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id),
  CONSTRAINT Order_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.Customer(id)
);
CREATE TABLE public.OrderItem (
  id text NOT NULL,
  orderId text NOT NULL,
  name text NOT NULL,
  width double precision,
  height double precision,
  quantity integer NOT NULL DEFAULT 1,
  unitPrice double precision NOT NULL,
  totalPrice double precision NOT NULL,
  details text,
  CONSTRAINT OrderItem_pkey PRIMARY KEY (id),
  CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY (orderId) REFERENCES public.Order(id)
);
CREATE TABLE public.Organization (
  id text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Organization_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Payment (
  id text NOT NULL,
  organizationId text NOT NULL,
  invoiceId text NOT NULL,
  amount double precision NOT NULL,
  paymentMethod text NOT NULL,
  reference text,
  paymentDate timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paymentAccountId text,
  CONSTRAINT Payment_pkey PRIMARY KEY (id),
  CONSTRAINT Payment_paymentAccountId_fkey FOREIGN KEY (paymentAccountId) REFERENCES public.PaymentAccount(id),
  CONSTRAINT Payment_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id),
  CONSTRAINT Payment_invoiceId_fkey FOREIGN KEY (invoiceId) REFERENCES public.Invoice(id)
);
CREATE TABLE public.PaymentAccount (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  organizationId text NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'company'::text,
  bankName text,
  accountNumber text,
  accountName text,
  isDefault boolean NOT NULL DEFAULT false,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PaymentAccount_pkey PRIMARY KEY (id),
  CONSTRAINT PaymentAccount_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id)
);
CREATE TABLE public.PricingTier (
  id text NOT NULL,
  materialId text NOT NULL,
  minQuantity double precision NOT NULL,
  discountPercent double precision NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT PricingTier_pkey PRIMARY KEY (id),
  CONSTRAINT PricingTier_materialId_fkey FOREIGN KEY (materialId) REFERENCES public.Material(id)
);
CREATE TABLE public.Product (
  id text NOT NULL,
  organizationId text NOT NULL,
  name text NOT NULL,
  description text,
  imageUrl text,
  basePrice double precision NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Product_pkey PRIMARY KEY (id),
  CONSTRAINT Product_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id)
);
CREATE TABLE public.Quotation (
  id text NOT NULL,
  organizationId text NOT NULL,
  quotationNumber text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'DRAFT'::"DocumentStatus",
  customerId text,
  totalAmount double precision NOT NULL DEFAULT 0,
  vatAmount double precision NOT NULL DEFAULT 0,
  grandTotal double precision NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  expiresAt timestamp without time zone,
  CONSTRAINT Quotation_pkey PRIMARY KEY (id),
  CONSTRAINT Quotation_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES public.Organization(id),
  CONSTRAINT Quotation_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.Customer(id)
);
CREATE TABLE public.QuotationItem (
  id text NOT NULL,
  quotationId text NOT NULL,
  name text NOT NULL,
  width double precision,
  height double precision,
  quantity integer NOT NULL DEFAULT 1,
  unitPrice double precision NOT NULL,
  totalPrice double precision NOT NULL,
  details text,
  CONSTRAINT QuotationItem_pkey PRIMARY KEY (id),
  CONSTRAINT QuotationItem_quotationId_fkey FOREIGN KEY (quotationId) REFERENCES public.Quotation(id)
);
CREATE TABLE public.StockTransaction (
  id text NOT NULL,
  materialId text NOT NULL,
  type USER-DEFINED NOT NULL,
  quantity double precision NOT NULL,
  reference text,
  notes text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT StockTransaction_pkey PRIMARY KEY (id),
  CONSTRAINT StockTransaction_materialId_fkey FOREIGN KEY (materialId) REFERENCES public.Material(id)
);
CREATE TABLE public._prisma_migrations (
  id character varying NOT NULL,
  checksum character varying NOT NULL,
  finished_at timestamp with time zone,
  migration_name character varying NOT NULL,
  logs text,
  rolled_back_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0,
  CONSTRAINT_prisma_migrations_pkey PRIMARY KEY (id)
);
