'use client';

import { useState } from 'react';

export default function DonationQR() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`donation-qr-wrap ${expanded ? 'expanded' : ''}`}>
      <button
        className="donation-qr-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-label="Donate"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>Support</span>
      </button>
      {expanded && (
        <div className="donation-qr-card" onClick={() => setExpanded(false)}>
          <div className="donation-qr-inner" onClick={(e) => e.stopPropagation()}>
            <img
              src="/images/payQR1.jpeg"
              alt="Donation QR Code"
              className="donation-qr-img"
            />
            <p className="donation-qr-label">Support Gurbani Toot Seva</p>
          </div>
        </div>
      )}
      <style>{`
        .donation-qr-wrap{position:fixed;bottom:24px;right:24px;z-index:999}
        .donation-qr-toggle{display:flex;align-items:center;gap:8px;padding:10px 18px;border:0;border-radius:var(--radius-full);background:linear-gradient(135deg,#d98c29,#b8731f);color:#fff;font-weight:600;font-size:13px;cursor:pointer;box-shadow:0 4px 20px rgba(217,140,41,.35);transition:transform 180ms ease,box-shadow 180ms ease;position:relative}
        .donation-qr-toggle::before{content:'';position:absolute;inset:-4px;border-radius:var(--radius-full);background:rgba(217,140,41,.25);animation:donationPulse 2s ease-in-out infinite}
        .donation-qr-toggle:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 8px 28px rgba(217,140,41,.5)}
        .donation-qr-toggle:hover::before{animation-duration:1s}
        .donation-qr-toggle span,.donation-qr-toggle svg{position:relative;z-index:1}
        .donation-qr-card{position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);animation:donationFadeIn 200ms ease}
        .donation-qr-inner{background:#fff;padding:28px;border-radius:20px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);max-width:320px;animation:donationPop 300ms cubic-bezier(.34,1.56,.64,1)}
        .donation-qr-img{width:220px;height:220px;border-radius:12px;display:block;margin:0 auto 16px}
        .donation-qr-label{margin:0;color:#5a4630;font-size:14px;font-weight:600}
        @keyframes donationPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
        @keyframes donationFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes donationPop{from{opacity:0;transform:scale(.85) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @media(max-width:480px){.donation-qr-wrap{bottom:16px;right:16px}.donation-qr-toggle{padding:8px 14px;font-size:12px}.donation-qr-img{width:180px;height:180px}}
      `}</style>
    </div>
  );
}
