# Graph Report - gts-katha  (2026-08-21)

## Corpus Check
- 204 files · ~559,193 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 624 nodes · 874 edges · 24 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 319 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 98 edges
2. `requireAdmin()` - 36 edges
3. `enforceRateLimit()` - 36 edges
4. `PUT()` - 16 edges
5. `recordAudit()` - 15 edges
6. `DELETE()` - 13 edges
7. `GET()` - 12 edges
8. `getKathas()` - 12 edges
9. `generateMetadata()` - 10 edges
10. `validateKathaInput()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `connectDB()`  [INFERRED]
  app\api\homepage\route.ts → lib\db.ts
- `connectDB()` --calls--> `incrementViews()`  [INFERRED]
  lib\db.ts → services\kathaService.ts
- `connectDB()` --calls--> `getUnreadCount()`  [INFERRED]
  lib\db.ts → services\notificationService.ts
- `deleteMediaIfPresent()` --calls--> `deleteFile()`  [INFERRED]
  services\kathaService.ts → services\uploadService.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (39): sitemap(), GET(), POST(), POST(), GET(), POST(), PUT(), connectDB() (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (28): PUT(), DELETE(), PATCH(), POST(), PUT(), GET(), POST(), DELETE() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (38): PUT(), DELETE(), GET(), PATCH(), POST(), isSearchQueryReady(), GET(), applyLibraryExclusion() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (23): generateMetadata(), GET(), POST(), PUT(), DELETE(), PUT(), requireAdmin(), requireUser() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (6): handleSubmit(), handleSubmit(), GET(), POST(), generateSlug(), handleSubmit()

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (16): isMediaFolder(), validateUpload(), cancelUploadSession(), chunkSize(), completeUploadSession(), createUploadSession(), pruneExpiredSessions(), readCompletion() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (17): AudioPage(), GET(), POST(), serializeForClient(), SeriesPage(), GET(), POST(), getCategories() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (15): GET(), POST(), GET(), PUT(), GET(), DELETE(), mutate(), POST() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (3): getMediaUrl(), getThumbnailUrl(), generateMetadata()

### Community 9 - "Community 9"
Cohesion: 0.32
Nodes (15): asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField(), validateCategoryInput() (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (4): handleCreateKatha(), loadEntries(), removeEntry(), toggleExpand()

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (8): angFromFilename(), compareFilesByAng(), leadingNumber(), loadEnv(), main(), panktiFromFilename(), parseArgs(), probeWithConcurrency()

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (4): handleCreateKatha(), loadEntries(), removeEntry(), toggleExpand()

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (9): DELETE(), GET(), POST(), addFavorite(), asItemType(), getUserFavorites(), isFavorited(), removeFavorite() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (8): GET(), PATCH(), POST(), createNotification(), getNotifications(), getUnreadCount(), getUserNotifications(), markAsRead()

### Community 18 - "Community 18"
Cohesion: 0.47
Nodes (4): handleChange(), fetchWithRetry(), readPayload(), uploadMediaFile()

### Community 19 - "Community 19"
Cohesion: 0.53
Nodes (4): getSeriesId(), getSeriesSlug(), getSeriesTitle(), KathaArchive()

### Community 20 - "Community 20"
Cohesion: 0.47
Nodes (3): loadEnv(), main(), parseArgs()

### Community 21 - "Community 21"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 25 - "Community 25"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 26 - "Community 26"
Cohesion: 0.83
Nodes (3): first(), parsePage(), parsePageSize()

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (1): DomainError

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (2): loadEnv(), main()

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 14`, `Community 15`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 6`, `Community 12`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 15`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 97 INFERRED edges - model-reasoned connections that need verification._
- **Are the 34 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PATCH()`) actually correct?**
  _`requireAdmin()` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 34 inferred relationships involving `enforceRateLimit()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`enforceRateLimit()` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 11 INFERRED edges - model-reasoned connections that need verification._