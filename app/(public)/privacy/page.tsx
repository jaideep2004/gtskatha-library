import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" summary="How account, playback, and library information is handled."
    sections={[
      { title: 'Information collected', paragraphs: ['We may store account details you provide, saved kathas, private notes, playback progress, and basic technical information needed to operate and secure the service.'] },
      { title: 'How information is used', paragraphs: ['Information is used to authenticate users, restore listening progress, maintain saved libraries, improve reliability, prevent abuse, and administer the platform.'] },
      { title: 'Sharing and retention', paragraphs: ['We do not sell personal information. Data may be processed by infrastructure providers required to run the service or disclosed when legally required. Records are retained only as long as reasonably needed for service, security, or legal purposes.'] },
      { title: 'Your choices', paragraphs: ['You may stop using the service at any time. Private notes are intended to remain visible only to your account. Contact the site administrator for account or data requests.'] },
    ]} />;
}
