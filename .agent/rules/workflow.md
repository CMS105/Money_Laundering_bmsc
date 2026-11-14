# Agent Autonomous Workflow & Quality Standards

## 1. Memory-First Protocol (MCP Integration)
Before starting any new engineering task or file modification:
1. **Query MCP Memory**: Check active workspace state, known graph topology invariants, and previously established architectural choices.
2. **Align with `.gsd/REQUIREMENTS.md`**: Verify that the proposed code satisfies an explicit requirement (DATA, ENGINE, BENCHMARK, EXPLAIN, or FE).
3. **Inspect `progress.txt`**: Confirm the active task sequence and ensure no duplicate or conflicting work.

## 2. Code Quality & CodeRabbit Standards
- **Strict Type Hints**: Every Python function in `backend/` must include explicit type annotations and pass Pydantic / mypy validation without `Any` shortcuts.
- **Complexity & Edge Cases**:
  - Graph algorithms must handle disconnected graphs, self-loops, and zero-amount edge edge-cases gracefully.
  - LLM SAR generation must always have deterministic fallback logic in case of network or rate-limit failures.
- **Clean Diff Hygiene**: No orphaned print statements, dead code, or leftover scratch files. Use structured logging (`logger.info`, `logger.error`).

## 3. Post-Task Protocol
Upon completing an implementation milestone:
1. **Record Architectural Decisions**: Document any new schema or mathematical threshold adjustments in MCP memory or `.gsd/PROJECT.md`.
2. **Update `progress.txt`**: Move the completed step to `[COMPLETED TASKS]` with a timestamp.
3. **Commit Incrementally**: Ensure atomic, descriptive git commit messages (`feat:`, `fix:`, `test:`, `docs:`).

