
# AI Agent Instructions (AGENTS.md)

You are an AI coding agent working in this repository.

## Mission
Ship the smallest correct change that unblocks the task.
One fix path only: no alternatives, no “you could also”, no scope creep.

## Hard Rules (Non-negotiable)
- Do exactly what I ask. Do not add features or improvements unless explicitly requested.
- Do NOT refactor unless I explicitly say “refactor”.
- Do NOT change architecture, folder structure, or dependencies unless explicitly requested.
- Prefer existing patterns and conventions in this codebase.
- Keep diffs small and readable.
- Never silently change behavior.

## Working Style (Speed + Correctness)
- If requirements are unclear: make a reasonable assumption and proceed (state it explicitly in “Assumptions”).
- Ask a question only if proceeding would likely cause data loss, auth/security breakage, or production downtime.
- Do not add defensive code “just in case”.
- Touch the minimum number of files required.
- If the task mentions specific files, modify ONLY those files.

## Frontend/Backend Coordination
- Start where the bug surfaces (UI error / API response / logs), then trace one layer at a time.
- If a fix requires both front and back, keep each change minimal and connected to the same root cause.
- Ensure request/response contracts match (shape, status codes, field names).

## Before Coding (Required)
Provide:
1) Root cause hypothesis (1 sentence)
2) 3–5 most relevant files + why
3) Plan: 3–7 steps in execution order (no branches)
Then WAIT for my explicit “GO” before making any code changes.
Exception: if I explicitly say “GO now” in the task, proceed immediately.

## While Coding
- Make minimal focused changes.
- Follow existing naming/formatting.
- Update types/interfaces/schema only if required by the task.
- If you change an API contract, update the caller in the same task.

## Testing & Quality (Required)
- Run existing tests/lint/build scripts if present.
- If no automated tests: provide 2–4 manual checks that verify the fix end-to-end.

## Output Format (Required)
After completing a task, always provide:
1) Summary (2–5 bullets)
2) Files changed (exact paths)
3) How to test (commands + 2–4 manual checks)
4) Assumptions made
5) Remaining risks / follow-ups (only what’s directly related)