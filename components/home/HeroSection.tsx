"use client";

import Link from "next/link";
import { IKatha } from "@/types";
import { usePlayerContext } from "@/context/PlayerContext";
import { formatDuration } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";

interface HeroSectionProps {
	heroKatha?: IKatha | null;
}

const QUICK_LINKS = [
	{
		href: "/audio",
		label: "ਆਡੀਓ ਕਥਾ",
		sub: "ਕਿਤੇ ਵੀ ਸੁਣੋ",
		tint: "#FFF4E6",
		iconColor: "#D98C29",
		icon: (
			<svg
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.75'>
				<path d='M9 18V5l12-2v13' />
				<circle cx='6' cy='18' r='3' />
				<circle cx='18' cy='16' r='3' />
			</svg>
		),
	},
	{
		href: "/video",
		label: "ਵੀਡੀਓ ਕਥਾ",
		sub: "ਵੇਖੋ ਤੇ ਸਿੱਖੋ",
		tint: "#F3EEFF",
		iconColor: "#7C5CBF",
		icon: (
			<svg
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.75'>
				<polygon points='23 7 16 12 23 17 23 7' />
				<rect x='1' y='5' width='15' height='14' rx='2' />
			</svg>
		),
	},
	{
		href: "/series",
		label: "ਲੜੀਆਂ",
		sub: "ਗਹਿਰਾਈ ਨਾਲ ਸਿੱਖੋ",
		tint: "#EEF8F0",
		iconColor: "#3D9B5F",
		icon: (
			<svg
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.75'>
				<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' />
			</svg>
		),
	},
	{
		href: "/topics",
		label: "ਵਿਸ਼ੇ",
		sub: "ਵਿਸ਼ੇ ਅਨੁਸਾਰ ਖੋਜੋ",
		tint: "#FFF4E6",
		iconColor: "#D98C29",
		icon: (
			<svg
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.75'>
				<rect x='3' y='3' width='7' height='7' rx='1' />
				<rect x='14' y='3' width='7' height='7' rx='1' />
				<rect x='3' y='14' width='7' height='7' rx='1' />
				<rect x='14' y='14' width='7' height='7' rx='1' />
			</svg>
		),
	},
	{
		href: "/profile/favorites",
		label: "ਮੇਰੀ ਲਾਇਬ੍ਰੇਰੀ",
		sub: "ਸੰਭਾਲੀ ਕਥਾ",
		tint: "#EEF4FF",
		iconColor: "#4A7FD4",
		icon: (
			<svg
				width='20'
				height='20'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.75'>
				<path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
			</svg>
		),
	},
];

export default function HeroSection({ heroKatha }: HeroSectionProps) {
	const {
		play,
		katha: playingKatha,
		isPlaying,
		pause,
		resume,
	} = usePlayerContext();
	const waveHeights = [
		6, 10, 16, 12, 20, 14, 8, 18, 13, 22, 17, 11, 19, 15, 7, 21, 11, 16, 9, 18,
		13, 8, 20, 12, 16, 10, 14, 19, 7, 22, 11, 15,
	];

	const cardKatha = heroKatha ?? playingKatha;
	const cardTitle = cardKatha?.title ?? "";
	const cardDuration = cardKatha?.duration
		? formatDuration(cardKatha.duration)
		: "";
	const isCardPlaying = playingKatha?.slug === cardKatha?.slug && isPlaying;

	function handleCardPlay() {
		if (!cardKatha) return;
		if (playingKatha?.slug === cardKatha.slug) {
			if (isPlaying) {
				pause();
			} else {
				resume();
			}
		} else {
			play(cardKatha);
		}
	}

	return (
		<section className='h-section'>
			<div className='h-bg' aria-hidden>
				<div
					className='h-bg-photo'
					style={{ backgroundImage: "url('/images/gtshero1.png')" }}
				/>
				<div className='h-bg-overlay' />
			</div>
			<div className='h-ik-onkar' aria-hidden>ੴ</div>

			<div className='h-inner container'>
				<div className='h-text'>
					<p className='h-eyebrow'>ਸਦੀਵੀ ਸਿੱਖਿਆ। ਗਹਿਰਾ ਅਸਰ।</p>

					<h1 className='h-headline'>
						ਪ੍ਰੇਰਣਾ ਬਖ਼ਸ਼ਣ ਵਾਲੀਆਂ ਕਥਾਵਾਂ।
						<br />
						<em className='h-gold'>ਜੀਵਨ ਨੂੰ ਬਦਲਣ ਵਾਲਾ ਗੁਰਮਤਿ ਗਿਆਨ।</em>
					</h1>

					<p className='h-sub'>
						<b>ਗਿਆਨੀ ਠਾਕੁਰ ਸਿੰਘ ਜੀ</b> ਦੀ ਆਡੀਓ ਤੇ ਵੀਡੀਓ ਕਥਾ ਰਾਹੀਂ ਗੁਰਬਾਣੀ ਦੀ ਵਿਚਾਰ ਨਾਲ ਜੁੜੋ।
					</p>

					<div className='h-ctas'>
						<Link href='/audio' className='h-btn-primary'>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='currentColor'>
								<polygon points='5 3 19 12 5 21 5 3' />
							</svg>
							ਹੁਣ ਸੁਣੋ
						</Link>
						<Link href='/video' className='h-btn-outline'>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'>
								<polygon points='23 7 16 12 23 17 23 7' />
								<rect x='1' y='5' width='15' height='14' rx='2' />
							</svg>
							ਹੁਣ ਵੇਖੋ
						</Link>
					</div>

					<div className='h-promise'>
						<span aria-hidden>☬</span>
						<p>
							ਸਿੱਖ ਸਿੱਖਿਆ ਦੀ ਸਦੀਵੀ ਰੌਸ਼ਨੀ ਨੂੰ ਇਕ ਡਿਜੀਟਲ ਲਾਇਬ੍ਰੇਰੀ ਵਿੱਚ
							ਸੰਭਾਲਿਆ ਗਿਆ ਹੈ।
						</p>
					</div>
				</div>

				{/* DYNAMIC: currently playing card — fed by heroKatha or PlayerContext */}
				{cardKatha && (
					<div className='h-card'>
						<p className='h-card-label'>
							<span className='h-card-dot' />
							ਇਸ ਵੇਲੇ ਚੱਲ ਰਿਹਾ ਹੈ
						</p>

						<div className='h-card-row'>
							<div className='h-card-thumb'>
								{cardKatha.thumbnail ? (
									<img
										src={getMediaUrl("thumbnails", cardKatha.thumbnail)}
										alt={cardTitle}
									/>
								) : (
									<div className='h-card-thumb-bg' aria-hidden />
								)}
							</div>

							<div className='h-card-info'>
								<p className='h-card-title'>{cardTitle}</p>
								<p className='h-card-author'>
									{cardKatha.authorName || "Sikh Katha Digital Library"}
								</p>
								<p className='h-card-time'>{cardDuration}</p>
							</div>

							<button
								className='h-card-btn'
								aria-label={isCardPlaying ? "Pause" : "Play"}
								onClick={handleCardPlay}>
								{isCardPlaying ? (
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='currentColor'>
										<rect x='6' y='4' width='4' height='16' rx='1' />
										<rect x='14' y='4' width='4' height='16' rx='1' />
									</svg>
								) : (
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='currentColor'>
										<polygon points='5 3 19 12 5 21 5 3' />
									</svg>
								)}
							</button>
						</div>

						<div className='h-wave' aria-hidden>
							{waveHeights.map((h, i) => (
								<div
									key={i}
									className='h-wbar'
									style={{
										height: h,
										animationDelay: `${(i * 0.055) % 0.75}s`,
										opacity: i < 24 ? 1 : 0.25,
									}}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			<div className='h-strip'>
				<div className='container'>
					<div className='h-strip-row'>
						{QUICK_LINKS.map((item) => (
							<Link key={item.href} href={item.href} className='h-strip-item'>
								<span
									className='h-strip-icon'
									style={{ background: item.tint, color: item.iconColor }}>
									{item.icon}
								</span>
								<div>
									<div className='h-strip-label'>{item.label}</div>
									<div className='h-strip-sub'>{item.sub}</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>

			<style>{`
        @font-face {
          font-family: 'Raaj___5';
          src:
            local('raaj___5'),
            url('/fonts/raaj___5.woff2') format('woff2'),
            url('/fonts/raaj___5.ttf') format('truetype');
          font-display: swap;
        }

        .h-section {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 625px;
          overflow: hidden;
          background: #fffdf9;
        }

        .h-section::after {
          position: absolute;
          z-index: 0;
          inset: -18% -44%;
          background: linear-gradient(108deg,
            transparent 43%,
            rgba(244, 203, 126, 0.02) 47%,
            rgba(255, 249, 232, 0.28) 50%,
            rgba(226, 174, 82, 0.10) 52%,
            transparent 57%
          );
          content: '';
          pointer-events: none;
          transform: translateX(-42%) skewX(-8deg);
          animation: h-hero-shine 13s cubic-bezier(.32,.02,.18,1) infinite 1.6s;
        }

        .h-bg {
          position: absolute;
          inset: 0 0 92px;
          z-index: 0;
        }

        .h-bg-photo {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center -160px;
          background-repeat: no-repeat;
          background-color: #f7f3ec;
          transform: scale(1.025);
          animation: h-photo-breathe 18s ease-in-out infinite alternate;
          will-change: transform;
        }

        .h-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right,
              rgba(255,255,255,.42) 0%,
              rgba(255,255,255,.18) 30%,
              rgba(255,255,255,.04) 48%,
              rgba(255,255,255,0) 62%,
              transparent 100%
            ),
            linear-gradient(to top, rgba(252,251,247,.22) 0%, transparent 20%);
          overflow: hidden;
        }

        .h-ik-onkar {
          position: absolute;
          z-index: 0;
          top: 38px;
          right: clamp(42px, 8vw, 150px);
          color: rgba(191, 126, 30, 0.24);
          font-family: 'Raaj___5', 'Noto Sans Gurmukhi', serif;
          font-size: clamp(105px, 13vw, 93px);
          font-weight: 400;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          text-shadow: 0 12px 36px rgba(125, 74, 15, 0.12);
          animation: h-ik-onkar-breathe 9s ease-in-out infinite;
        }

        .h-inner {
          position: relative;
          z-index: 1;
          flex: 0 0 535px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
          width: 100%;
          max-width: var(--max-width);
          padding: 46px 24px 64px;
        }

        .h-text {
          max-width: 536px;
          flex-shrink: 0;
        }

        .h-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--color-primary);
          margin-bottom: 17px;
          text-transform: uppercase;
          animation: h-copy-reveal 650ms cubic-bezier(.2,.75,.22,1) 80ms both;
        }

        .h-headline {
          font-family: 'Raaj___5', 'Noto Sans Gurmukhi', var(--font-heading);
          font-size: clamp(43px, 4vw, 56px);
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: normal;
          margin-bottom: 18px;
          letter-spacing: 0;
          text-wrap: balance;
          animation: h-copy-reveal 800ms cubic-bezier(.2,.75,.22,1) 150ms both;
        }

        .h-gold {
          color: var(--color-primary-light);
          font-style:normal !important;
          padding:20px 0px;
        }

        @supports (-webkit-background-clip: text) {
          .h-gold {
            background: linear-gradient(100deg, #af6715 0%, #e5ad54 42%, #b56b15 74%, #e7bc6e 100%);
            background-size: 190% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: h-gold-shimmer 9s ease-in-out infinite 1.4s;
          }
        }

        .h-sub {
          font-size: 14px;
          color: black;
          line-height: 1.65;
          margin-bottom: 28px;
          max-width: 365px;
          font-weight:500;
          animation: h-copy-reveal 700ms cubic-bezier(.2,.75,.22,1) 250ms both;
        }

        .h-ctas {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
          animation: h-copy-reveal 700ms cubic-bezier(.2,.75,.22,1) 340ms both;
        }

        .h-promise {
          display: flex;
          align-items: center;
          gap: 11px;
          width: fit-content;
          padding-top: 14px;
          border-top: 1px solid rgba(39, 31, 21, 0.14);
          animation: h-copy-reveal 700ms cubic-bezier(.2,.75,.22,1) 430ms both;
        }
        .h-promise > span {
          color: var(--color-primary);
          font-size: 23px;
          line-height: 1;
        }
        .h-promise p {
          max-width: 290px;
          color: #555b65;
          font-size: 11px;
          line-height: 1.5;
        }

        .h-btn-primary,
        .h-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: var(--font-body);
          text-decoration: none;
          cursor: pointer;
          transition: color 200ms ease, background-color 200ms ease, border-color 200ms ease, transform 200ms ease;
          white-space: nowrap;
        }

        .h-btn-primary {
          background: var(--color-primary);
          color: #fff;
          border: 2px solid var(--color-primary);
        }
        .h-btn-primary:hover {
          background: var(--color-primary-dark);
          border-color: var(--color-primary-dark);
        }

        .h-btn-outline {
          background: transparent;
          color: var(--color-text-primary);
          border: 1.5px solid var(--color-border-strong);
        }
        .h-btn-outline:hover {
          background: #fff;
          border-color: var(--color-primary);
          color: var(--color-primary-dark);
        }

        .h-card {
          position: absolute;
          right: 24px;
          bottom: 56px;
          width: min(430px, 36vw);
          background: rgba(255,255,255,0.97);
          border-radius: 8px;
          padding: 18px 20px 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12);
          margin: 0;
          border: 1px solid rgba(202, 154, 77, .18);
          animation: h-card-arrive 900ms cubic-bezier(.16,.85,.24,1) 380ms both, h-card-float 7s ease-in-out 1.4s infinite;
        }

        .h-card-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .h-card-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22C55E;
          animation: h-pulse 1.6s ease-in-out infinite;
        }

        @keyframes h-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.25); }
        }

        .h-card-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .h-card-thumb {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #1e1608;
        }

        .h-card-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .h-card-thumb-bg {
          width: 100%; height: 100%;
          background-size: cover;
          background-position: center;
          background-color: #2a1f08;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .h-card-khanda {
          font-size: 22px;
          color: var(--color-primary);
        }

        .h-card-info { flex: 1; min-width: 0; }

        .h-card-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 3px;
        }

        .h-card-author {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 2px;
        }

        .h-card-time {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .h-card-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-primary);
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 150ms ease;
        }
        .h-card-btn:hover { background: var(--color-primary-dark); }

        .h-wave {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 28px;
        }

        .h-wbar {
          flex: 1;
          min-width: 2px;
          background: var(--color-primary);
          border-radius: 2px;
          animation: waveformBar2 0.8s ease-in-out infinite;
        }

        .h-strip {
          position: relative;
          z-index: 1;
          background: transparent;
          padding: 0 0 20px;
          transform: translateY(-18px);
          margin-bottom: -18px;
        }

        .h-strip-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          padding: 14px;
          background: rgba(255,255,255,0.98);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 14px 36px rgba(36, 28, 18, 0.11);
          animation: h-strip-arrive 750ms cubic-bezier(.2,.75,.22,1) 580ms both;
        }

        .h-strip-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 8px;
          border: 0;
          border-right: 1px solid var(--color-border-light);
          text-decoration: none;
          background: #fff;
          box-shadow: none;
          transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
        }

        .h-strip-item:hover {
          transform: translateY(-2px);
          background: #fffaf2;
          box-shadow: none;
        }
        .h-strip-item:last-child { border-right: 0; }

        @keyframes h-copy-reveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes h-card-arrive {
          from { opacity: 0; transform: translate3d(20px, 22px, 0) scale(.98); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes h-card-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -5px; }
        }

        @keyframes h-strip-arrive {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes h-photo-breathe {
          from { transform: scale(1.025); }
          to { transform: scale(1.07); }
        }

        @keyframes h-hero-shine {
          0%, 24% { transform: translateX(-42%) skewX(-8deg); opacity: 0; }
          34% { opacity: 1; }
          58% { transform: translateX(42%) skewX(-8deg); opacity: 0.82; }
          70%, 100% { transform: translateX(42%) skewX(-8deg); opacity: 0; }
        }

        @keyframes h-ik-onkar-breathe {
          0%, 100% { opacity: 0.44; transform: translateY(0) scale(1); }
          50% { opacity: 0.7; transform: translateY(-7px) scale(1.018); }
        }

        @keyframes h-gold-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .h-strip-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .h-strip-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1;
          margin-bottom: 3px;
        }

        .h-strip-sub {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        @media (max-width: 1100px) {
          .h-card { display: none; }
          .h-inner { justify-content: flex-start; }
          .h-bg-photo { background-position: 66% center; }
        }

        @media (max-width: 768px) {
          .h-section { min-height: 720px; }
          .h-bg { inset: 0 0 178px; }
          .h-bg-photo { background-position: 64% center; }
          .h-bg-overlay {
            background:
              linear-gradient(to right, rgba(8,13,18,0.97) 0%, rgba(8,13,18,0.8) 58%, rgba(8,13,18,0.42) 100%),
              linear-gradient(to top, rgba(8,13,18,0.65), transparent 45%);
          }
          .h-headline { color: #fff; }
          .h-sub { color: rgba(255,255,255,0.76); }
          .h-btn-outline {
            color: #fff;
            border-color: rgba(255,255,255,0.55);
            background: rgba(8,13,18,0.28);
          }
          .h-promise { border-top-color: rgba(255,255,255,.2); }
          .h-promise p { color: rgba(255,255,255,.72); }
          .h-strip-row { grid-template-columns: repeat(2, 1fr); }
          .h-strip-item:nth-child(5) { grid-column: span 2; }
          .h-strip-item { border-right: 0; border-bottom: 1px solid var(--color-border-light); }
          .h-headline { font-size: 36px; }
          .h-inner { flex-basis: 542px; padding: 34px 22px 44px; align-items: flex-start; }
          .h-text { max-width: 330px; }
          .h-ik-onkar { top: 56px; right: -14px; opacity: .58; }
        }

        @media (prefers-reduced-motion: reduce) {
          .h-section *, .h-section::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
		</section>
	);
}
