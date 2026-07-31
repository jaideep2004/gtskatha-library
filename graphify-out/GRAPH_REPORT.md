# Graph Report - gts-katha  (2026-07-31)

## Corpus Check
- 198 files · ~624,468 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 720 nodes · 1611 edges · 18 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 316 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `connectDB()` - 93 edges
2. `enforceRateLimit()` - 35 edges
3. `requireAdmin()` - 34 edges
4. `PUT()` - 16 edges
5. `recordAudit()` - 15 edges
6. `DELETE()` - 13 edges
7. `GET()` - 12 edges
8. `getKathas()` - 11 edges
9. `HomePage()` - 10 edges
10. `generateMetadata()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `sitemap()` --calls--> `connectDB()`  [INFERRED]
  app\sitemap.ts → lib\db.ts
- `GET()` --calls--> `connectDB()`  [INFERRED]
  app\api\admin\stats\route.ts → lib\db.ts
- `GET()` --calls--> `connectDB()`  [INFERRED]
  app\api\continue-listening\route.ts → lib\db.ts
- `POST()` --calls--> `connectDB()`  [INFERRED]
  app\api\continue-listening\route.ts → lib\db.ts
- `connectDB()` --calls--> `getUnreadCount()`  [INFERRED]
  lib\db.ts → services\notificationService.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (39): getSeriesId(), getSeriesSlug(), getSeriesTitle(), KathaArchive(), c_users_jaisi_documents_react_projects_gts_katha_components_archive_archivefilters, c_users_jaisi_documents_react_projects_gts_katha_components_archive_archiveplaybutton, c_users_jaisi_documents_react_projects_gts_katha_components_archive_archivetimeline, c_users_jaisi_documents_react_projects_gts_katha_components_archive_kathaarchive (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (23): c_users_jaisi_documents_react_projects_gts_katha_components_admin_adminthumbnail, c_users_jaisi_documents_react_projects_gts_katha_components_admin_bulkaudiokathaupload, c_users_jaisi_documents_react_projects_gts_katha_components_admin_fileupload, c_users_jaisi_documents_react_projects_gts_katha_components_layout_mobilemenudrawer, c_users_jaisi_documents_react_projects_gts_katha_components_layout_navbarsearch, c_users_jaisi_documents_react_projects_gts_katha_components_layout_usermenu, c_users_jaisi_documents_react_projects_gts_katha_lib_viewtracking, useTimelineInteractions() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (60): PUT(), DELETE(), PATCH(), POST(), PUT(), PUT(), c_users_jaisi_documents_react_projects_gts_katha_lib_apiauth, c_users_jaisi_documents_react_projects_gts_katha_lib_domainerror (+52 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (83): AudioPage(), GET(), GET(), GET(), GET(), POST(), connectDB(), isSearchQueryReady() (+75 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (63): sitemap(), GET(), bcryptjs, c_users_jaisi_documents_react_projects_gts_katha_components_admin_adminlayout, c_users_jaisi_documents_react_projects_gts_katha_components_dashboard_notificationlist, c_users_jaisi_documents_react_projects_gts_katha_components_dashboard_userdashboardshell, c_users_jaisi_documents_react_projects_gts_katha_components_home_audiothemes, c_users_jaisi_documents_react_projects_gts_katha_components_home_continuelistening (+55 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (16): c_users_jaisi_documents_react_projects_gts_katha_models_kathanote, fs, requireUser(), DELETE(), mutate(), POST(), mongoose, GET() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (25): c_users_jaisi_documents_react_projects_gts_katha_services_chunkuploadservice, c_users_jaisi_documents_react_projects_gts_katha_services_storageadapter, c_users_jaisi_documents_react_projects_gts_katha_services_uploadservice, crypto, getMediaUrl(), getThumbnailUrl(), promises, cancelUploadSession() (+17 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (17): arrowforward, bookmarkborderoutlined, c_users_jaisi_documents_react_projects_gts_katha_components_auth_authshell, c_users_jaisi_documents_react_projects_gts_katha_components_auth_forgotpassworddialog, categoryoutlined, dashboardoutlined, emailoutlined, headphonesoutlined (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.32
Nodes (15): asRecord(), booleanField(), chaptersField(), numberField(), objectIdField(), stringArrayField(), stringField(), validateCategoryInput() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (5): handleChange(), c_users_jaisi_documents_react_projects_gts_katha_lib_clientupload, fetchWithRetry(), readPayload(), uploadMediaFile()

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (5): c_users_jaisi_documents_react_projects_gts_katha_app_auth_auth_css, c_users_jaisi_documents_react_projects_gts_katha_components_layout_footer, c_users_jaisi_documents_react_projects_gts_katha_components_layout_mobilenav, c_users_jaisi_documents_react_projects_gts_katha_components_layout_navbar, c_users_jaisi_documents_react_projects_gts_katha_components_player_miniplayer

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (6): c_users_jaisi_documents_react_projects_gts_katha_services_email_emailprovider, c_users_jaisi_documents_react_projects_gts_katha_services_email_gmailsmtpadapter, createClient(), escapeHtml(), GmailSmtpAdapter, emailjs

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (3): config, core_web_vitals, typescript

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): c_users_jaisi_documents_react_projects_gts_katha_app_globals_css, c_users_jaisi_documents_react_projects_gts_katha_components_ui_toastprovider

### Community 14 - "Community 14"
Cohesion: 0.83
Nodes (3): first(), parsePage(), parsePageSize()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (1): DomainError

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (1): c_users_jaisi_documents_react_projects_gts_katha_next_dev_types_routes_d_ts

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): c_users_jaisi_documents_react_projects_gts_katha_components_home_recentlyadded

## Knowledge Gaps
- **1 isolated node(s):** `ValidationError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (4 nodes): `RootLayout()`, `layout.tsx`, `c_users_jaisi_documents_react_projects_gts_katha_app_globals_css`, `c_users_jaisi_documents_react_projects_gts_katha_components_ui_toastprovider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `DomainError`, `.constructor()`, `domainError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `c_users_jaisi_documents_react_projects_gts_katha_next_dev_types_routes_d_ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `c_users_jaisi_documents_react_projects_gts_katha_components_home_recentlyadded`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `connectDB()` connect `Community 3` to `Community 2`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 2` to `Community 3`, `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `enforceRateLimit()` connect `Community 2` to `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 92 inferred relationships involving `connectDB()` (e.g. with `sitemap()` and `HomePage()`) actually correct?**
  _`connectDB()` has 92 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ValidationError` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._