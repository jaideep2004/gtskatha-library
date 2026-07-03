import Link from "next/link";
import { IContinueListening } from "@/types";
import { formatDuration, getProgress } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";

interface ContinueListeningProps {
	item?: IContinueListening & {
		katha?: {
			title: string;
			slug: string;
			type: "audio" | "video";
			thumbnail?: string;
			authorName?: string;
		};
	};
	dailyQuote?: string;
}

export default function ContinueListening({
	item,
	dailyQuote,
}: ContinueListeningProps) {
	const katha = item?.katha;
	const progress = item ? getProgress(item.currentTime, item.duration) : 0;
	return (
		<section className='cl-section'>
			<div className='container'>
				<div className='cl-grid'>
					{/* Left: Continue Your Journey — only when real data exists */}
					{item && katha && (
						<div className='cl-card'>
							<div className='cl-header'>
								<span className='cl-header-title'>ਆਪਣੀ ਯਾਤਰਾ ਜਾਰੀ ਰੱਖੋ</span>
								<Link href='/profile/favorites' className='cl-view-all'>
									ਸਭ ਵੇਖੋ
								</Link>
							</div>

							<div className='cl-thumb-wrap'>
								{katha.thumbnail ? (
									<img
										src={getMediaUrl("thumbnails", katha.thumbnail)}
										alt={katha.title}
										className='cl-thumb-img'
									/>
								) : (
									<div className='cl-thumb-bg' aria-hidden />
								)}
								<div className='cl-thumb-overlay' aria-hidden />
								<span className='cl-type-badge badge badge-audio'>
									{katha.type.toUpperCase()}
								</span>
								<button className='cl-play' aria-label='Play'>
									<svg
										width='24'
										height='24'
										viewBox='0 0 24 24'
										fill='currentColor'>
										<polygon points='5 3 19 12 5 21 5 3' />
									</svg>
								</button>
								<div className='cl-thumb-prog'>
									<div
										className='cl-thumb-prog-fill'
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>

							<div className='cl-info'>
								<p className='cl-title'>{katha.title}</p>
								<p className='cl-author'>{katha.authorName}</p>
								<p className='cl-time-label'>
									{formatDuration(item.duration - item.currentTime)} left &bull;{" "}
									{progress}%
								</p>
								<Link
									href={`/${katha.type}/${katha.slug}`}
									className='cl-resume-btn'>
									<svg
										width='13'
										height='13'
										viewBox='0 0 24 24'
										fill='currentColor'>
										<polygon points='5 3 19 12 5 21 5 3' />
									</svg>
									ਮੁੜ ਸੁਣੋ
								</Link>
							</div>
						</div>
					)}
					{!item && (
						<Link href='/audio' className='cl-card cl-empty-card'>
							<div>
								<span className='cl-empty-kicker'>ਆਪਣੀ ਯਾਤਰਾ ਜਾਰੀ ਰੱਖੋ</span>
								<h2>ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕੋਈ ਕਥਾ ਚੁਣੋ।</h2>
								<p>ਤੁਹਾਡੀ ਸੁਣਨ ਦੀ ਪ੍ਰਗਤੀ ਅਗਲੀ ਵਾਰ ਲਈ ਸੰਭਾਲੀ ਰਹੇਗੀ।</p>
							</div>
							<span className='cl-empty-action'>
								ਆਡੀਓ ਵੇਖੋ <b>→</b>
							</span>
						</Link>
					)}

					{/* Right: Daily Wisdom — only when configured */}
					{dailyQuote && (
						<div className='dw-card'>
							<div className='dw-header'>
								<span className='dw-quote-mark'>❝</span>
								<span className='dw-title'>ਅੱਜ ਦੀ ਸਿੱਖਿਆ</span>
							</div>

							<blockquote className='dw-gurmukhi text-gurmukhi'>
								{dailyQuote}
							</blockquote>

							{/* IMAGE SLOT: temple line art at /public/images/temple-outline.png */}
							<div className='dw-temple-bg' aria-hidden />
						</div>
					)}
					{!dailyQuote && (
						<div className='dw-card dw-empty'>
							<div className='dw-header'>
								<span className='dw-quote-mark'>❝</span>
								<span className='dw-title'>ਅੱਜ ਦੀ ਸਿੱਖਿਆ</span>
							</div>
							<p>ਅੱਜ ਦੀ ਸਿੱਖਿਆ ਜਲਦੀ ਇੱਥੇ ਆਵੇਗੀ।</p>
							<div className='dw-temple-bg' aria-hidden />
						</div>
					)}
				</div>
			</div>

			<style>{`
        .cl-section {
          padding: 32px 0 40px;
        }

        .cl-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .cl-card {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(180px, .9fr);
          column-gap: 18px;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        .cl-header { grid-column: 1 / -1; }
        .cl-empty-card { min-height: 228px; display: flex; flex-direction: column; justify-content: space-between; background: linear-gradient(120deg,#fff 0%,#fffaf2 100%); }
        .cl-empty-card h2 { font-size: 25px; margin: 10px 0 8px; }
        .cl-empty-card p { max-width: 430px; font-size: 14px; }
        .cl-empty-kicker { color: var(--color-primary-dark); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .cl-empty-action { color: var(--color-primary-dark); font-size: 13px; font-weight: 700; }

        .cl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .cl-header-title {
          font-family: var(--font-heading);
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .cl-view-all {
          font-size: 12.5px;
          color: var(--color-primary);
          font-weight: 500;
          text-decoration: none;
        }
        .cl-view-all:hover { text-decoration: underline; }

        .cl-thumb-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          background: #1e1a10;
          margin-bottom: 16px;
        }

        .cl-thumb-img,
        .cl-thumb-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-size: cover;
          background-position: center;
          background-color: #2a2210;
        }

        .cl-thumb-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%);
        }

        .cl-type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 9px;
          padding: 3px 8px;
          z-index: 1;
        }

        .cl-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          transition: transform 150ms ease;
        }
        .cl-play:hover { transform: translate(-50%, -50%) scale(1.06); }

        .cl-thumb-prog {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 4px;
          background: rgba(255,255,255,0.3);
          z-index: 1;
        }
        .cl-thumb-prog-fill {
          height: 100%;
          background: var(--color-primary);
        }

        .cl-info { padding: 8px 2px; align-self: center; }

        .cl-title {
          font-family: var(--font-heading);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .cl-author {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }

        .cl-time-label {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-bottom: 14px;
        }

        .cl-resume-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: var(--color-primary);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          font-family: var(--font-body);
          transition: background 150ms ease;
        }
        .cl-resume-btn:hover { background: var(--color-primary-dark); }

        .dw-card {
          background: #ffffff66;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 22px 24px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          background-image:url('/images/home-card-bg.png');
          background-size:cover;
              background-blend-mode: overlay;
        }
        .dw-empty { min-height: 228px; }
        .dw-empty > p { max-width: 260px; font-family: var(--font-heading); font-size: 22px; line-height: 1.45; color: var(--color-text-primary); }

        .dw-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .dw-quote-mark {
          font-size: 26px;
          color: var(--color-primary);
          line-height: 1;
          margin-top: -4px;
        }

        .dw-title {
          font-family: var(--font-heading);
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .dw-gurmukhi {
          font-family: var(--font-gurmukhi);
          font-size: 22px;
          font-weight: 600;
          color: var(--color-primary);
          line-height: 1.7;
          margin-bottom: 8px;
        }

        .dw-roman {
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
          font-style: italic;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .dw-divider-row { margin-bottom: 10px; }

        .dw-line {
          width: 48px;
          height: 2px;
          background: var(--color-border);
        }

        .dw-source {
          font-size: 13px;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .dw-temple-bg {
          position: absolute;
          right: -10px;
          bottom: -10px;
          width: 200px;
          height: 160px;
          background-image: url('/images/temple-outline.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: right bottom;
          opacity: 0.07;
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .cl-grid { grid-template-columns: 1fr; }
          .cl-thumb-wrap { height: 180px; }
        }
        @media (max-width: 560px) {
          .cl-card { grid-template-columns: 1fr; }
          .cl-header { grid-column: 1; }
          .cl-thumb-wrap { margin-bottom: 14px; }
        }
      `}</style>
		</section>
	);
}
