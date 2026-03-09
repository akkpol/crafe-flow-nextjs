---
description: PM Agent planning and task assignment workflow
---

# PM Agent Planning Workflow

## Execution Steps

// turbo
1. Read PM Agent skill file:
   ```
   Read .codex/skills/pm-agent-dev-team/SKILL.md
   ```

2. Read current status:
   ```
   Read .codex/status/multi-agent-status.yaml
   ```

3. Read issue registry:
   ```
   Read .codex/issues/typescript-errors.yaml
   Read .codex/issues/unit-test-failures.yaml
   Read .codex/issues/bugs.yaml
   ```

4. Analyze issues:
   - Group by root cause
   - Prioritize by impact
   - Assign to appropriate agent

5. Update status board with assignments

6. Create task assignments for agents:
   ```markdown
   ## Task Assignment: [Agent Name]
   
   **Read First**: `.codex/skills/[agent-name]/SKILL.md`
   
   **Task ID**: [ID]
   **Title**: [description]
   **Files**: [list]
   **Spec Section**: [lines to read]
   **Priority**: [P0/P1/P2]
   
   **Acceptance Criteria**:
   1. [criterion]
   2. [criterion]
   ```

7. Monitor progress and resolve blockers
