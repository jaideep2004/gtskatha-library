# Graph Report - gts-katha  (2026-07-31)

## Corpus Check
- 198 files · ~624,487 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 593 nodes · 818 edges · 21 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 302 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 92 edges
2. `enforceRateLimit()` - 35 edges
3. `requireAdmin()` - 34 edges
4. `PUT()` - 16 edges
5. `recordAudit()` - 15 edges
6. `DELETE()` - 13 edges
7. `GET()` - 12 edges
8. `getKathas()` - 11 edges
9. `generateMetadata()` - 10 edges
10. `validateKathaInput()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `incrementViews()` --calls--> `connectDB()`  [INFERRED]
  services\kathaService.ts → lib\db.ts
- `getUnreadCount()` --calls--> `connectDB()`  [INFERRED]
  services\notificationService.ts → lib\db.ts
- `deleteMediaIfPresent()` --calls--> `deleteFile()`  [INFERRED]
  services\kathaService.ts → services\uploadService.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `HomePage()` --calls--> `getFeaturedKathas()`  [INFERRED]
  app\(public)\page.tsx → services\kathaService.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (52): sitemap(), AudioPage(), GET(), POST(), GET(), POST(), PUT(), DELETE() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (39): PUT(), DELETE(), PATCH(), POST(), PUT(), generateMetadata(), GET(), POST() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (36): PUT(), DELETE(), GET(), PATCH(), POST(), isSearchQueryReady(), GET(), archiveKatha() (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (8): handleSubmit(), handleSubmit(), generateSlug(), loadEnv(), main(), parseArgs(), probeWithConcurrency(), handleSubmit()

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (16): isMediaFolder(), validateUpload(), cancelUploadSession(), chunkSize(), completeUploadSession(), createUploadSession(), pruneExpiredSessions(), readCompletion() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (15): GET(), POST(), GET(), PUT(), GET(), DELETE(), mutate(), POST() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (12): GET(), POST(), recordAudit(), createCategory(), deleteCategory(), getCategoriesWithCount(), getCategoryBySlug(), updateCategory() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.32
Nodes (15): asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField(), validateCategoryInput() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (2): getMediaUrl(), getThumbnailUrl()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (9): DELETE(), GET(), POST(), addFavorite(), asItemType(), getUserFavorites(), isFavorited(), removeFavorite() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (4): handleCreateKatha(), loadEntries(), removeEntry(), toggleExpand()

### Community 12 - "Community 12"
Cohesion: 0.27
Nodes (4): handleCreateKatha(), loadEntries(), removeEntry(), toggleExpand()

### Community 13 - "Community 13"
Cohesion: 0.27
Nodes (8): GET(), PATCH(), POST(), createNotification(), getNotifications(), getUnreadCount(), getUserNotifications(), markAsRead()

### Community 16 - "Community 16"
Cohesion: 0.53
Nodes (4): getSeriesId(), getSeriesSlug(), getSeriesTitle(), KathaArchive()

### Community 17 - "Community 17"
Cohesion: 0.47
Nodes (4): handleChange(), fetchWithRetry(), readPayload(), uploadMediaFile()

### Community 18 - "Community 18"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 22 - "Community 22"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 23 - "Community 23"
Cohesion: 0.83
Nodes (3): first(), parsePage(), parsePageSize()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (1): DomainError

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (2): loadEnv(), main()

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 8`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (12 nodes): `getMediaUrl()`, `media.ts`, `buildQueryString()`, `clamp()`, `formatCount()`, `formatDate()`, `formatDuration()`, `generateSlug()`, `getProgress()`, `getThumbnailUrl()`, `truncate()`, `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 6`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 3` to `Community 0`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 13`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 91 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 91 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `enforceRateLimit()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`enforceRateLimit()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PATCH()`) actually correct?**
  _`requireAdmin()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 11 INFERRED edges - model-reasoned connections that need verification._