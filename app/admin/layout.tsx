import AdminLayout from '@/components/admin/AdminLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <AdminLayout
      userName={session?.user?.name ?? 'Administrator'}
      email={session?.user?.email}
    >
      {children}
    </AdminLayout>
  );
}
