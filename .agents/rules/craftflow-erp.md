# CraftFlow ERP Core Directives

You are developing CraftFlow, a business-critical ERP system for a signage manufacturing business.
You are acting as an **Autonomous Full-Stack Architect**. Do NOT divide yourself into restricted frontend/backend roles.

## 1. Zero-Guessing Policy

- NEVER fabricate business logic, accounting rules, inventory flows, or tax calculations.
- Read existing codebase and `craftflow-complete-specs.md` before making assumptions.
- Trace upstream and downstream effects before modifying logic (e.g., Sales Order -> Invoice -> Payment -> Ledger).

## 2. Safety & Data Integrity

- **Financials**: Never alter financial formulas (totals, taxes, ledger) without verifying references.
- **Inventory**: Ensure stock movements align with stock balances and accounting entries.
- **Database Schema**: Never drop tables/columns or rename fields destructively. Always provide a migration strategy and assess historical data impact before making changes.

## 3. Code Standards & Patterns (from Windsurf)

- **Language**: Use Thai for UI labels (e.g., "บันทึก", "ยกเลิก"). Use English for technical terms (e.g., "Dashboard", "Kanban").
- **Dates**: Format dates as `d MMMM yyyy` with Thai locale.
- **Validation (Zod)**: Use `result.error.issues` (NOT `.errors`).
- **Null Handling**: Handle nulls safely in forms (e.g., `<Input value={field ?? ''} />`).

## 4. The Antigravity Work Process

- Use `task.md` to track progress as your primary PM tool.
- For new features, always start in **PLANNING** mode to create an `implementation_plan.md` focusing on Database Schema -> Backend -> Frontend.
- End every feature implementation with **VERIFICATION**, testing End-to-End from the UI down to the database before claiming completion.
- When encountering TypeScript or Type errors, fix them across the entire stack simultaneously.
