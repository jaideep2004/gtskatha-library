import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import BookmarkBorderOutlined from '@mui/icons-material/BookmarkBorderOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';

const benefits = [
  {
    icon: <HeadphonesOutlined fontSize="small" />,
    title: 'Audio & Video',
    detail: 'High quality kathas',
  },
  {
    icon: <BookmarkBorderOutlined fontSize="small" />,
    title: 'Your Library',
    detail: 'Save favorite kathas',
  },
  {
    icon: <NotificationsNoneOutlined fontSize="small" />,
    title: 'Stay Updated',
    detail: 'Receive new releases',
  },
];

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-visual" aria-label="Sikh Katha Digital Library">
          <div className="auth-visual-image" aria-hidden />
          <div className="auth-quote">
            <span className="auth-quote-mark" aria-hidden>“</span>
            <blockquote>
              Let wisdom guide your heart and illuminate your path.
            </blockquote>
            {/* <cite>Inspired by Gurbani</cite> */}
          </div>
          <div className="auth-benefits">
            {benefits.map((benefit) => (
              <div className="auth-benefit" key={benefit.title}>
                <span className="auth-benefit-icon">{benefit.icon}</span>
                <strong>{benefit.title}</strong>
                <span>{benefit.detail}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-content">
            <div className="auth-brand">
              <span className="auth-brand-mark" aria-hidden>☬</span>
              <div className="auth-brand-title">SIKH KATHA</div>
              <div className="auth-brand-sub">DIGITAL LIBRARY</div>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
