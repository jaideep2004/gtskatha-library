import type { Metadata } from 'next';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';
import DonationQR from '@/components/layout/DonationQR';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sikh Katha Digital Library',
    template: '%s | Sikh Katha',
  },
  description: 'Discover thousands of Sikh kathas, gurbani vichar, and spiritual discourses. Your gateway to divine wisdom.',
  keywords: ['sikh katha', 'gurbani vichar', 'nitnem', 'paath', 'spiritual discourses', 'digital library', 'naam simran'],
  applicationName: 'Sikh Katha Digital Library',
  openGraph: {
    type: 'website',
    siteName: 'Sikh Katha Digital Library',
    title: 'Sikh Katha Digital Library',
    description: 'Discover thousands of Sikh kathas, gurbani vichar, and spiritual discourses. Your gateway to divine wisdom.',
    url: '/',
    locale: 'en_IN',
    images: [
      {
        url: '/images/ngo-logo.png',
        alt: 'Sikh Katha Digital Library',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Sikh Katha Digital Library',
    description: 'Discover thousands of Sikh kathas, gurbani vichar, and spiritual discourses.',
    images: ['/images/ngo-logo.png'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Sikh Katha Digital Library',
              url: SITE_URL,
              description: 'Discover thousands of Sikh kathas, gurbani vichar, and spiritual discourses.',
            }),
          }}
        />
      </body>
    </html>
  );
}
