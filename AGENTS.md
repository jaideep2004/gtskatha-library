# AGENTS.md

## CORE

* Production-grade only
* Scalability + maintainability first
* Analyze before coding
* Verify before concluding
* Never assume unknown facts
* Prefer explicit architecture over implicit behavior

--- 

## WORKFLOW

Required for:

* architecture changes
* DB/schema changes
* financial systems
* auth/permissions
* external integrations
* workflow systems

Steps:

1. Analyze
2. Plan
3. Execute
4. Verify

---

## ARCHITECTURE

* Frontend must not contain business-critical logic
* API routes/controllers orchestrate only
* Core logic belongs in services/modules
* External providers must be isolated behind adapters
* Avoid hidden cross-module coupling
* Prefer modular/domain-driven structure

---

## DATA & DATABASE RULES

* Never create multiple writable sources of truth
* Avoid duplicated mutable state
* Prefer references over embedded mutable entities
* Mutable entities must have one authoritative location
* Financial and rights data must be normalized
* Use centralized enums/constants for statuses
* Design schemas for future multi-tenant support

---

## IMMUTABILITY

Prefer append-only/event-driven systems for:

* royalties
* payouts
* delivery jobs
* audit logs
* DSP webhooks
* MCN verification events

Never overwrite historical financial records.

---

## SCALABILITY

* Heavy operations must use queues/workers
* Jobs must be retry-safe and idempotent
* Avoid blocking external-provider chains
* Prefer async/event-driven workflows
* Avoid unbounded retries

---

## SECURITY

* Never store secrets/tokens unencrypted
* Never expose secrets in logs
* Validate all external webhook payloads
* Apply rate limiting to public APIs

---

## TESTING & VERIFICATION

Before concluding:

* run type checks
* run lint
* verify affected flows
* verify edge cases
* verify failure scenarios

Critical systems require integration testing.

Never claim completion without verification.

---

## FORBIDDEN PATTERNS

* duplicated mutable state
* business logic inside React components
* business logic inside API route handlers
* scattered provider calls
* silent destructive mutations
* hardcoded workflow statuses
* giant god-services/modules
* blind repository-wide rewrites

---

## CONTEXT

* Keep context lean
* Prefer targeted retrieval
* Avoid redundant file reads
* Never blind-scan repositories

Architecture/codebase analysis:

* use graphify first

After major structural changes:

* graphify update .

---

## TOOL RULES

* Never hallucinate APIs/tools
* Read tool definitions first
* Use exact syntax
* Prefer official docs
* Verify SDK/API compatibility before implementation

---

## OUTPUT

* Short
* Structured
* Technical
* Precise
* No filler
* No verbose reasoning

---

## DOMAIN CONTEXT

This codebase contains:

* music distribution systems
* financial workflows
* DSP integrations
* rights management
* MCN/channel systems

Treat related systems as production-critical.

Prioritize:

* auditability
* consistency
* reliability
* recoverability

---

## UI/UX

For UI/UX tasks:

* use bencium-innovative-ux-designer
* or frontend-design skills

Focus on:

* production-ready UI
* accessibility
* responsive behavior
* maintainable components

---

## GRAPHIFY

This project contains a graphify knowledge graph at:
graphify-out/

Rules:

* Read graphify-out/GRAPH_REPORT.md before architecture analysis
* Prefer graphify-out/wiki/index.md over raw file scanning
* Prefer graph traversal over grep for architectural reasoning

Useful commands:

* graphify query "<question>"
* graphify path "<A>" "<B>"
* graphify explain "<concept>"

After structural code changes:

* graphify update .

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
