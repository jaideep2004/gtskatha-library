# Graph Report - gts-katha  (2026-07-04)

## Corpus Check
- 155 files · ~554,149 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 414 nodes · 520 edges · 18 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 52 edges
2. `enforceRateLimit()` - 19 edges
3. `requireAdmin()` - 18 edges
4. `PUT()` - 12 edges
5. `getKathas()` - 11 edges
6. `validateKathaInput()` - 10 edges
7. `DELETE()` - 9 edges
8. `stringField()` - 9 edges
9. `HomePage()` - 8 edges
10. `GET()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `generateSlug()`  [INFERRED]
  app\admin\kathas\page.tsx → lib\utils.ts
- `GET()` --calls--> `connectDB()`  [INFERRED]
  app\api\homepage\route.ts → lib\db.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `HomePage()` --calls--> `connectDB()`  [INFERRED]
  app\(public)\page.tsx → lib\db.ts
- `HomePage()` --calls--> `getRecentKathas()`  [INFERRED]
  app\(public)\page.tsx → services\kathaService.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (26): sitemap(), GET(), POST(), DELETE(), GET(), POST(), GET(), connectDB() (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (20): POST(), POST(), GET(), POST(), GET(), PUT(), DELETE(), GET() (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (18): isMediaFolder(), validateUpload(), cancelUploadSession(), completeUploadSession(), createUploadSession(), readMetadata(), saveUploadChunk(), sessionDirectory() (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (20): isSearchQueryReady(), GET(), assertKathaRelations(), assertMediaRequirements(), buildKathaSearchClauses(), createKatha(), deleteMediaIfPresent(), emptyResult() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (15): AudioPage(), GET(), serializeForClient(), HomePage(), isPublicKatha(), SeriesPage(), GET(), getCategories() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (8): hardDeleteKatha(), restoreKatha(), handleDelete(), handleSubmit(), handleSubmit(), load(), handleDelete(), handleSubmit()

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (17): POST(), asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (4): getMediaUrl(), getThumbnailUrl(), getSeriesBySlug(), generateMetadata()

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (9): createCategory(), deleteCategory(), getCategoryBySlug(), updateCategory(), archiveKatha(), getAdminKathaBySlug(), incrementViews(), DELETE() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (6): requireUser(), DELETE(), mutate(), POST(), GET(), PUT()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (1): handleSubmit()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (2): ArchiveTimeline(), usePlayerContext()

### Community 13 - "Community 13"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (2): fetchWithRetry(), handleChange()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): DomainError

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (2): loadEnv(), main()

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 8`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (7 nodes): `page.tsx`, `getCategoryName()`, `handleDelete()`, `handleSubmit()`, `openEdit()`, `openNew()`, `togglePublish()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (5 nodes): `ArchiveTimeline()`, `ArchiveTimeline.tsx`, `PlayerProvider()`, `PlayerContext.tsx`, `usePlayerContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `fetchWithRetry()`, `handleChange()`, `FileUpload.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 7`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 1` to `Community 11`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 1` to `Community 9`, `Community 10`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 51 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 51 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `enforceRateLimit()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`enforceRateLimit()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PATCH()`) actually correct?**
  _`requireAdmin()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 9 INFERRED edges - model-reasoned connections that need verification._