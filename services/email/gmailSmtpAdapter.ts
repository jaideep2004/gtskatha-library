import { Message, SMTPClient } from 'emailjs';
import type { EmailProvider, PasswordResetEmail } from '@/services/email/emailProvider';

function createClient() {
  const user = process.env.GMAIL_SMTP_USER;
  const password = process.env.GMAIL_SMTP_APP_PASSWORD;
  if (!user || !password) {
    throw new Error('Gmail SMTP is not configured');
  }
  return new SMTPClient({
    user,
    password,
    host: 'smtp.gmail.com',
    port: 465,
    ssl: true,
    timeout: 15_000,
  });
}

export class GmailSmtpAdapter implements EmailProvider {
  async sendPasswordReset({ to, name, resetUrl }: PasswordResetEmail) {
    const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_SMTP_USER;
    if (!fromAddress) throw new Error('Email sender is not configured');

    const html = `
        <div style="margin:0;background:#f7f3eb;padding:36px 16px;font-family:Arial,sans-serif;color:#17233a">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eadfce;border-radius:14px;overflow:hidden">
            <div style="background:#132235;padding:26px 30px;color:#fff">
              <div style="color:#e69a2d;font-size:12px;font-weight:700;letter-spacing:1.5px">SIKH KATHA</div>
              <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px">Reset your password</h1>
            </div>
            <div style="padding:30px">
              <p>Sat Sri Akaal ${escapeHtml(name)},</p>
              <p style="line-height:1.65;color:#596477">We received a request to reset your password. This secure link expires in 30 minutes.</p>
              <p style="margin:28px 0">
                <a href="${resetUrl}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#d98c29;color:#fff;text-decoration:none;font-weight:700">Reset password</a>
              </p>
              <p style="font-size:12px;line-height:1.6;color:#89919d">If you did not request this, ignore this email. Your password will remain unchanged.</p>
            </div>
          </div>
        </div>
      `;
    const client = createClient();
    const message = new Message({
      from: `Sikh Katha Digital Library <${fromAddress}>`,
      to,
      subject: 'Reset your Sikh Katha password',
      text: [
        `Sat Sri Akaal ${name},`,
        '',
        'Use this link to reset your password. It expires in 30 minutes:',
        resetUrl,
        '',
        'If you did not request this, you can ignore this email.',
      ].join('\n'),
      attachment: [{ data: html, alternative: true, type: 'text/html' }],
    });
    try {
      await client.sendAsync(message);
    } finally {
      client.smtp.close();
    }
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return entities[character];
  });
}
