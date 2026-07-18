# Graph Report - .  (2026-07-18)

## Corpus Check
- 158 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 565 nodes · 1206 edges · 18 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 202 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 55 edges
2. `enforceRateLimit()` - 22 edges
3. `requireAdmin()` - 21 edges
4. `PUT()` - 12 edges
5. `getKathas()` - 11 edges
6. `validateKathaInput()` - 10 edges
7. `recordAudit()` - 10 edges
8. `DELETE()` - 9 edges
9. `stringField()` - 9 edges
10. `HomePage()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `generateSlug()`  [INFERRED]
  app\admin\kathas\page.tsx → lib\utils.ts
- `POST()` --calls--> `enforceRateLimit()`  [INFERRED]
  app\api\auth\forgot-password\route.ts → lib\rateLimit.ts
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `generateMetadata()` --calls--> `getThumbnailUrl()`  [INFERRED]
  app\(public)\video\[slug]\page.tsx → lib\utils.ts
- `restoreKatha()` --calls--> `load()`  [INFERRED]
  app\admin\archive\page.tsx → components\profile\FavoritesClient.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (37): ArchiveTimeline(), c_users_jaisi_documents_react_projects_gts_katha_components_archive_archivefilters, c_users_jaisi_documents_react_projects_gts_katha_components_archive_archiveplaybutton, c_users_jaisi_documents_react_projects_gts_katha_components_archive_archivetimeline, c_users_jaisi_documents_react_projects_gts_katha_components_katha_audiodetailclient, c_users_jaisi_documents_react_projects_gts_katha_components_katha_chapterslist, c_users_jaisi_documents_react_projects_gts_katha_components_katha_kathaactions, c_users_jaisi_documents_react_projects_gts_katha_components_katha_kathacard (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (82): sitemap(), AudioPage(), c_users_jaisi_documents_react_projects_gts_katha_components_dashboard_notificationlist, c_users_jaisi_documents_react_projects_gts_katha_lib_db, c_users_jaisi_documents_react_projects_gts_katha_models_auditlog, c_users_jaisi_documents_react_projects_gts_katha_models_category, c_users_jaisi_documents_react_projects_gts_katha_models_continuelistening, c_users_jaisi_documents_react_projects_gts_katha_models_favorite (+74 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (26): c_users_jaisi_documents_react_projects_gts_katha_components_admin_adminlayout, c_users_jaisi_documents_react_projects_gts_katha_components_profile_favoritesclient, c_users_jaisi_documents_react_projects_gts_katha_lib_apiauth, c_users_jaisi_documents_react_projects_gts_katha_lib_auth, c_users_jaisi_documents_react_projects_gts_katha_lib_domainerror, c_users_jaisi_documents_react_projects_gts_katha_lib_ratelimit, c_users_jaisi_documents_react_projects_gts_katha_lib_uploadpolicy, c_users_jaisi_documents_react_projects_gts_katha_lib_validation (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (38): DELETE(), PATCH(), POST(), POST(), PUT(), DELETE(), GET(), PATCH() (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (22): c_users_jaisi_documents_react_projects_gts_katha_services_storageadapter, crypto, getMediaUrl(), getThumbnailUrl(), promises, cancelUploadSession(), chunkSize(), completeUploadSession() (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (16): c_users_jaisi_documents_react_projects_gts_katha_app_globals_css, c_users_jaisi_documents_react_projects_gts_katha_components_archive_kathaarchive, c_users_jaisi_documents_react_projects_gts_katha_components_archive_seriesarchive, c_users_jaisi_documents_react_projects_gts_katha_components_home_audiothemes, c_users_jaisi_documents_react_projects_gts_katha_components_home_continuelistening, c_users_jaisi_documents_react_projects_gts_katha_components_home_herosection, c_users_jaisi_documents_react_projects_gts_katha_components_home_popularseries, c_users_jaisi_documents_react_projects_gts_katha_components_home_recentlyadded (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (12): hardDeleteKatha(), restoreKatha(), c_users_jaisi_documents_react_projects_gts_katha_components_admin_adminthumbnail, c_users_jaisi_documents_react_projects_gts_katha_components_admin_bulkaudiokathaupload, c_users_jaisi_documents_react_projects_gts_katha_components_admin_fileupload, handleDelete(), handleSubmit(), handleSubmit() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (17): arrowforward, bookmarkborderoutlined, c_users_jaisi_documents_react_projects_gts_katha_components_auth_authshell, c_users_jaisi_documents_react_projects_gts_katha_components_auth_forgotpassworddialog, categoryoutlined, dashboardoutlined, emailoutlined, headphonesoutlined (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (5): fs, mongoose, path, loadEnv(), main()

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (16): bcryptjs, c_users_jaisi_documents_react_projects_gts_katha_models_interactionsettings, c_users_jaisi_documents_react_projects_gts_katha_models_kathalike, c_users_jaisi_documents_react_projects_gts_katha_models_timelinecomment, c_users_jaisi_documents_react_projects_gts_katha_models_user, POST(), credentials, GET() (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (3): c_users_jaisi_documents_react_projects_gts_katha_lib_viewtracking, trackQualifiedView(), onTime()

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (6): c_users_jaisi_documents_react_projects_gts_katha_app_auth_auth_css, c_users_jaisi_documents_react_projects_gts_katha_components_dashboard_userdashboardshell, c_users_jaisi_documents_react_projects_gts_katha_components_layout_footer, c_users_jaisi_documents_react_projects_gts_katha_components_layout_mobilenav, c_users_jaisi_documents_react_projects_gts_katha_components_layout_navbar, c_users_jaisi_documents_react_projects_gts_katha_components_player_miniplayer

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (6): c_users_jaisi_documents_react_projects_gts_katha_services_email_emailprovider, c_users_jaisi_documents_react_projects_gts_katha_services_email_gmailsmtpadapter, createClient(), escapeHtml(), GmailSmtpAdapter, emailjs

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (1): c_users_jaisi_documents_react_projects_gts_katha_lib_clientupload

### Community 14 - "Community 14"
Cohesion: 0.6
Nodes (4): handleChange(), fetchWithRetry(), readPayload(), uploadMediaFile()

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (3): config, core_web_vitals, typescript

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (1): DomainError

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): c_users_jaisi_documents_react_projects_gts_katha_next_dev_types_routes_d_ts

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (9 nodes): `BulkAudioKathaUpload()`, `fileKey()`, `fileStem()`, `isArtworkFile()`, `isAudioFile()`, `splitIntoBatches()`, `titleFromFilename()`, `c_users_jaisi_documents_react_projects_gts_katha_lib_clientupload`, `BulkAudioKathaUpload.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `c_users_jaisi_documents_react_projects_gts_katha_next_dev_types_routes_d_ts`, `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 1` to `Community 8`, `Community 9`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 3` to `Community 9`, `Community 2`, `Community 4`, `Community 1`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `enforceRateLimit()` connect `Community 3` to `Community 9`, `Community 2`, `Community 1`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 54 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 54 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ValidationError` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._