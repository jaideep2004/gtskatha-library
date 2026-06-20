import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FavoritesClient from '@/components/profile/FavoritesClient';

export const metadata: Metadata = {
  title: 'My Library',
  description: 'Your saved Sikh kathas.',
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/profile/favorites');

  return (
    <div className="page-section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <span>My Library</span>
        </nav>
        <FavoritesClient />
      </div>
    </div>
  );
}
