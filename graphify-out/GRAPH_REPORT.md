# Graph Report - gts-katha  (2026-08-05)

## Corpus Check
- 200 files · ~626,207 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 609 nodes · 845 edges · 23 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 304 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 93 edges
2. `requireAdmin()` - 35 edges
3. `enforceRateLimit()` - 35 edges
4. `PUT()` - 16 edges
5. `recordAudit()` - 15 edges
6. `DELETE()` - 13 edges
7. `GET()` - 12 edges
8. `getKathas()` - 12 edges
9. `generateMetadata()` - 10 edges
10. `validateKathaInput()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `connectDB()` --calls--> `incrementViews()`  [INFERRED]
  lib\db.ts → services\kathaService.ts
- `connectDB()` --calls--> `getUnreadCount()`  [INFERRED]
  lib\db.ts → services\notificationService.ts
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
Cohesion: 0.06
Nodes (50): PUT(), DELETE(), PATCH(), POST(), PUT(), PUT(), DELETE(), GET() (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (23): requireAdmin(), requireUser(), isMediaFolder(), validateUpload(), GET(), PUT(), cancelUploadSession(), chunkSize() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (4): handleSubmit(), handleSubmit(), generateSlug(), handleSubmit()

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (19): generateMetadata(), GET(), POST(), PUT(), POST(), DELETE(), PUT(), enforceRateLimit() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (15): GET(), POST(), GET(), PUT(), GET(), DELETE(), mutate(), POST() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (5): getMediaUrl(), getThumbnailUrl(), createFilename(), FileSystemStorageAdapter, safeFilename()

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (11): GET(), POST(), createCategory(), deleteCategory(), getCategoriesWithCount(), getCategoryBySlug(), updateCategory(), getAdminKathaBySlug() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.32
Nodes (15): asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField(), validateCategoryInput() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (8): angFromFilename(), compareFilesByAng(), leadingNumber(), loadEnv(), main(), panktiFromFilename(), parseArgs(), probeWithConcurrency()

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (9): DELETE(), GET(), POST(), addFavorite(), asItemType(), getUserFavorites(), isFavorited(), removeFavorite() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.27
Nodes (4): handleCreateKatha(), loadEntries(), removeEntry(), toggleExpand()

### Community 13 - "Community 13"
Cohesion: 0.27
Nodes (4): handleCreateKatha(), loadEntries(), removeEntry(), toggleExpand()

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (8): GET(), PATCH(), POST(), createNotification(), getNotifications(), getUnreadCount(), getUserNotifications(), markAsRead()

### Community 17 - "Community 17"
Cohesion: 0.53
Nodes (4): getSeriesId(), getSeriesSlug(), getSeriesTitle(), KathaArchive()

### Community 18 - "Community 18"
Cohesion: 0.47
Nodes (4): handleChange(), fetchWithRetry(), readPayload(), uploadMediaFile()

### Community 19 - "Community 19"
Cohesion: 0.47
Nodes (3): loadEnv(), main(), parseArgs()

### Community 20 - "Community 20"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 24 - "Community 24"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 25 - "Community 25"
Cohesion: 0.83
Nodes (3): first(), parsePage(), parsePageSize()

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (1): DomainError

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): loadEnv(), main()

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 9`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 7`, `Community 11`, `Community 14`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 3` to `Community 0`, `Community 1`, `Community 10`, `Community 7`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 7`, `Community 14`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 92 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 92 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PATCH()`) actually correct?**
  _`requireAdmin()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `enforceRateLimit()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`enforceRateLimit()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 11 INFERRED edges - model-reasoned connections that need verification._