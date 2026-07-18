# Graph Report - gts-katha  (2026-07-17)

## Corpus Check
- 158 files · ~557,822 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 432 nodes · 549 edges · 17 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 195 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 53 edges
2. `enforceRateLimit()` - 20 edges
3. `requireAdmin()` - 19 edges
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
- `connectDB()` --calls--> `getUnreadCount()`  [INFERRED]
  lib\db.ts → services\notificationService.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `HomePage()` --calls--> `connectDB()`  [INFERRED]
  app\(public)\page.tsx → lib\db.ts
- `generateMetadata()` --calls--> `getThumbnailUrl()`  [INFERRED]
  app\(public)\video\[slug]\page.tsx → lib\utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (36): sitemap(), GET(), POST(), DELETE(), GET(), POST(), GET(), POST() (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (33): AudioPage(), GET(), isSearchQueryReady(), serializeForClient(), HomePage(), isPublicKatha(), GET(), SeriesPage() (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (22): POST(), POST(), POST(), GET(), PUT(), DELETE(), GET(), PATCH() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (18): cancelUploadSession(), chunkSize(), completeUploadSession(), createUploadSession(), pruneExpiredSessions(), readCompletion(), readMetadata(), saveUploadChunk() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (8): hardDeleteKatha(), restoreKatha(), handleDelete(), handleSubmit(), handleSubmit(), load(), handleDelete(), handleSubmit()

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (17): POST(), asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (2): getMediaUrl(), getThumbnailUrl()

### Community 8 - "Community 8"
Cohesion: 0.31
Nodes (6): requireUser(), DELETE(), mutate(), POST(), GET(), PUT()

### Community 9 - "Community 9"
Cohesion: 0.28
Nodes (7): GET(), PATCH(), createNotification(), getNotifications(), getUnreadCount(), getUserNotifications(), markAsRead()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (1): handleSubmit()

### Community 12 - "Community 12"
Cohesion: 0.47
Nodes (4): handleChange(), fetchWithRetry(), readPayload(), uploadMediaFile()

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (2): ArchiveTimeline(), usePlayerContext()

### Community 14 - "Community 14"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): DomainError

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (2): loadEnv(), main()

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 6`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (11 nodes): `getMediaUrl()`, `media.ts`, `buildQueryString()`, `clamp()`, `formatCount()`, `formatDate()`, `formatDuration()`, `getProgress()`, `getThumbnailUrl()`, `truncate()`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (7 nodes): `page.tsx`, `getCategoryName()`, `handleDelete()`, `handleSubmit()`, `openEdit()`, `openNew()`, `togglePublish()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (5 nodes): `ArchiveTimeline()`, `ArchiveTimeline.tsx`, `PlayerProvider()`, `PlayerContext.tsx`, `usePlayerContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 8`, `Community 1`, `Community 2`, `Community 9`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 2` to `Community 1`, `Community 11`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 2` to `Community 8`, `Community 0`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 52 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 52 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `enforceRateLimit()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`enforceRateLimit()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PATCH()`) actually correct?**
  _`requireAdmin()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 9 INFERRED edges - model-reasoned connections that need verification._