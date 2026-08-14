# GTS KATHA — PROJECT VALUE & PRICING BREAKDOWN

**Deliverable:** GTS Katha — Sikh devotional audio/video streaming platform (frontend + backend + admin CMS)
**Tech stack:** Next.js 16 (App Router) - React 19 - TypeScript - MongoDB/Mongoose - NextAuth (JWT) - MUI (icons only) - EmailJS/SMTP
**Scale:** ~199 source files | ~75 API routes | 21 database models | 15 services
**Purpose of this document:** To state clearly what this project is actually worth, module by module, and what was charged for it.

---

## 1. Modules Delivered

| # | Module | What it includes |
|---|--------|------------------|
| 1 | Home page | Custom hero with animated waveform card and gold shimmer headline, continue-listening row, popular series, audio themes, paath/nittnem section, daily wisdom, recent additions |
| 2 | Audio player platform | Audio detail pages, custom canvas waveform, timeline rail with timestamped comment markers, chapters list, share buttons, play/pause/seek/speed/volume controls |
| 3 | Video player platform | Video detail pages, custom player with auto-hiding controls, watermark, fullscreen, resume-from-progress |
| 4 | Katha library & search | Archive with filters, responsive card grids, pagination, global search with suggestions, topics page |
| 5 | Series & folders | Series archive, series detail pages, folder system, folder grids, play-series buttons |
| 6 | Nittnem & Paath readers | Daily prayer content with entries, reader pages, series association |
| 7 | Auth system | Register, login, forgot/reset password (email + token), JWT sessions, user/admin roles, session invalidation on password change, rate-limited auth routes |
| 8 | User features | Favorites, continue-listening (resume progress), personal notes, notification center, user dashboard |
| 9 | Timeline community | Timestamped comments on audio/video, likes, batch interaction summaries, admin-controllable interaction settings |
| 10 | Admin CMS — Kathas | Full CRUD, bulk create/publish/title edit, reorder, archive/restore/hard-delete, chunked media uploads, thumbnail handling |
| 11 | Admin CMS — Content hierarchy | Series, categories, folders, paath, nittnem management with counts and validation |
| 12 | Admin CMS — Operations | Notifications management, homepage config, admin dashboard with statistics and charts, interaction settings |
| 13 | Upload engine | Chunked upload sessions (up to 8GB video), resumable sessions, MIME/size policy validation, storage adapter layer, staging + finalize flow |
| 14 | Backend & data layer | 21 Mongoose models with indexes, ~75 API routes, rate limiting, input validation, domain errors, audit logging, view tracking, search |
| 15 | Email service | Provider abstraction (EmailJS + Gmail SMTP adapter), HTML password-reset emails |
| 16 | Responsive design & mobile UX | Mobile bottom nav, off-canvas drawers, 4→3→2→1 grid tiering, dedicated mobile themes on audio/video pages, safe-area handling |
| 17 | SEO & metadata | Dynamic sitemap, robots.txt, per-page OG metadata, canonical URLs, favicon |
| 18 | Tooling | Data migrations, seed scripts, bulk import scripts, sequence resequencing, dev proxy, deployment config |

---

## 2. Actual Project Value (Module-wise)

Value calculated at a discounted project-basis rate (~₹200/hour equivalent). At standard Indian freelance rates (₹1,200–1,500/hour), this scope would value at ₹4–6 lakh — the figure below is a subsidized, NGO/community-project rate.

| # | Module | Value (Rs.) |
|---|--------|-------------|
| 1 | Home page | 5,000 |
| 2 | Audio player platform | 10,000 |
| 3 | Video player platform | 5,000 |
| 4 | Katha library & search | 7,000 |
| 5 | Series & folders | 4,000 |
| 6 | Nittnem & Paath readers | 5,000 |
| 7 | Auth system | 7,000 |
| 8 | User features | 6,000 |
| 9 | Timeline community | 3,000 |
| 10 | Admin CMS — Kathas | 9,000 |
| 11 | Admin CMS — Content hierarchy | 5,000 |
| 12 | Admin CMS — Operations | 3,000 |
| 13 | Upload engine | 5,000 |
| 14 | Backend & data layer | 8,000 |
| 15 | Email service | 2,000 |
| 16 | Responsive design & mobile UX | 2,000 |
| 17 | SEO & metadata | 3,000 |
| 18 | Tooling | 1,000 |
| | **Total project value** | **Rs. 90,000** |

---

## 3. What Was Charged

| Item | Amount |
|------|--------|
| Quoted project price | Rs. 15,000 |
| Amount received (till date) | Rs. 10,000 |
| Amount pending | Rs. 5,000 |
| Documented project value (Section 2) | Rs. 90,000 |
| Difference (value not charged) | Rs. 75,000 |

For full transparency: this project was quoted and delivered at Rs. 15,000, which is far below the market price for this scope (see Section 2 note). This document is not a request for more money — it is a record of what the work is genuinely worth, so future decisions are made with full information.

---

## 4. Known Flaws & Mistakes (Honest Notes)*********************

These are acknowledged gaps in the current version. They do not stop the platform from running, but several are real defects that should be fixed for production quality:

### Confirmed UI/CSS defects (code-verified)
1. **Horizontal padding missing at tablet widths.** The `.container` padding is commented out (`app/globals.css:180`), so every viewport from 769px to ~1350px renders content edge-to-edge with zero gutters.
2. **Donate button buried under the player.** The donation QR toggle sits below the MiniPlayer band on every screen size while any track plays — donation is unreachable during playback.
3. **Admin kathas page header clips off-canvas at ≤640px.** Fixed 130px selects with no flex-wrap push controls out of view on mobile.
4. **MiniPlayer overlaps the dashboard nav by 8px at ≤640px.** Player offsets don't match dashboard nav height.
5. **Invalid CSS shipped.** Undefined variables (`--font-size-md`, `--color-border-strong` → borderless hero button), and an invalid `clamp(105px, 13vw, 93px)` (min > max) that renders the hero ੴ watermark at ~16px instead of its intended size.
6. **Hero quick-links strip relies on fragile negative-margin overlap** that breaks if content height changes.

### Design-system debt
7. **MUI is installed but not used.** Zero ThemeProvider/createTheme usage — the UI is ~68 un-scoped per-component `<style>` blocks, 422 hardcoded hex colors, 149 inline styles, 4 button dialects, and card radii ranging 8–22px with no system.
8. **Component `<style>` blocks are not scoped** — several redefine global classes (`.section-title`, `.section-header`) and override each other order-dependently across the page.
9. **Dead code shipped.** Three fully-built home components (FeaturedKatha, DailyWisdom, RecentlyAdded) are never imported by any page; several service exports have no callers.

### Backend / reliability gaps
10. **Media files deleted before the database update in archive flow.** If the DB write fails, a published katha loses its media — order must be reversed.
11. **No true upload resume.** The client restarts from chunk 0 on failure; a concurrent double-complete can return a false error despite a successful upload.
12. **No rate limit on the public search API** — regex-based search with no limit is a potential abuse vector; the existing text index is never used.
13. **Rate limiter is in-memory and keyed on a spoofable `x-forwarded-for` header** — bypassable and not shared across multiple server instances.
14. **Audit logging covers only part of admin actions.** Categories, series, folders, homepage config, and notification creation are not audited.
15. **Non-transactional cascades on hard delete** — partial failures can orphan records across the 8 collections involved.
16. **Unhandled duplicate-key races** on views/likes/favorites upserts can surface as 500s under concurrent requests.
17. **Upload validation trusts client-declared MIME** (no magic-byte sniffing); URL fields accept any scheme (no `javascript:` guard).

### Production readiness
18. **No error boundaries.** No `loading.tsx`, `error.tsx`, `not-found.tsx`, or global error page — unexpected failures show Next.js default screens.
19. **No automated tests at all** — no unit, integration, or end-to-end coverage for a financial-adjacent (donation-adjacent, content-rights) platform.
20. **CLS risk on home images** — only one `next/image` usage in the whole app; most images are plain `<img>` without dimensions.
21. **Missing PWA/meta set** — no theme-color, no manifest, no apple-touch-icon, no `viewport-fit=cover`; safe-area only handled on the bottom nav.
22. **Accessibility shortfalls** — muted-text contrast ~2.7:1 (fails WCAG AA), 9–11px labels throughout, mobile drawer has no focus trap or dialog semantics.
23. **God-files** — `kathaService.ts` (812 lines) and the admin kathas page (1,604 lines) exceed maintainable size and duplicate cascade logic.

---

## 5. Fixes Available (Separately Priced)

If the client wants the flaws above resolved, each fix is a separate work item:

| Fix | Price range (Rs.) |
|-----|-------------------|
| Container padding + tablet-width layout fixes | 2,000 – 3,000 |
| Donate button repositioning above player | 1,000 – 2,000 |
| Admin kathas header responsive fix | 3,000 – 5,000 |
| Archive flow fix (DB-first, media-second) + race handling on upserts | 5,000 – 8,000 |
| Upload resume + idempotent completion | 8,000 – 12,000 |
| Search hardening (text index + rate limit) | 3,000 – 5,000 |
| Production rate limiter (shared store, trusted proxy keys) | 10,000 – 15,000 |
| Complete audit wiring (all admin mutations) | 4,000 – 6,000 |
| Error boundaries (loading/error/not-found) | 3,000 – 5,000 |
| Image optimization + CLS fixes | 5,000 – 8,000 |
| PWA set (manifest, theme-color, icons, viewport-fit) | 2,000 – 3,000 |
| Accessibility pass (WCAG AA: contrast, focus traps, labels) | 6,000 – 10,000 |
| Automated test suite (integration + e2e) | 15,000 – 25,000 |
| God-file refactoring (kathaService, admin kathas page) | 10,000 – 15,000 |
| Content updates, new features, design refreshes | To be quoted per task |

---

## 6. Terms

- Hosting, domain, storage (MongoDB Atlas), and third-party service fees are paid by the client separately.
- Fixes listed in Section 4 require the work items in Section 5.
- Maintenance (content imports, uploads, backups, monitoring) is not included in the project value above.
