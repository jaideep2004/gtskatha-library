# Graph Report - gts-katha  (2026-06-20)

## Corpus Check
- 148 files · ~694,891 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 388 nodes · 468 edges · 15 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 167 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 49 edges
2. `enforceRateLimit()` - 17 edges
3. `requireAdmin()` - 15 edges
4. `PUT()` - 12 edges
5. `validateKathaInput()` - 10 edges
6. `DELETE()` - 9 edges
7. `stringField()` - 9 edges
8. `GET()` - 8 edges
9. `asRecord()` - 8 edges
10. `getKathas()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `connectDB()`  [INFERRED]
  app\api\homepage\route.ts → lib\db.ts
- `connectDB()` --calls--> `getUnreadCount()`  [INFERRED]
  lib\db.ts → services\notificationService.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `AudioPage()` --calls--> `getKathas()`  [INFERRED]
  app\(public)\audio\page.tsx → services\kathaService.ts
- `generateMetadata()` --calls--> `getThumbnailUrl()`  [INFERRED]
  app\(public)\video\[slug]\page.tsx → lib\utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (33): sitemap(), AudioPage(), GET(), POST(), GET(), POST(), DELETE(), GET() (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (21): GET(), POST(), GET(), POST(), GET(), recordAudit(), archiveKatha(), assertKathaRelations() (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (19): POST(), POST(), GET(), PUT(), GET(), enforceRateLimit(), getClientAddress(), DELETE() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (18): requireAdmin(), requireUser(), isMediaFolder(), validateUpload(), GET(), PUT(), cancelUploadSession(), completeUploadSession() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (8): handleDelete(), handleSubmit(), handleSubmit(), generateSlug(), handleSubmit(), load(), handleDelete(), handleSubmit()

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (5): getMediaUrl(), getThumbnailUrl(), createFilename(), FileSystemStorageAdapter, safeFilename()

### Community 6 - "Community 6"
Cohesion: 0.3
Nodes (16): asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField(), validateCategoryInput() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (2): trackQualifiedView(), onTime()

### Community 8 - "Community 8"
Cohesion: 0.27
Nodes (8): GET(), PATCH(), POST(), createNotification(), getNotifications(), getUnreadCount(), getUserNotifications(), markAsRead()

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (2): ArchiveTimeline(), usePlayerContext()

### Community 10 - "Community 10"
Cohesion: 0.6
Nodes (3): createClient(), escapeHtml(), GmailSmtpAdapter

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): useTimelineInteractions(), TimelineCommunity()

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): fetchWithRetry(), handleChange()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): DomainError

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (2): loadEnv(), main()

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 7`** (14 nodes): `VideoPlayer.tsx`, `trackQualifiedView()`, `viewTracking.ts`, `handleFullscreen()`, `handleSeek()`, `onChapterSeek()`, `onDur()`, `onEnded()`, `onPause()`, `onTime()`, `resetControlsTimeout()`, `seekTo()`, `toggleMute()`, `togglePlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (5 nodes): `ArchiveTimeline()`, `ArchiveTimeline.tsx`, `PlayerProvider()`, `PlayerContext.tsx`, `usePlayerContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (4 nodes): `TimelineCommunity.tsx`, `useTimelineInteractions.ts`, `useTimelineInteractions()`, `TimelineCommunity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `fetchWithRetry()`, `handleChange()`, `FileUpload.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `loadEnv()`, `main()`, `migrate-katha-status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 0` to `Community 8`, `Community 1`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `generateSlug()` connect `Community 4` to `Community 0`, `Community 1`, `Community 5`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `enforceRateLimit()` (e.g. with `PUT()` and `POST()`) actually correct?**
  _`enforceRateLimit()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `requireAdmin()` (e.g. with `GET()` and `PUT()`) actually correct?**
  _`requireAdmin()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `PUT()` (e.g. with `requireAdmin()` and `enforceRateLimit()`) actually correct?**
  _`PUT()` has 9 INFERRED edges - model-reasoned connections that need verification._