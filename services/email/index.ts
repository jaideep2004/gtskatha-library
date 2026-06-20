import type { EmailProvider } from '@/services/email/emailProvider';
import { GmailSmtpAdapter } from '@/services/email/gmailSmtpAdapter';

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!provider) provider = new GmailSmtpAdapter();
  return provider;
}
