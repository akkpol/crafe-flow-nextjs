# Features & Functionality Summary: CraftFlow ERP

CraftFlow is a specialized ERP system designed for manufacturing and signage businesses. Below is a summary of the core modules and how they function:

---

## 🏗️ 1. Organization & Profile Management
- **Company Branding**: Stores your business name, address, tax ID, and contact details.
- **Documents Branding**: Management of company logo and authorized signatures that appear automatically on all PDFs (Quotations, Invoices, Receipts).

## 👥 2. Customer Management
- **Customer Database**: Centralized storage of customer names, addresses, and tax information for fast document generation.
- **LINE Integration**: Ability to link customer profiles with LINE IDs for future messaging and notification features.

## 📦 3. Stock & Inventory (Materials)
- **Material Tracking**: Manage inventory of materials (vinyl, stickers, acrylic, etc.) with cost and selling prices.
- **Waste Factor**: Built-in calculation for material waste (e.g., 1.15x) to ensure accurate pricing.
- **Low Stock Alerts**: Define minimum stock levels to monitor when items need reordering.

## 📄 4. Quotation & Pricing Engine
- **Dynamic Calculator**: Calculate prices based on material dimensions (width x height), quantity, and custom units.
- **Quotation-to-Job Workflow**: Save a quotation and optionally auto-create a production job (Order) in the Kanban system.
- **PDF Generation**: Professional PDF previews and printing capabilities with automatic VAT (7%) calculations.

## 📋 5. Order Management & Kanban
- **Production Board**: A visual Kanban board (Ready, In Progress, Review, Done) to track the status of current manufacturing jobs.
- **Priority & Deadlines**: Set deadlines and priority levels (Low, Medium, High, Urgent) for each job to stay on schedule.
- **Design Files**: Attach and manage design files (AI, PDF, Images) directly to each production order.

## 💰 6. Billing & Payments
- **Invoicing**: Convert confirmed orders into professional invoices with tracking for due dates.
- **Receipts & Collections**: Record payments (Cash, Transfer, Cheque) and issue official receipts to customers.
- **Bank Accounts**: Manage multiple company bank accounts for display on invoices.

---

## 🛠️ Technical Overview
- **Core Technology**: Built with Next.js 15, React 19, and Supabase.
- **Validation**: Strict data integrity using Zod schemas at the server action boundary.
- **Responsiveness**: Modern, premium UI designed for both desktop and mobile field work.
