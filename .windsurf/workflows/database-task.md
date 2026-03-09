---
description: Execute a Database Agent task using MCP Supabase tools
---

# Database Agent Task Workflow

## Prerequisites
1. Read `.codex/skills/database-agent/SKILL.md` first
2. Have Supabase project ID ready

## Execution Steps

// turbo
1. Read the Database Agent skill file:
   ```
   Read .codex/skills/database-agent/SKILL.md
   ```

2. Check current schema using MCP:
   ```
   mcp8_list_tables(project_id, schemas=["public"], verbose=true)
   ```

3. If needed, verify data:
   ```
   mcp8_execute_sql(project_id, query="SELECT ...")
   ```

4. Apply migration if schema change needed:
   ```
   mcp8_apply_migration(project_id, name="YYYYMMDD_description", query="...")
   ```

5. Generate TypeScript types:
   ```
   mcp8_generate_typescript_types(project_id)
   ```

6. Check for issues:
   ```
   mcp8_get_advisors(project_id, type="security")
   mcp8_get_advisors(project_id, type="performance")
   ```

7. Self-review against quality gates:
   - [ ] Migration runs successfully
   - [ ] Types generated correctly
   - [ ] No security advisories
   - [ ] Indexes added for foreign keys

8. If issues found, log to `.codex/issues/` - DO NOT FIX others' code

9. Report completion status
