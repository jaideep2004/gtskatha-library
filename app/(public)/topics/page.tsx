import Link from "next/link";
import type { Metadata } from "next";
import { getCategoriesWithCount } from "@/services/categoryService";
import { getMediaUrl } from "@/lib/media";
import { serializeForClient } from "@/lib/serialize";

export const metadata: Metadata = {
	title: "ਕਥਾ ਵਿਸ਼ੇ",
	description: "ਸਿੱਖ ਕਥਾ ਨੂੰ ਵਿਸ਼ੇ ਅਤੇ ਆਤਮਕ ਵਿਚਾਰ ਅਨੁਸਾਰ ਵੇਖੋ।",
};

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
	const categories = serializeForClient(await getCategoriesWithCount());

	return (
		<main className='topics-page'>
			<section className='topics-hero'>
				<div className='container'>
					<nav>
						<Link href='/'>ਮੁੱਖ ਪੰਨਾ</Link>
						<span>›</span>
						<b>ਵਿਸ਼ੇ</b>
					</nav>
					<p className='topics-kicker'>ਵਿਸ਼ਿਆਂ ਅਨੁਸਾਰ ਖੋਜੋ</p>
					<h1>ਕਥਾ ਵਿਸ਼ੇ</h1>
					<p>
						ਵਿਸ਼ੇ, ਪਰੰਪਰਾ, ਇਤਿਹਾਸ, ਅਤੇ ਰੋਜ਼ਾਨਾ ਆਤਮਕ ਅਭਿਆਸ ਅਨੁਸਾਰ ਸਿੱਖਿਆ ਲੱਭੋ।
					</p>
				</div>
			</section>
			<section className='container topics-grid'>
				{categories.map((category) => (
					<Link
						href={`/search?category=${category.slug}`}
						key={String(category._id)}
						className='topic-card'>
						<div>
							{category.thumbnail ? (
								<img
									src={getMediaUrl("thumbnails", category.thumbnail)}
									alt=''
								/>
							) : (
								<span aria-hidden>☬</span>
							)}
						</div>
						<section>
							<p>{category.kathaCount} ਕਥਾਵਾਂ</p>
							<h2>{category.name}</h2>
							<span>ਸੰਗ੍ਰਹਿ ਵੇਖੋ ›</span>
						</section>
					</Link>
				))}
				{!categories.length && (
					<div className='topics-empty'>
						<span>☬</span>
						<h2>ਹਾਲੇ ਕੋਈ ਵਿਸ਼ਾ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੋਇਆ</h2>
					</div>
				)}
			</section>
			<style>{`
        .topics-page{min-height:100vh;background:#fbfaf7;padding-bottom:80px}.topics-hero{min-height:300px;padding:48px 0;background:linear-gradient(90deg, rgba(251, 250, 247, .98), rgb(251 250 247 / 0%)), url(/images/archivebg.png) 72% 42% / cover no-repeat;border-bottom:1px solid #e7e1d7}.topics-hero nav{display:flex;gap:10px;font-size:12px;color:#68758a}.topics-kicker{margin-top:38px;font-size:10px!important;font-weight:700;letter-spacing:2px;color:#d88717!important}.topics-hero h1{font-size:48px;color:#142039;margin:8px 0}.topics-hero>div>p:last-child{max-width:550px;font-size:15px;color:#42516a}.topics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;padding-top:28px}.topic-card{background:#fff;border:1px solid #e1e3e6;border-radius:8px;overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}.topic-card:hover{transform:translateY(-4px);box-shadow:0 15px 32px rgba(20,32,57,.1)}.topic-card>div{height:150px;background:#152238;display:grid;place-items:center;overflow:hidden}.topic-card>div img{width:100%;height:100%;object-fit:cover}.topic-card>div span{font-size:46px;color:#d99525}.topic-card section{padding:16px}.topic-card section p{font-size:10px;text-transform:uppercase;color:#d88717}.topic-card h2{font-family:var(--font-body);font-size:17px;margin:5px 0 13px}.topic-card section span{font-size:11px;color:#657085}.topics-empty{grid-column:1/-1;min-height:300px;display:grid;place-items:center;text-align:center;border:1px dashed #ddd7cc}.topics-empty>span{font-size:44px;color:#d99525}@media(max-width:900px){.topics-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.topics-hero h1{font-size:36px}.topics-grid{gap:10px}.topic-card>div{height:110px}.topic-card section{padding:12px}.topic-card h2{font-size:14px}}
      `}</style>
		</main>
	);
}
