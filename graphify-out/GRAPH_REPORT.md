# Graph Report - gts-katha  (2026-06-20)

## Corpus Check
- 151 files · ~510,439 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 406 nodes · 509 edges · 17 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 183 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 52 edges
2. `enforceRateLimit()` - 19 edges
3. `requireAdmin()` - 18 edges
4. `PUT()` - 12 edges
5. `validateKathaInput()` - 10 edges
6. `DELETE()` - 9 edges
7. `stringField()` - 9 edges
8. `getKathas()` - 9 edges
9. `GET()` - 8 edges
10. `load()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `connectDB()`  [INFERRED]
  app\api\homepage\route.ts → lib\db.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `HomePage()` --calls--> `connectDB()`  [INFERRED]
  app\(public)\page.tsx → lib\db.ts
- `HomePage()` --calls--> `getAllSeries()`  [INFERRED]
  app\(public)\page.tsx → services\seriesService.ts
- `HomePage()` --calls--> `getCategoriesWithCount()`  [INFERRED]
  app\(public)\page.tsx → services\categoryService.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (28): sitemap(), GET(), POST(), GET(), POST(), DELETE(), GET(), POST() (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (24): DELETE(), GET(), PATCH(), POST(), HomePage(), isPublicKatha(), GET(), recordAudit() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (10): hardDeleteKatha(), restoreKatha(), handleDelete(), handleSubmit(), handleSubmit(), generateSlug(), handleSubmit(), load() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (16): POST(), POST(), GET(), PUT(), GET(), enforceRateLimit(), getClientAddress(), POST() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (16): requireAdmin(), isMediaFolder(), validateUpload(), cancelUploadSession(), completeUploadSession(), createUploadSession(), readMetadata(), saveUploadChunk() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (5): getMediaUrl(), getThumbnailUrl(), createFilename(), FileSystemStorageAdapter, safeFilename()

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (10): GET(), POST(), archiveKatha(), getAdminKathaBySlug(), getKathaBySlug(), incrementViews(), getSeriesBySlug(), generateMetadata() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.3
Nodes (16): asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField(), validateCategoryInput() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (10): AudioPage(), SeriesPage(), GET(), POST(), createSeries(), deleteSeries(), getAllSeries(), getSeriesEpisodeCounts() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (6): requireUser(), DELETE(), mutate(), POST(), GET(), PUT()

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (2): ArchiveTimeline(), usePlayerContext()

### Community 12 - "Community 12"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 18 - "Community 18"
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
- **Thin community `Community 9`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (5 nodes): `ArchiveTimeline()`, `ArchiveTimeline.tsx`, `PlayerProvider()`, `PlayerContext.tsx`, `usePlayerContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `fetchWithRetry()`, `handleChange()`, `FileUpload.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 1`, `Community 3`, `Community 6`, `Community 8`, `Community 10`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 2` to `Community 0`, `Community 1`, `Community 5`, `Community 8`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 4` to `Community 0`, `Community 1`, `Community 3`, `Community 6`, `Community 7`, `Community 8`, `Community 10`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 51 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 51 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `enforceRateLimit()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`enforceRateLimit()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PATCH()`) actually correct?**
  _`requireAdmin()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 9 INFERRED edges - model-reasoned connections that need verification._