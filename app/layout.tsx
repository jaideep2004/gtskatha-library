import type { Metadata } from 'next';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';
import DonationQR from '@/components/layout/DonationQR';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Sikh Katha Digital Library',
    template: '%s | Sikh Katha',
  },
  description: 'Discover thousands of Sikh kathas, gurbani vichar, and spiritual discourses. Your gateway to divine wisdom.',
  keywords: ['sikh katha', 'gurbani', 'spiritual', 'digital library', 'nitnem', 'naam simran'],
  openGraph: {
    type: 'website',
    siteName: 'Sikh Katha Digital Library',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/ngo-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <DonationQR />
        <ToastProvider />
      </body>
    </html>
  );
}
