import Link from 'next/link';

const exploreLinks = [
  ['/audio', 'ਆਡੀਓ ਕਥਾ'],
  ['/video', 'ਵੀਡੀਓ ਕਥਾ'],
  ['/series', 'ਲੜੀਆਂ'],
  ['/paath', 'ਪਾਠ'],
  ['/nittnem', 'ਨਿਤਨੇਮ'],
];

const accountLinks = [
  ['/dashboard', 'ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ'],
  ['/profile/favorites', 'ਸੰਭਾਲੀ ਕਥਾ'],
  ['/login', 'ਸਾਈਨ ਇਨ'],
  ['/register', 'ਖਾਤਾ ਬਣਾਓ'],
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden />
      <div className="container footer-inner">
        <div className="footer-main">
          <section className="footer-intro">
            <Link href="/" className="footer-logo">
              <span aria-hidden>☬</span>
              <div><strong>SIKH KATHA</strong><small>DIGITAL LIBRARY</small></div>
            </Link>
            <p>ਆਡੀਓ ਅਤੇ ਵੀਡੀਓ ਕਥਾ ਦੀ ਕੇਂਦਰਿਤ ਲਾਇਬ੍ਰੇਰੀ ਰਾਹੀਂ ਸਿੱਖ ਸਿੱਖਿਆ ਨੂੰ ਸੰਭਾਲਣਾ।</p>
            <div className="footer-principle"><span aria-hidden>ੴ</span><p>ਸੁਣੋ। ਵਿਚਾਰੋ। ਸਿੱਖਿਆ ਨੂੰ ਅੱਗੇ ਲੈ ਕੇ ਚਲੋ।</p></div>
          </section>

          <nav className="footer-group" aria-label="Explore">
            <h2>ਖੋਜੋ</h2>
            {exploreLinks.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>

          <nav className="footer-group" aria-label="Account">
            <h2>ਖਾਤਾ</h2>
            {accountLinks.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>

          <section className="footer-invite">
            <p>ਕਥਾ ਲਈ ਤੁਹਾਡੀ ਸ਼ਾਂਤ ਥਾਂ</p>
            <h2>ਜਦੋਂ ਚਾਹੋ, ਸਿੱਖਿਆ ਵੱਲ ਮੁੜੋ।</h2>
            <Link href="/audio">ਸੁਣਨਾ ਸ਼ੁਰੂ ਕਰੋ <span>›</span></Link>
          </section>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <p>© {new Date().getFullYear()} Sikh Katha Digital Library.</p>
            <nav aria-label="Legal">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </nav>
          </div>
          <a href="https://gtstrust.in" target="_blank" rel="noopener noreferrer" className="footer-trust">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>GTS Trust</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="footer-ext-link" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        .site-footer{position:relative;overflow:hidden;margin-top:20px;padding:70px 0 26px;background:#0c141e;color:#fff;border-top:3px solid #d98c29}
        .footer-glow{position:absolute;inset:0;background:linear-gradient(110deg,rgba(217,140,41,.08),transparent 35%),radial-gradient(circle at 88% 20%,rgba(84,137,124,.12),transparent 28%);pointer-events:none}
        .footer-inner{position:relative}.footer-main{display:grid;grid-template-columns:1.65fr .7fr .75fr 1.1fr;gap:55px;padding-bottom:48px}
        .footer-intro>p{max-width:370px;margin:20px 0;color:rgba(255,255,255,.62);font-size:14px;line-height:1.8}
        .footer-logo{display:flex;align-items:center;gap:12px;width:fit-content}.footer-logo>span{font-size:30px;color:#e39a22}.footer-logo strong,.footer-logo small{display:block}.footer-logo strong{font-family:var(--font-heading);font-size:17px;letter-spacing:.5px}.footer-logo small{margin-top:2px;color:#e39a22;font-size:8px;letter-spacing:2.5px}
        .footer-principle{display:flex;align-items:center;gap:12px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);max-width:380px}.footer-principle>span{font-family:var(--font-gurmukhi);font-size:25px;color:#e39a22}.footer-principle p{font-size:12px;color:rgba(255,255,255,.7)}
        .footer-group{display:flex;flex-direction:column;align-items:flex-start;gap:11px}.footer-group h2{font-family:var(--font-body);font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}.footer-group a{font-size:13px;color:rgba(255,255,255,.58);transition:color .15s ease,transform .15s ease}.footer-group a:hover{color:#f1ae45;transform:translateX(3px)}
        .footer-invite{padding:24px;border:1px solid rgba(255,255,255,.11);border-radius:8px;background:rgba(255,255,255,.035)}.footer-invite>p{font-size:9px;letter-spacing:1.7px;color:#e39a22}.footer-invite h2{font-size:25px;line-height:1.25;color:#fff;margin:10px 0 24px}.footer-invite a{min-height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;border-radius:6px;background:#d98c29;color:#fff;font-size:13px;font-weight:700}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:23px;border-top:1px solid rgba(255,255,255,.1);gap:16px;flex-wrap:wrap}
        .footer-bottom-links{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
        .footer-bottom-links p{font-size:11px;color:rgba(255,255,255,.42)}
        .footer-bottom-links nav{display:flex;gap:22px}
        .footer-bottom-links a{font-size:11px;color:rgba(255,255,255,.52)}
        .footer-bottom-links a:hover{color:#f1ae45}
        .footer-trust{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(217,140,41,.1);color:rgba(255,255,255,.72);font-size:12px;font-weight:600;text-decoration:none;transition:all .2s ease}
        .footer-trust:hover{border-color:#d98c29;color:#f1ae45;background:rgba(217,140,41,.18)}
        .footer-ext-link{opacity:.5;transition:opacity .2s ease}
        .footer-trust:hover .footer-ext-link{opacity:1}
        @media(max-width:1000px){.footer-main{grid-template-columns:1.4fr 1fr 1fr}.footer-invite{grid-column:1/-1}.footer-invite h2{max-width:420px}}
        @media(max-width:650px){.site-footer{margin-top:48px;padding-top:48px}.footer-main{grid-template-columns:1fr 1fr;gap:34px 24px}.footer-intro,.footer-invite{grid-column:1/-1}.footer-bottom{flex-direction:column;align-items:flex-start;gap:14px}.footer-bottom-links{flex-direction:column;align-items:flex-start;gap:14px}.footer-bottom-links nav{gap:16px;flex-wrap:wrap}}
      `}</style>
    </footer>
  );
}
