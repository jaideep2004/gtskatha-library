import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import MiniPlayer from '@/components/player/MiniPlayer';
import { PlayerProvider } from '@/context/PlayerContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Navbar />
      <main className="main-with-player" style={{ paddingTop: 'var(--navbar-height)' }}>
        {children}
      </main>
      <Footer />
      <MobileNav />
      <MiniPlayer />
      <style>{`
        @media (max-width: 768px) {
          .main-with-player {
            padding-bottom: calc(var(--player-height) + var(--mobile-nav-height, 64px) + var(--space-4));
          }
        }
      `}</style>
    </PlayerProvider>
  );
}
