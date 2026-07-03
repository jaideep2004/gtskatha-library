import Link from "next/link";
import { getMediaUrl } from "@/lib/media";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/search";
import type { ISeries } from "@/types";

interface Props {
	series: ISeries[];
	episodeCounts: Record<string, number>;
	q?: string;
}

export default function SeriesArchive({ series, episodeCounts, q }: Props) {
	return (
		<main className='series-archive'>
			<section className='sa-hero'>
				<div className='sa-photo' aria-hidden />
				<div className='sa-overlay' aria-hidden />
				<div className='container sa-copy'>
					<nav>
						<Link href='/'>ਮੁੱਖ ਪੰਨਾ</Link>
						<span>›</span>
						<b>ਲੜੀਆਂ</b>
					</nav>
					<h1>ਕਥਾ ਲੜੀਆਂ</h1>
					<p>ਗਹਿਰਾਈ ਨਾਲ ਲਗਾਤਾਰ ਸਿੱਖਣ ਲਈ ਸਜਾਈਆਂ ਹੋਈਆਂ ਕਥਾ ਲੜੀਆਂ ਵੇਖੋ।</p>
					<form>
						<label>
							<span>⌕</span>
							<input
								name='q'
								defaultValue={q}
								minLength={MIN_SEARCH_QUERY_LENGTH}
								placeholder='ਲੜੀ ਦਾ ਸਿਰਲੇਖ ਜਾਂ ਵਿਸ਼ਾ ਖੋਜੋ...'
							/>
						</label>
						<button>Search</button>
					</form>
				</div>
			</section>
			<section className='container sa-body'>
				<aside>
					<h2>ਸੰਗ੍ਰਹਿ</h2>
					<Link className={!q ? "active" : ""} href='/series'>
						ਸਾਰੀਆਂ ਲੜੀਆਂ <span>{series.length}</span>
					</Link>
					<Link href='/series?sort=featured'>ਖਾਸ ਪਹਿਲਾਂ</Link>
					<p>
						ਲੜੀਆਂ ਅਤੇ ਅਧਿਆਇਆਂ ਦੀ ਗਿਣਤੀ ਸਿੱਧੇ ਪ੍ਰਕਾਸ਼ਿਤ ਲਾਇਬ੍ਰੇਰੀ ਸਮੱਗਰੀ ਤੋਂ
						ਆਉਂਦੀ ਹੈ।
					</p>
				</aside>
				<div className='sa-results'>
					<header>
						<p>
							<strong>{series.length}</strong> ਲੜੀਆਂ ਮਿਲੀਆਂ
						</p>
					</header>
					{series.length ? (
						<div className='sa-grid'>
							{series.map((item) => (
								<Link
									href={`/series/${item.slug}`}
									className='sa-card'
									key={item._id}>
									<div>
										{item.thumbnail ? (
											<img
												src={getMediaUrl("series", item.thumbnail)}
												alt={item.title}
												loading='lazy'
											/>
										) : (
											<span>☬</span>
										)}
										<b>{episodeCounts[item._id] ?? 0} ਅਧਿਆਇ</b>
									</div>
									<section>
										<h2>{item.title}</h2>
										<p>
											{item.description ||
												"ਕੇਂਦਰਿਤ ਸਿੱਖਿਆ ਲਈ ਚੁਣਿਆ ਹੋਇਆ ਸਿੱਖ ਕਥਾ ਸੰਗ੍ਰਹਿ।"}
										</p>
										<footer>
											<span>
												{item.featured ? "ਖਾਸ ਲੜੀ" : "ਡਿਜੀਟਲ ਸੰਗ੍ਰਹਿ"}
											</span>
											<b>ਵੇਖੋ ›</b>
										</footer>
									</section>
								</Link>
							))}
						</div>
					) : (
						<div className='sa-empty'>
							<span>☬</span>
							<h2>ਮਿਲਦੀ ਲੜੀ ਨਹੀਂ ਲੱਭੀ</h2>
							<Link href='/series'>ਖੋਜ ਹਟਾਓ</Link>
						</div>
					)}
				</div>
			</section>
			<style>{`
        .series-archive{min-height:100vh;background:#fbfaf7;padding-bottom:70px}.sa-hero{position:relative;min-height:335px;overflow:hidden;border-bottom:1px solid #e7e1d7}.sa-photo{position:absolute;inset:0;background:url('/images/archivebg.png') 72% 42%/cover no-repeat}.sa-overlay{position:absolute;inset:0;background:linear-gradient(90deg, #fbfaf7 0%, rgba(251, 250, 247, .98) 31%, rgb(251 250 247 / 22%) 51%, transparent 78%)}.sa-copy{position:relative;padding-top:38px}.sa-copy nav{display:flex;gap:10px;font-size:14px;color:#667085}.sa-copy nav b{color:#27364d}.sa-copy h1{font-size:52px;color:#142039;margin:17px 0 10px}.sa-copy>p{font-size:17px;line-height:1.7;max-width:590px;color:#40506a}.sa-copy form{display:grid;grid-template-columns:minmax(0,580px) 105px;gap:12px;margin-top:24px;max-width:700px}.sa-copy label{height:52px;display:flex;align-items:center;gap:10px;padding:0 17px;background:#fff;border:1px solid #dfe2e7;border-radius:7px;box-shadow:0 8px 25px rgba(20,32,57,.08)}.sa-copy label span{font-size:24px}.sa-copy input{border:0;outline:0;width:100%;font-size:15px}.sa-copy button{background:#fff;border:1px solid #dfe2e7;border-radius:7px;font-size:14px;font-weight:700;color:#17233a}
        .sa-body{
        display:grid;grid-template-columns:230px 1fr;gap:18px;
        margin-top:20px;
        }
        .sa-body>aside,.sa-results{background:#fff;border:1px solid #e4e5e8;border-radius:8px;padding:20px}.sa-body>aside{align-self:start}.sa-body>aside h2{font-family:var(--font-body);font-size:18px;padding-bottom:15px;border-bottom:1px solid #eceef1}.sa-body>aside>a{min-height:46px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f1f3;font-size:13px;color:#59677d}.sa-body>aside>a.active{color:#7354cf;font-weight:700}.sa-body>aside p{font-size:13px;line-height:1.7;margin-top:18px}.sa-results>header{font-size:14px;color:#667085;margin-bottom:18px}.sa-results>header strong{color:#17233a}.sa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.sa-card{border:1px solid #dfe2e7;border-radius:7px;overflow:hidden;background:#fff;transition:transform .2s ease,box-shadow .2s ease}.sa-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(20,32,57,.11)}.sa-card>div{position:relative;aspect-ratio:1.55;background:#152238;overflow:hidden}.sa-card>div img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}.sa-card:hover img{transform:scale(1.04)}.sa-card>div>span{height:100%;display:grid;place-items:center;color:#d99525;font-size:36px}.sa-card>div>b{position:absolute;right:7px;bottom:7px;background:rgba(0,0,0,.78);color:#fff;padding:4px 7px;border-radius:4px;font-size:11px}.sa-card>section{padding:14px}.sa-card h2{font-family:var(--font-body);font-size:16px;line-height:1.4}.sa-card p{font-size:13px;line-height:1.6;margin:8px 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:42px}.sa-card footer{display:flex;justify-content:space-between;font-size:11px;color:#69758a}.sa-card footer b{color:#7354cf}.sa-empty{min-height:360px;display:grid;place-items:center;text-align:center}.sa-empty>span{font-size:44px;color:#d99525}.sa-empty h2{font-size:25px}.sa-empty a{font-size:14px;color:#7354cf}
        @media(max-width:1150px){.sa-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:820px){.sa-overlay{background:linear-gradient(90deg,rgba(251,250,247,.98),rgba(251,250,247,.78))}.sa-body{grid-template-columns:1fr;margin-top:16px}.sa-body>aside{display:none}.sa-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.sa-hero{min-height:365px}.sa-copy{padding-top:28px}.sa-copy h1{font-size:37px}.sa-copy>p{font-size:15px}.sa-copy form{grid-template-columns:1fr}.sa-copy button{height:46px}.sa-grid{grid-template-columns:1fr;gap:12px}.sa-results{padding:12px}.sa-card footer{gap:4px}}
      `}</style>
		</main>
	);
}
