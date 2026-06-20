import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function TermsPage() {
  return <LegalPage title="Terms of Use" summary="Rules for accessing and using Sikh Katha Digital Library."
    sections={[
      { title: 'Using the library', paragraphs: ['You may use this website for personal listening, viewing, study, and spiritual learning. Do not misuse the service, attempt unauthorized access, disrupt playback, or interfere with other users.'] },
      { title: 'Accounts', paragraphs: ['You are responsible for information submitted through your account and for keeping login credentials private. We may restrict accounts used for abuse, unlawful activity, or attempts to compromise the platform.'] },
      { title: 'Content and downloads', paragraphs: ['Kathas, artwork, text, and recordings remain subject to their applicable ownership and permissions. A download option, when available, grants personal use only unless separate permission explicitly states otherwise.'] },
      { title: 'Availability', paragraphs: ['We work to keep the library reliable, but content and features may change, be corrected, or become temporarily unavailable for maintenance, security, or rights reasons.'] },
    ]} />;
}
