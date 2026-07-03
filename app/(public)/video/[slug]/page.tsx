import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import VideoPlayer from "@/components/player/VideoPlayer";
import VideoDetailClient from "@/components/katha/VideoDetailClient";
import ChaptersList from "@/components/katha/ChaptersList";
import TabContent from "@/components/katha/TabContent";
import ShareButtons from "@/components/katha/ShareButtons";
import { getKathaBySlug, getKathas } from "@/services/kathaService";
import { formatDuration, formatDate, getThumbnailUrl } from "@/lib/utils";
import { IKatha, ISeries, ICategory } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMediaUrl } from "@/lib/media";
import { serializeForClient } from "@/lib/serialize";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const katha = (await getKathaBySlug(slug)) as IKatha | null;
	if (!katha) return { title: "Video Not Found" };
	return {
		title: katha.title,
		description: katha.description,
		openGraph: {
			title: katha.title,
			description: katha.description,
			images: katha.thumbnail ? [getThumbnailUrl(katha.thumbnail)] : [],
		},
	};
}

export default async function VideoDetailPage({ params }: PageProps) {
	const { slug } = await params;

	const rawKatha = (await getKathaBySlug(slug)) as IKatha | null;
	if (!rawKatha || rawKatha.type !== "video") notFound();

	const katha = serializeForClient(rawKatha);
	const series =
		typeof katha.seriesId === "object" ? (katha.seriesId as ISeries) : null;
	const category =
		typeof katha.categoryId === "object"
			? (katha.categoryId as ICategory)
			: null;

	// Related videos — same series or recent
	let relatedVideos: IKatha[] = [];
	try {
		const seriesId = series
			? (series as ISeries & { _id: string })._id
			: undefined;
		const result = await getKathas({
			type: "video",
			series: seriesId,
			limit: 6,
			sort: "newest",
		});
		relatedVideos = (serializeForClient(result.data) as unknown as IKatha[])
			.filter((v) => v.slug !== slug)
			.slice(0, 4);
	} catch {
		// ignore
	}

	const session = await getServerSession(authOptions);
	const isAuthenticated = !!session?.user;

	const videoSrc = katha.videoUrl
		? getMediaUrl("video", katha.videoUrl)
		: undefined;

	return (
		<div className='page-section'>
			<div className='container'>
				<nav className='breadcrumb' aria-label='Breadcrumb'>
					<Link href='/'>ਮੁੱਖ ਪੰਨਾ</Link>
					<span className='breadcrumb-sep'>›</span>
					<Link href='/video'>ਵੀਡੀਓ</Link>
					{series && (
						<>
							<span className='breadcrumb-sep'>›</span>
							<Link href={`/series/${series.slug}`}>{series.title}</Link>
						</>
					)}
					<span className='breadcrumb-sep'>›</span>
					<span>{katha.title}</span>
				</nav>

				<div className='video-top-grid'>
					<VideoPlayer
						kathaId={katha._id}
						videoUrl={videoSrc}
						thumbnail={katha.thumbnail}
						title={katha.title}
					/>
					<aside className='video-chapters-panel'>
						<div className='video-chapters-head'>
							<h2>ਅਧਿਆਇ</h2>
							<span>{katha.chapters?.length ?? 0} ਭਾਗ</span>
						</div>
						{(katha.chapters?.length ?? 0) > 0 ? (
							<ChaptersList chapters={katha.chapters ?? []} mediaType='video' />
						) : (
							<div className='video-chapters-empty'>
								ਅਧਿਆਇ ਜੋੜੇ ਜਾਣ ਤੋਂ ਬਾਅਦ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ।
							</div>
						)}
					</aside>
				</div>

				<div className='video-detail-layout'>
					{/* Main */}
					<div className='video-detail-main'>
						{series && (
							<Link
								href={`/series/${series.slug}`}
								className='video-series-label'>
								{series.title}
							</Link>
						)}

						<h1 className='video-detail-title'>{katha.title}</h1>

						<div className='video-detail-meta'>
							<div className='video-author'>
								<div className='video-author-avatar'>S</div>
								<div>
									<div className='video-author-name'>
										{katha.authorName ?? "Sikh Katha Library"}
										<svg
											width='14'
											height='14'
											viewBox='0 0 24 24'
											fill='#C8972A'
											aria-label='Verified'>
											<path d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' />
										</svg>
									</div>
									<div className='video-author-label'>ਅਧਿਕਾਰਤ ਚੈਨਲ</div>
								</div>
							</div>

							<div className='video-meta-stats'>
								<span>{katha.views.toLocaleString()} views</span>
								<span>·</span>
								<span>{formatDate(katha.createdAt)}</span>
								{katha.duration && (
									<>
										<span>·</span>
										<span>{formatDuration(katha.duration)}</span>
									</>
								)}
							</div>
						</div>

						{/* Client: Save/Share buttons */}
						<VideoDetailClient
							katha={katha}
							isAuthenticated={isAuthenticated}
						/>

						<div style={{ marginTop: "var(--space-6)" }}>
							<TabContent
								katha={katha}
								categorySlug={category?.slug}
								categoryName={category?.name}
								isAuthenticated={isAuthenticated}
							/>
						</div>
					</div>

					{/* Sidebar */}
					<aside className='video-sidebar'>
						{/* Related / Continue Learning */}
						{relatedVideos.length > 0 && (
							<div className='sidebar-card'>
								<h3 className='sidebar-card-title'>
									{series ? "ਇਸ ਲੜੀ ਵਿੱਚ ਹੋਰ" : "ਸਿੱਖਿਆ ਜਾਰੀ ਰੱਖੋ"}
								</h3>
								<ul className='related-list'>
									{relatedVideos.map((r) => (
										<li key={r._id}>
											<Link href={`/video/${r.slug}`} className='related-item'>
												<div className='related-thumb'>
													{r.thumbnail ? (
														<img
															src={getThumbnailUrl(r.thumbnail)}
															alt={r.title}
															style={{
																width: "100%",
																height: "100%",
																objectFit: "cover",
																borderRadius: "var(--radius-md)",
															}}
														/>
													) : (
														<svg
															width='16'
															height='16'
															viewBox='0 0 24 24'
															fill='currentColor'
															style={{ color: "var(--color-primary)" }}>
															<polygon points='5 3 19 12 5 21 5 3' />
														</svg>
													)}
												</div>
												<div className='related-info'>
													<span className='related-title'>{r.title}</span>
													<span className='related-meta'>
														{r.duration ? formatDuration(r.duration) : ""}
														{r.duration && r.views ? " · " : ""}
														{r.views ? `${r.views.toLocaleString()} views` : ""}
													</span>
												</div>
											</Link>
										</li>
									))}
								</ul>
								{series && (
									<Link
										href={`/series/${series.slug}`}
										className='btn btn-outline btn-sm'
										style={{
											marginTop: "var(--space-4)",
											width: "100%",
											justifyContent: "center",
										}}>
										ਸਾਰੇ ਅਧਿਆਇ ਵੇਖੋ
									</Link>
								)}
							</div>
						)}

						{/* About Series */}
						{series && (
							<div className='sidebar-card'>
								<h3 className='sidebar-card-title'>ਲੜੀ ਬਾਰੇ</h3>
								<div className='series-sidebar-thumb'>
									{series.thumbnail ? (
										<img
											src={getMediaUrl("series", series.thumbnail)}
											alt={series.title}
											style={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
												borderRadius: "var(--radius-md)",
											}}
										/>
									) : (
										<span
											style={{ fontSize: 40, color: "var(--color-primary)" }}>
											☬
										</span>
									)}
								</div>
								<p className='series-sidebar-title'>{series.title}</p>
								{series.description && (
									<p className='series-sidebar-desc'>{series.description}</p>
								)}
								<Link
									href={`/series/${series.slug}`}
									className='btn btn-outline btn-sm'
									style={{ marginTop: "var(--space-4)" }}>
									ਲੜੀ ਵੇਖੋ
								</Link>
							</div>
						)}

						{/* Share */}
						<div className='sidebar-card'>
							<h3 className='sidebar-card-title'>ਇਹ ਕਥਾ ਸਾਂਝੀ ਕਰੋ</h3>
							<ShareButtons title={katha.title} />
						</div>
						{katha.tags?.length > 0 && (
							<div className='sidebar-card'>
								<h3 className='sidebar-card-title'>ਟੈਗ</h3>
								<div className='video-tags sidebar-tags'>
									{katha.tags.map((tag) => (
										<Link
											key={tag}
											href={`/search?q=${tag}`}
											className='video-tag'>
											#{tag}
										</Link>
									))}
								</div>
							</div>
						)}
					</aside>
				</div>
			</div>

			<style>{`
        .page-section {
          padding-top: 28px;
          background: #fdfbf7;
        }

        .video-top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 24px;
          align-items: stretch;
        }

        .video-top-grid :global(.video-player-container) {
          border-radius: 8px;
          box-shadow: 0 18px 40px rgba(18, 26, 37, .13);
        }

        .video-chapters-panel {
          min-height: 100%;
          padding: 20px 10px 14px;
          background: #fff;
          border: 1px solid #e6e1d8;
          border-radius: 8px;
          box-shadow: 0 10px 28px rgba(28, 35, 45, .05);
          overflow: hidden;
        }

        .video-chapters-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px 15px;
          border-bottom: 1px solid #eee9df;
        }

        .video-chapters-head h2 {
          font-family: var(--font-body);
          font-size: 19px;
        }

        .video-chapters-head span {
          color: #8a7c68;
          font-size: 12px;
        }

        .video-chapters-panel :global(.chapters-list) {
          max-height: 430px;
          padding-top: 8px;
        }

        .video-chapters-panel :global(.chapter-item) {
          min-height: 62px;
          border-radius: 6px;
        }

        .video-chapters-panel :global(.chapter-title) {
          font-size: 13px;
          white-space: normal;
          line-height: 1.45;
        }

        .video-chapters-empty {
          min-height: 250px;
          display: grid;
          place-items: center;
          padding: 25px;
          color: #8b8f96;
          text-align: center;
          font-size: 13px;
        }

        .video-detail-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
          margin-top: 26px;
        }

        .video-series-label {
          display: inline-block;
          font-size: 11px; font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase; letter-spacing: 1px;
          text-decoration: none; margin-bottom: 10px;
          padding: 5px 9px;
          border-radius: 5px;
          background: #fbf0df;
        }
        .video-series-label:hover { text-decoration: underline; }

        .video-detail-title {
          font-family: var(--font-heading);
          font-size: 39px; font-weight: 700;
          margin-bottom: 14px; line-height: 1.15;
          color: #162033;
        }

        .video-detail-meta {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: var(--space-4); flex-wrap: wrap;
          padding-bottom: 16px;
          border-bottom: 1px solid #e7e1d7;
        }

        .video-author { display: flex; align-items: center; gap: var(--space-3); }
        .video-author-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--color-primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
        }
        .video-author-name {
          font-size: 15px; font-weight: 600;
          color: var(--color-text-primary);
          display: flex; align-items: center; gap: 4px;
        }
        .video-author-label { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }

        .video-meta-stats {
          display: flex; align-items: center; gap: var(--space-2);
          font-size: 13px; color: var(--color-text-muted);
        }

        .video-tags { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3); }
        .sidebar-tags { margin-top: 0; }
        .video-tag {
          font-size: var(--font-size-xs); color: var(--color-text-muted);
          background: var(--color-bg-secondary); padding: 2px 8px;
          border-radius: var(--radius-full); text-decoration: none;
          transition: all var(--transition-fast);
        }
        .video-tag:hover { background: var(--color-primary-alpha); color: var(--color-primary); }

        .video-detail-main :global(.video-action-bar) {
          padding: 4px 0 8px;
        }

        .video-detail-main :global(.video-action-bar button),
        .video-detail-main :global(.video-action-bar a) {
          min-height: 44px;
          border-radius: 7px;
        }

        .video-detail-main :global(.tabs) {
          margin-bottom: 0;
          padding: 0 10px;
          gap: 42px;
          border-bottom: 1px solid #e1dbd0;
        }

        .video-detail-main :global(.tab-panels) {
          min-height: 300px;
          margin-top: 12px;
          padding: 0 24px;
          border: 1px solid #e6e1d8;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(28,35,45,.035);
        }

        .video-detail-main :global(.tab-panel h3) { font-size: 22px; }
        .video-detail-main :global(.tab-panel p),
        .video-detail-main :global(.takeaway-item) {
          font-size: 14px;
          line-height: 1.75;
        }

        .video-tab-content { padding: var(--space-6) 0; }
        .video-tab-content h3 { font-size: var(--font-size-lg); margin-bottom: var(--space-3); }
        .video-tab-content p { margin-bottom: var(--space-3); }

        .video-category-link { color: var(--color-primary); text-decoration: underline; }

        .video-sidebar {
          display: flex; flex-direction: column; gap: var(--space-5);
          position: sticky; top: calc(var(--navbar-height) + var(--space-4));
        }

        .sidebar-card {
          background: var(--color-surface);
          border: 1px solid #e6e1d8;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(28,35,45,.04);
        }
        .sidebar-card-title {
          font-family: var(--font-body);
          font-size: 17px; font-weight: 700;
          text-transform: none; letter-spacing: 0;
          color: #1c2638; margin-bottom: 16px;
        }

        .related-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .related-item {
          display: flex; gap: var(--space-3); align-items: center;
          text-decoration: none; transition: opacity var(--transition-fast);
        }
        .related-item:hover { opacity: 0.75; }
        .related-thumb {
          width: 56px; height: 40px; border-radius: var(--radius-sm);
          background: var(--color-bg-secondary);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0; overflow: hidden;
        }
        .related-info { flex: 1; min-width: 0; }
        .related-title {
          display: block; font-size: 13px; font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .related-meta { font-size: 11px; color: var(--color-text-muted); }

        .series-sidebar-thumb {
          height: 80px; display: flex; align-items: center; justify-content: center;
          background: var(--color-bg-secondary); border-radius: var(--radius-md);
          margin-bottom: var(--space-3); overflow: hidden;
        }
        .series-sidebar-title {
          font-size: var(--font-size-sm); font-weight: 600;
          color: var(--color-text-primary); margin-bottom: var(--space-2);
        }
        .series-sidebar-desc {
          font-size: var(--font-size-xs); color: var(--color-text-muted); line-height: 1.5;
        }

        .share-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
        .share-btn {
          padding: var(--space-2); border-radius: var(--radius-md);
          border: 1px solid var(--color-border); background: transparent;
          font-size: var(--font-size-xs); font-weight: 500;
          color: var(--color-text-secondary); cursor: pointer;
          transition: all var(--transition-fast); font-family: var(--font-body);
        }
        .share-btn:hover {
          background: var(--color-primary-alpha);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        @media (max-width: 1100px) {
          .video-top-grid { grid-template-columns: 1fr; }
          .video-chapters-panel { min-height: auto; }
          .video-chapters-panel :global(.chapters-list) { max-height: 300px; }
          .video-detail-layout { grid-template-columns: 1fr; }
          .video-sidebar { position: static; }
        }
        @media (max-width: 640px) {
          .page-section { padding-top: 16px; }
          .video-detail-title { font-size: 31px; }
          .video-detail-meta { flex-direction: column; align-items: flex-start; }
          .video-detail-main :global(.tabs) { gap: 24px; overflow-x: auto; }
          .video-detail-main :global(.tab-panels) { padding: 0 16px; }
        }
      `}</style>
		</div>
	);
}
