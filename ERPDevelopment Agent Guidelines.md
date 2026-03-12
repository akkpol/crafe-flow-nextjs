# ERP Development Agent Guidelines

This repository contains an ERP system that is still under active development.
The agent must prioritize correctness, data integrity, and maintainability over speed.

---

# Core Principles

- Never fabricate business logic, requirements, or system behavior.
- If ERP behavior is unclear, inspect the codebase first before proposing changes.
- When information is insufficient, ask clarifying questions instead of guessing.
- Do not assume accounting, inventory, or workflow rules.

ERP systems contain critical financial and operational data.
Incorrect assumptions can break the entire system.

---

# Code Understanding First

Before making any change:

1. Read the relevant modules.
2. Identify existing architecture patterns.
3. Understand data models and relationships.
4. Check existing services, helpers, and utilities.

Never introduce new architecture patterns without strong justification.

---

# Data Integrity Rules

The following modules are **critical systems**:

- Accounting
- Inventory
- Orders
- Payments
- Ledger
- Tax calculations
- Financial reports

For these modules:

- Never modify data models blindly.
- Never change calculations without verifying references.
- Never remove fields that may affect historical data.

When proposing schema changes:

- Explain impact
- Provide migration strategy
- Ensure backward compatibility if possible.

---

# Database Changes

When modifying database schema:

Always include:

- migration plan
- rollback strategy
- data compatibility check

Avoid destructive operations such as:

- dropping tables
- removing columns
- renaming fields

unless explicitly required and approved.

---

# Business Logic Safety

ERP workflows are interconnected.

Example flows:

Customer Order  
→ Invoice  
→ Payment  
→ Ledger  
→ Financial Report

Before changing business logic:

- trace upstream and downstream effects
- check if other modules depend on it

Never break cross-module workflows.

---

# Implementation Strategy

Prefer the following order:

1. Reuse existing logic
2. Extend current modules
3. Add new services if necessary
4. Introduce new dependencies only if justified

Avoid:

- duplicate logic
- hidden side effects
- tightly coupled modules

---

# Code Style and Consistency

Follow existing project conventions:

- folder structure
- naming patterns
- API structure
- service layer usage

Do not refactor unrelated parts of the system during a focused task.

---

# Debugging Rules

When debugging:

1. Identify root cause first
2. Confirm with logs or code inspection
3. Propose minimal fix
4. Avoid rewriting large components unless necessary

---

# Testing Expectations

When modifying business logic:

- verify existing tests
- suggest test cases if missing
- avoid introducing breaking changes

Critical modules should be validated carefully.

---

# Communication Style

Responses should include:

1. What was analyzed
2. What problem was found
3. Recommended fix
4. Impact on the system
5. Any assumptions made

Do not present assumptions as facts.

---

# Safety Before Finalizing

Before submitting code or suggestions, verify:

- Does this break financial logic?
- Does this affect historical data?
- Does this impact other ERP modules?
- Does this follow current architecture?

If uncertain, ask before implementing.
