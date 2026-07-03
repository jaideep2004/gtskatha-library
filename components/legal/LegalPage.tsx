import Link from 'next/link';

interface Section {
  title: string;
  paragraphs: string[];
}

export default function LegalPage({
  title,
  summary,
  sections,
}: {
  title: string;
  summary: string;
  sections: Section[];
}) {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <div className="container">
          <nav><Link href="/">Home</Link><span>›</span><b>{title}</b></nav>
          <p className="legal-kicker">SIKH KATHA DIGITAL LIBRARY</p>
          <h1>{title}</h1>
          <p>{summary}</p>
          <small>Last updated: June 20, 2026</small>
        </div>
      </header>
      <div className="container legal-layout">
        <aside>
          <p>Legal information</p>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </aside>
        <article>
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>
      </div>
      <style>{`
        .legal-page{min-height:100vh;background:#fbfaf7;padding-bottom:80px}.legal-hero{padding:48px 0 50px;background:linear-gradient(90deg,rgba(251,250,247,.98),rgba(251,250,247,.8)),url('/images/archivebg.png') 72% 43%/cover no-repeat;border-bottom:1px solid #e5dfd4}.legal-hero nav{display:flex;gap:10px;font-size:13px;color:#68758a}.legal-hero nav b{color:#223149}.legal-kicker{margin-top:38px;font-size:10px!important;font-weight:700;letter-spacing:2px;color:#d88717!important}.legal-hero h1{font-size:50px;color:#142039;margin:8px 0 12px}.legal-hero>div>p:not(.legal-kicker){max-width:660px;font-size:16px;color:#40506a;line-height:1.75}.legal-hero small{display:block;margin-top:16px;color:#788293;font-size:12px}.legal-layout{display:grid;grid-template-columns:220px minmax(0,760px);gap:60px;padding-top:46px;justify-content:center}.legal-layout aside{align-self:start;position:sticky;top:100px;padding:20px;border-left:3px solid #d88717;background:#fff}.legal-layout aside p{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8a7656;margin-bottom:10px}.legal-layout aside a{display:block;padding:8px 0;font-size:13px;color:#506078}.legal-layout article section{padding-bottom:30px;margin-bottom:30px;border-bottom:1px solid #e8e2d8}.legal-layout article section:last-child{border-bottom:0}.legal-layout h2{font-size:28px;color:#18253a;margin-bottom:14px}.legal-layout article p{font-size:15px;line-height:1.85;color:#4f5d70;margin-top:10px}@media(max-width:760px){.legal-hero h1{font-size:38px}.legal-layout{grid-template-columns:1fr;padding-top:30px}.legal-layout aside{position:static;display:flex;gap:16px;flex-wrap:wrap;border-left:0;border-top:3px solid #d88717}.legal-layout aside p{width:100%}.legal-layout h2{font-size:24px}}
      `}</style>
    </main>
  );
}
