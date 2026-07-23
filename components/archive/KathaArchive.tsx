import Link from "next/link";
import { formatDate, formatDuration } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";
import type {
	ICategory,
	IKatha,
	ISeries,
	IFolder,
	IKathaParentAssociation,
} from "@/types";
import ArchivePlayButton from "@/components/archive/ArchivePlayButton";
import ArchiveTimeline from "@/components/archive/ArchiveTimeline";
import ArchiveFilters from "@/components/archive/ArchiveFilters";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/search";

interface ArchiveProps {
	type: "audio" | "video";
	kathas: IKatha[];
	categories: ICategory[];
	series: ISeries[];
	total: number;
	page: number;
	totalPages: number;
	query: {
		q?: string;
		category?: string;
		series?: string;
		sort?: string;
	};
	folders?: IFolder[];
	folderMap?: Record<string, IKatha[]>;
	uncategorized?: IKatha[];
	currentSeries?: ISeries | null;
	parentAssociations?: IKathaParentAssociation[];
}

interface Group {
	id: string;
	title: string;
	href: string | null;
	items: IKatha[];
	type: "series" | "paath" | "nittnem" | "other";
}

function pageHref(type: string, query: ArchiveProps["query"], page: number) {
	const params = new URLSearchParams();
	if (query.q) params.set("q", query.q);
	if (query.category) params.set("category", query.category);
	if (query.series) params.set("series", query.series);
	if (query.sort) params.set("sort", query.sort);
	params.set("page", String(page));
	return `/${type}?${params.toString()}`;
}

function getSeriesId(
	s: string | { _id: string; title?: string; slug?: string } | undefined | null,
): string | null {
	if (!s) return null;
	if (typeof s === "string") return s;
	return s._id || null;
}

function getSeriesTitle(
	s: string | { _id: string; title?: string; slug?: string } | undefined | null,
): string {
	if (!s) return "Other";
	if (typeof s === "string") return "Series";
	return s.title || s.slug || "Series";
}

function getSeriesSlug(
	s: string | { _id: string; title?: string; slug?: string } | undefined | null,
): string | null {
	if (!s) return null;
	if (typeof s === "string") return null;
	return s.slug || null;
}

export default function KathaArchive({
	type,
	kathas,
	categories,
	series,
	total,
	page,
	totalPages,
	query,
	folders,
	folderMap,
	uncategorized,
	currentSeries,
	parentAssociations,
}: ArchiveProps) {
	const audio = type === "audio";
	const title = audio ? "ਆਡੀਓ ਕਥਾ ਭੰਡਾਰ" : "ਵੀਡੀਓ ਕਥਾ ਭੰਡਾਰ";
	const description = audio
		? "ਸਤਿਕਾਰਯੋਗ ਰਾਗੀ ਜਥਿਆਂ ਅਤੇ ਕਥਾ ਵਾਚਕਾਂ ਦੀ ਪ੍ਰੇਰਕ ਕਥਾ ਸੁਣੋ।"
		: "ਸਤਿਕਾਰਯੋਗ ਵਕਤਾਵਾਂ ਦੀ ਗੁਰਬਾਣੀ ਵਿਚਾਰ ਅਤੇ ਆਤਮਕ ਕਥਾ ਵੇਖੋ।";
	const accent = audio ? "#d88717" : "#7354cf";

	const showFolderView =
		currentSeries && folders && folders.length > 0 && folderMap;

	const assocMap = new Map<string, IKathaParentAssociation>();
	if (parentAssociations) {
		for (const a of parentAssociations) assocMap.set(a.kathaId, a);
	}

	const groups: Group[] = [];
	if (!showFolderView && !currentSeries && kathas.length > 0) {
		const seriesMap = new Map<string, IKatha[]>();
		const assocGroupMap = new Map<
			string,
			{ title: string; href: string; items: IKatha[] }
		>();
		const ungrouped: IKatha[] = [];

		for (const k of kathas) {
			const sid = getSeriesId(k.seriesId);
			if (sid) {
				const list = seriesMap.get(sid) ?? [];
				list.push(k);
				seriesMap.set(sid, list);
			} else {
				const assoc = assocMap.get(k._id);
				if (assoc) {
					const key = `${assoc.type}::${assoc.parentId}`;
					const entry = assocGroupMap.get(key) ?? {
						title: assoc.title,
						href: `/${assoc.type}/${assoc.slug}`,
						items: [],
					};
					entry.items.push(k);
					assocGroupMap.set(key, entry);
				} else {
					ungrouped.push(k);
				}
			}
		}

		for (const [key, items] of seriesMap) {
			const first = items[0];
			const slug = getSeriesSlug(first?.seriesId);
			groups.push({
				id: key,
				title: getSeriesTitle(first?.seriesId),
				href: slug ? `/${type}?series=${slug}` : null,
				type: "series",
				items,
			});
		}

		for (const [key, entry] of assocGroupMap) {
			groups.push({
				id: key,
				title: entry.title,
				href: entry.href,
				type: entry.href.startsWith("/paath/") ? "paath" : "nittnem",
				items: entry.items,
			});
		}

		if (ungrouped.length > 0) {
			groups.push({
				id: "__none__",
				title: "Other",
				href: null,
				type: "other",
				items: ungrouped,
			});
		}
	}

	return (
		<main
			className={`archive-page archive-${type}`}
			style={{ "--archive-accent": accent } as React.CSSProperties}>
			<section className='archive-hero'>
				<div className='archive-hero-image' aria-hidden />
				<div className='archive-hero-shade' aria-hidden />
				<div className='container archive-hero-content'>
					<nav className='archive-breadcrumb'>
						<Link href='/'>ਮੁੱਖ ਪੰਨਾ</Link>
						<span>›</span>
						{currentSeries ? (
							<>
								<Link href={`/${type}`}>
									{audio ? "ਆਡੀਓ ਕਥਾ" : "ਵੀਡੀਓ ਕਥਾ"}
								</Link>
								<span>›</span>
								<b>{currentSeries.title}</b>
							</>
						) : (
							<b>{audio ? "ਆਡੀਓ ਕਥਾ" : "ਵੀਡੀਓ ਕਥਾ"}</b>
						)}
					</nav>
					<h1>{currentSeries ? currentSeries.title : title}</h1>
					<p>{currentSeries?.description || description}</p>
					<form className='archive-search'>
						<input type='hidden' name='category' value={query.category ?? ""} />
						<input type='hidden' name='series' value={query.series ?? ""} />
						<input type='hidden' name='sort' value={query.sort ?? ""} />
						{!currentSeries && (
							<>
								<label>
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										aria-hidden>
										<circle cx='11' cy='11' r='8' />
										<path d='m21 21-4.35-4.35' />
									</svg>
									<input
										name='q'
										defaultValue={query.q}
										minLength={MIN_SEARCH_QUERY_LENGTH}
										placeholder={`${audio ? "ਆਡੀਓ" : "ਵੀਡੀਓ"} ਕਥਾ, ਵਕਤਾ ਜਾਂ ਲੜੀ ਖੋਜੋ...`}
									/>
								</label>
								<button type='submit'>
									<svg
										width='18'
										height='18'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										aria-hidden>
										<path d='M3 4h18l-7 8v6l-4 2v-8L3 4Z' />
									</svg>
									Filter
								</button>
							</>
						)}
					</form>
				</div>
			</section>

			<section className='container archive-layout'>
				{!currentSeries && (
					<ArchiveFilters
						type={type}
						categories={categories}
						series={series}
						query={query}
					/>
				)}
				{currentSeries && <div />}

				<div className='archive-results'>
					{showFolderView ? (
						<>
							<header>
								<p>
									<strong>{total.toLocaleString()}</strong>{" "}
									{audio ? "ਆਡੀਓ" : "ਵੀਡੀਓ"}
								</p>
							</header>
							{folders!.map((folder) => {
								const folderKathas = folderMap![folder._id] || [];
								if (folderKathas.length === 0) return null;
								return (
									<div key={folder._id} className='af-section'>
										<div className='af-section-header'>
											<h3 className='af-section-title'>{folder.title}</h3>
											<span className='af-section-count'>
												{folderKathas.length}
											</span>
										</div>
										<div className='archive-grid'>
											{folderKathas.map((katha) => (
												<KathaCard
													key={katha._id}
													katha={katha}
													type={type}
													audio={audio}
												/>
											))}
										</div>
									</div>
								);
							})}
							{uncategorized && uncategorized.length > 0 && (
								<div className='af-section'>
									<div className='af-section-header'>
										<h3 className='af-section-title'>Other</h3>
										<span className='af-section-count'>
											{uncategorized.length}
										</span>
									</div>
									<div className='archive-grid'>
										{uncategorized.map((katha) => (
											<KathaCard
												key={katha._id}
												katha={katha}
												type={type}
												audio={audio}
											/>
										))}
									</div>
								</div>
							)}
						</>
					) : groups.length > 0 ? (
						<>
							<header>
								<p>
									<strong>{total.toLocaleString()}</strong>{" "}
									{audio ? "ਆਡੀਓ" : "ਵੀਡੀਓ"}
								</p>
							</header>
							{groups.map((group) => (
								<div key={group.id} className='af-section'>
									<div className='af-section-header'>
										{group.href ? (
											<Link href={group.href} className='af-section-title-link'>
												<h3 className='af-section-title'>{group.title}</h3>
												<svg
													width='14'
													height='14'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'>
													<path d='M5 12h14M12 5l7 7-7 7' />
												</svg>
											</Link>
										) : (
											<h3 className='af-section-title'>{group.title}</h3>
										)}
										<span className='af-section-count'>
											{group.items.length}
										</span>
									</div>
									<div className='archive-grid'>
										{group.items.map((katha) => (
											<KathaCard
												key={katha._id}
												katha={katha}
												type={type}
												audio={audio}
											/>
										))}
									</div>
								</div>
							))}
						</>
					) : (
						<>
							<header>
								<p>
									<strong>{total.toLocaleString()}</strong> ਨਤੀਜੇ ਮਿਲੇ
								</p>
								<span>ਚੁਣੀ ਹੋਈ ਡਿਜੀਟਲ ਲਾਇਬ੍ਰੇਰੀ</span>
							</header>
							{kathas.length ? (
								<div className='archive-grid'>
									{kathas.map((katha) => (
										<KathaCard
											key={katha._id}
											katha={katha}
											type={type}
											audio={audio}
										/>
									))}
								</div>
							) : (
								<div className='archive-empty'>
									<span>☬</span>
									<h2>ਮਿਲਦੀ ਕਥਾ ਨਹੀਂ ਲੱਭੀ</h2>
									<p>
										ਵੱਡੇ ਫਿਲਟਰਾਂ ਨਾਲ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਨਵੀਂ ਕਥਾ ਆਉਣ ਤੋਂ ਬਾਅਦ
										ਵੇਖੋ।
									</p>
								</div>
							)}
						</>
					)}

					{totalPages > 1 && (
						<nav className='archive-pagination' aria-label='Pagination'>
							{page > 1 && (
								<Link
									href={pageHref(type, query, page - 1)}
									aria-label='Previous page'>
									‹
								</Link>
							)}
							<span>
								ਪੰਨਾ {page} / {totalPages}
							</span>
							{page < totalPages && (
								<Link
									href={pageHref(type, query, page + 1)}
									aria-label='Next page'>
									›
								</Link>
							)}
						</nav>
					)}
				</div>
			</section>

			<style>{`
        .archive-page{min-height:100vh;background:#fbfaf7;padding-bottom:70px}
        .archive-hero{position:relative;min-height:335px;overflow:hidden;border-bottom:1px solid #e8e2d8}
        .archive-hero-image{position:absolute;inset:0;background:url('/images/archivebg.png') 73% 42%/cover no-repeat}
        .archive-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg, #fbfaf7 0%, rgba(251, 250, 247, .98) 30%, rgb(251 250 247 / 25%) 49%, rgba(251, 250, 247, .04) 76%)}
        .archive-hero-content{position:relative;z-index:1;padding-top:38px}
        .archive-breadcrumb{display:flex;gap:10px;align-items:center;font-size:14px;color:#667085;margin-bottom:18px}.archive-breadcrumb b{color:#27364d}
        .archive-hero h1{font-size:52px;max-width:680px;color:#142039;margin-bottom:10px}.archive-hero p{font-size:17px;line-height:1.7;max-width:600px;color:#40506a}
        .archive-search{display:grid;grid-template-columns:minmax(0,610px) 116px;gap:12px;margin-top:24px;max-width:750px}
        .archive-search label{height:52px;display:flex;align-items:center;gap:11px;padding:0 18px;background:rgba(255,255,255,.96);border:1px solid #dfe2e7;border-radius:7px;box-shadow:0 8px 25px rgba(20,32,57,.08)}
        .archive-search label svg{color:#293a53;flex:0 0 auto}.archive-search input{width:100%;border:0;outline:0;background:transparent;font-size:15px;color:#17233a}
        .archive-search button{display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:1px solid #dfe2e7;border-radius:7px;color:#17233a;font-size:14px;font-weight:700;box-shadow:0 8px 25px rgba(20,32,57,.08)}
        .archive-layout{
        display:grid;grid-template-columns:230px minmax(0,1fr);gap:18px;margin-top:20px;position:relative;z-index:2
        }
        .archive-filters,.archive-results{background:#fff;border:1px solid #e4e5e8;border-radius:8px}
        .archive-filters{padding:20px;align-self:start;margin-top:0}.archive-filter-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:15px;border-bottom:1px solid #eceef1}.archive-filter-head h2{font-family:var(--font-body);font-size:18px}.archive-filter-head a{font-size:13px;color:#68758a}
        .archive-filters fieldset{border:0;padding:19px 0;border-bottom:1px solid #eceef1}.archive-filters legend,.archive-select-label{font-size:14px;font-weight:700;color:#17233a}.archive-filters fieldset label{display:flex;gap:9px;align-items:center;margin-top:12px;font-size:13px;line-height:1.45;color:#526078}.archive-filters input{accent-color:var(--archive-accent)}
        .archive-select-label{display:block;padding-top:18px}.archive-select-label select{width:100%;height:44px;margin-top:9px;padding:0 11px;border:1px solid #dfe2e7;border-radius:6px;background:#fff;color:#48566c;font-size:13px}
        .archive-results{padding:20px}.archive-results>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;color:#68758a;font-size:14px}.archive-results>header strong{color:#17233a}.archive-results>header span{font-size:12px;text-transform:uppercase}
        .archive-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
        .af-section{margin-bottom:28px}
        .af-section-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--archive-accent)}
        .af-section-title{font-family:var(--font-heading);font-size:20px;font-weight:700;color:#142039;margin:0}
        .af-section-title-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:inherit;transition:color .15s ease}
        .af-section-title-link:hover{color:var(--archive-accent)}
        .af-section-title-link svg{opacity:0;transition:opacity .15s ease,transform .15s ease}
        .af-section-title-link:hover svg{opacity:1;transform:translateX(2px)}
        .af-section-count{font-size:12px;color:#68758a;background:#eceef1;padding:2px 10px;border-radius:999px}
        .archive-card{overflow:hidden;background:#fff;border:1px solid #dfe2e7;border-radius:7px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.archive-card:hover{transform:translateY(-4px);border-color:var(--archive-accent);box-shadow:0 14px 30px rgba(20,32,57,.11)}
        .archive-card-media{position:relative;aspect-ratio:1.9;background:#152238;overflow:hidden}.archive-card-media-link{position:absolute;inset:0;display:block}.archive-card-media img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}.archive-card:hover img{transform:scale(1.04)}
        .archive-card-media-link>b{position:absolute;top:9px;left:9px;padding:5px 8px;border-radius:4px;background:var(--archive-accent);color:#fff;font-size:10px;text-transform:uppercase}
        .archive-card-media-link time{position:absolute;right:7px;bottom:6px;padding:3px 6px;border-radius:3px;background:rgba(0,0,0,.78);color:#fff;font-size:11px}
        .archive-play{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:50%;background:#fff;color:#17233a;box-shadow:0 6px 18px rgba(0,0,0,.22);z-index:3;transition:transform .18s ease,background .18s ease}.archive-play:hover{transform:translate(-50%,-50%) scale(1.08);background:#fff8eb}
        .archive-placeholder{height:100%;display:grid;place-items:center;color:#d99525;font-size:34px}
        .archive-card-copy{display:block;padding:14px}.archive-card-copy h2{font-family:var(--font-body);font-size:16px;line-height:1.4;min-height:45px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.archive-card-copy p{font-size:13px;font-weight:600; color:#657085;margin:7px 0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.archive-card-copy footer{display:flex;justify-content:space-between;gap:7px;color:#69758a;font-size:11px}
        .archive-empty{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px dashed #ddd7cc;border-radius:7px}.archive-empty>span{font-size:44px;color:#d99525}.archive-empty h2{font-size:25px;margin:12px}.archive-empty p{font-size:14px}
        .archive-pagination{display:flex;align-items:center;justify-content:center;gap:13px;margin-top:26px}.archive-pagination a{width:38px;height:38px;display:grid;place-items:center;border:1px solid #dfe2e7;border-radius:6px;font-size:22px}.archive-pagination span{font-size:13px;color:#657085}
        @media(max-width:1150px){.archive-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:820px){.archive-hero{min-height:310px}.archive-hero-shade{background:linear-gradient(90deg, #fbfaf7 0%, rgba(251, 250, 247, .98) 30%, rgb(251 250 247 / 25%) 49%, rgba(251, 250, 247, .04) 76%)}.archive-layout{grid-template-columns:1fr;margin-top:16px}.archive-filters{order:0}.archive-filters form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.archive-filters fieldset{grid-column:1/-1}.archive-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.archive-hero{min-height:370px}.archive-hero-content{padding-top:28px}.archive-hero h1{font-size:37px}.archive-hero p{font-size:15px}.archive-search{grid-template-columns:1fr}.archive-search button{height:46px}.archive-filters form{grid-template-columns:1fr}.archive-grid{grid-template-columns:1fr;gap:12px}.archive-results{padding:12px}.archive-card-copy h2{font-size:16px;min-height:auto}.archive-play{width:40px;height:40px}}
      `}</style>
		</main>
	);
}

function KathaCard({
	katha,
	type,
	audio,
}: {
	katha: IKatha;
	type: string;
	audio: boolean;
}) {
	return (
		<article className='archive-card' key={katha._id}>
			<div className='archive-card-media'>
				<Link
					href={`/${katha.type}/${katha.slug}`}
					className='archive-card-media-link'>
					{katha.thumbnail ? (
						<img
							src={getMediaUrl("thumbnails", katha.thumbnail)}
							alt={katha.title}
							loading='lazy'
						/>
					) : (
						<span className='archive-placeholder'>☬</span>
					)}
					<b>{type}</b>
					{!!katha.duration && <time>{formatDuration(katha.duration)}</time>}
				</Link>
				<ArchivePlayButton katha={katha} />
			</div>
			<Link href={`/${katha.type}/${katha.slug}`} className='archive-card-copy'>
				<h2>{katha.title}</h2>
				<p>{katha.authorName || "Sikh Katha Digital Library"}</p>
				<footer>
					<span>{formatDate(katha.createdAt)}</span>
					<span>
						{(katha.views ?? 0).toLocaleString()} {audio ? "Plays" : "Views"}
					</span>
				</footer>
			</Link>
			{audio && <ArchiveTimeline katha={katha} />}
		</article>
	);
}
