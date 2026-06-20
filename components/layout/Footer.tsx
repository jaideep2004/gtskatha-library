import Link from 'next/link';

const exploreLinks = [
  ['/audio', 'Audio Kathas'],
  ['/video', 'Video Kathas'],
  ['/series', 'Series'],
  ['/topics', 'Topics'],
  ['/search', 'Search Library'],
];

const accountLinks = [
  ['/dashboard', 'My Dashboard'],
  ['/profile/favorites', 'Saved Kathas'],
  ['/login', 'Sign In'],
  ['/register', 'Create Account'],
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
            <p>Preserving Sikh wisdom through a focused library of audio and video kathas.</p>
            <div className="footer-principle"><span aria-hidden>ੴ</span><p>Listen. Reflect. Carry wisdom forward.</p></div>
          </section>

          <nav className="footer-group" aria-label="Explore">
            <h2>Explore</h2>
            {exploreLinks.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>

          <nav className="footer-group" aria-label="Account">
            <h2>Account</h2>
            {accountLinks.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>

          <section className="footer-invite">
            <p>YOUR QUIET PLACE FOR KATHA</p>
            <h2>Return to wisdom, anytime.</h2>
            <Link href="/audio">Start listening <span>›</span></Link>
          </section>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sikh Katha Digital Library.</p>
          <nav aria-label="Legal">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>
        </div>
      </div>

      <style>{`
        .site-footer{position:relative;overflow:hidden;margin-top:20px;padding:70px 0 26px;background:#0c141e;color:#fff;border-top:3px solid #d98c29}
        .footer-glow{position:absolute;inset:0;background:linear-gradient(110deg,rgba(217,140,41,.08),transparent 35%),radial-gradient(circle at 88% 20%,rgba(84,137,124,.12),transparent 28%);pointer-events:none}
        .footer-inner{position:relative}.footer-main{display:grid;grid-template-columns:1.65fr .7fr .75fr 1.1fr;gap:55px;padding-bottom:48px}
        .footer-intro>p{max-width:370px;margin:20px 0;color:rgba(255,255,255,.62);font-size:14px;line-height:1.8}
        .footer-logo{display:flex;align-items:center;gap:12px;width:fit-content}.footer-logo>span{font-size:38px;color:#e39a22}.footer-logo strong,.footer-logo small{display:block}.footer-logo strong{font-family:var(--font-heading);font-size:20px;letter-spacing:.5px}.footer-logo small{margin-top:2px;color:#e39a22;font-size:9px;letter-spacing:2.5px}
        .footer-principle{display:flex;align-items:center;gap:12px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);max-width:380px}.footer-principle>span{font-family:var(--font-gurmukhi);font-size:25px;color:#e39a22}.footer-principle p{font-size:12px;color:rgba(255,255,255,.7)}
        .footer-group{display:flex;flex-direction:column;align-items:flex-start;gap:11px}.footer-group h2{font-family:var(--font-body);font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}.footer-group a{font-size:13px;color:rgba(255,255,255,.58);transition:color .15s ease,transform .15s ease}.footer-group a:hover{color:#f1ae45;transform:translateX(3px)}
        .footer-invite{padding:24px;border:1px solid rgba(255,255,255,.11);border-radius:8px;background:rgba(255,255,255,.035)}.footer-invite>p{font-size:9px;letter-spacing:1.7px;color:#e39a22}.footer-invite h2{font-size:25px;line-height:1.25;color:#fff;margin:10px 0 24px}.footer-invite a{min-height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;border-radius:6px;background:#d98c29;color:#fff;font-size:13px;font-weight:700}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:23px;border-top:1px solid rgba(255,255,255,.1)}.footer-bottom p{font-size:11px;color:rgba(255,255,255,.42)}.footer-bottom nav{display:flex;gap:22px}.footer-bottom a{font-size:11px;color:rgba(255,255,255,.52)}.footer-bottom a:hover{color:#f1ae45}
        @media(max-width:1000px){.footer-main{grid-template-columns:1.4fr 1fr 1fr}.footer-invite{grid-column:1/-1}.footer-invite h2{max-width:420px}}
        @media(max-width:650px){.site-footer{margin-top:48px;padding-top:48px}.footer-main{grid-template-columns:1fr 1fr;gap:34px 24px}.footer-intro,.footer-invite{grid-column:1/-1}.footer-bottom{align-items:flex-start;flex-direction:column;gap:14px}.footer-bottom nav{gap:16px;flex-wrap:wrap}}
      `}</style>
    </footer>
  );
}
