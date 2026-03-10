# ERP System Development Guidelines for AI Agents

This repository contains a business-critical ERP system currently under active development.

The agent must prioritize:

- correctness
- system stability
- data integrity
- maintainability

Speed of implementation must never compromise system reliability.

---

# Fundamental Rule: Never Guess ERP Logic

ERP systems contain complex business rules.

Never assume behavior for:

- accounting
- inventory
- financial reports
- tax calculations
- payment flows
- order workflows

If the behavior is unclear:

1. inspect the codebase
2. search related modules
3. ask for clarification

Never fabricate missing business rules.

---

# Understand Before Changing Code

Before modifying any code:

1. Identify the module involved
2. Locate related services
3. Inspect database models
4. Trace dependencies

Understand:

- where data originates
- where it flows
- which modules depend on it

Never modify a function without understanding its upstream and downstream usage.

---

# ERP Module Awareness

The system may contain modules such as:

- Users
- Customers
- Vendors
- Products
- Inventory
- Sales Orders
- Purchase Orders
- Invoices
- Payments
- Accounting
- Ledger
- Reports

These modules are interconnected.

Changes in one module may affect others.

Always trace dependencies before modifying logic.

---

# Financial Safety Rules

Modules involving financial calculations are critical.

Examples:

- invoice totals
- tax calculations
- payment reconciliation
- ledger entries
- financial reports

Rules:

- never alter financial formulas without verifying references
- never modify ledger logic blindly
- always check historical data impact

Financial integrity must never be compromised.

---

# Inventory Safety Rules

Inventory systems require consistency between:

- stock movements
- stock balance
- warehouse transfers
- purchase receipts
- sales shipments

Before modifying inventory logic:

- verify how stock is updated
- check if events trigger accounting entries
- confirm if stock affects costing

Never introduce inconsistencies between stock movements and stock balance.

---

# Database Schema Protection

Database changes must be handled carefully.

Before modifying schema:

- locate all code referencing the table
- check API responses
- check reporting dependencies

When proposing schema changes include:

- migration plan
- backward compatibility
- rollback strategy

Avoid destructive operations unless explicitly required.

Examples to avoid:

- dropping columns
- renaming fields without migration
- removing historical data fields

ERP systems rely heavily on historical data.

---

# Workflow Awareness

ERP workflows span multiple modules.

Examples:

Sales Order  
→ Invoice  
→ Payment  
→ Ledger Entry  
→ Financial Report

Purchase Order  
→ Goods Receipt  
→ Inventory Update  
→ Vendor Invoice  
→ Accounting Entry

Before modifying business logic:

- trace the entire workflow
- verify downstream dependencies

Never break cross-module workflows.

---

# Implementation Strategy

Preferred implementation order:

1. reuse existing logic
2. extend existing services
3. add new modules only if necessary
4. add dependencies cautiously

Avoid:

- duplicated logic
- hidden side effects
- tightly coupled modules

---

# Debugging Approach

When debugging:

1. reproduce the issue
2. identify root cause
3. inspect related modules
4. apply minimal fix

Avoid rewriting large sections of code unless absolutely necessary.

---

# Refactoring Rules

Refactoring should:

- preserve system behavior
- improve clarity
- reduce duplication

Refactoring must not alter business logic unless explicitly requested.

---

# Testing Awareness

Before implementing changes:

- inspect existing tests
- avoid breaking tests
- suggest additional tests when needed

Critical modules should have stronger validation.

---

# Communication Format

Responses should contain:

1. Analysis of current system behavior
2. Problem identification
3. Recommended solution
4. System impact
5. Assumptions if any

Never present assumptions as confirmed facts.

 --

# Final Safety Check

Before finalizing changes ask:

- Does this affect financial calculations?
- Does this affect historical data?
- Does this break workflow dependencies?
- Does this follow the existing architecture?

If uncertain, stop and ask for clarification.
