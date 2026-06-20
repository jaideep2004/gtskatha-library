import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Disclaimer' };

export default function DisclaimerPage() {
  return <LegalPage title="Disclaimer" summary="Important context about educational, spiritual, and third-party content."
    sections={[
      { title: 'Spiritual and educational purpose', paragraphs: ['Content is provided for spiritual learning, reflection, and general education. It is not professional medical, legal, financial, or mental-health advice.'] },
      { title: 'Accuracy and interpretation', paragraphs: ['We aim to present information responsibly, but speakers and contributors may express interpretations or views that are their own. Users should consult trusted primary sources and qualified advisers where appropriate.'] },
      { title: 'External material', paragraphs: ['References or links to third-party services do not imply endorsement. We are not responsible for external availability, policies, or content.'] },
      { title: 'Rights concerns', paragraphs: ['If you believe material is used without proper permission or attribution, contact the site administrator with enough detail to review the concern promptly.'] },
    ]} />;
}
