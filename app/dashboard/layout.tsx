import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import UserDashboardShell from '@/components/dashboard/UserDashboardShell';
import MiniPlayer from '@/components/player/MiniPlayer';
import { PlayerProvider } from '@/context/PlayerContext';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard');
  if (session.user.role === 'admin') redirect('/admin/dashboard');

  return (
    <PlayerProvider>
      <UserDashboardShell
        userName={session.user.name ?? 'Listener'}
        email={session.user.email}
      >
        {children}
      </UserDashboardShell>
      <MiniPlayer />
    </PlayerProvider>
  );
}
