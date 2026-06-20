'use client';

import { useEffect, useRef, useState } from 'react';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import { toast } from 'sonner';

export default function ForgotPasswordDialog({
  open,
  initialEmail,
  onClose,
}: {
  open: boolean;
  initialEmail?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(initialEmail || '');
  const [sending, setSending] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setEmail(initialEmail || '');
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [initialEmail, open]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Reset request failed');
      toast.success(payload.message);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reset request failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="forgot-dialog"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={submit}>
        <button
          type="button"
          className="forgot-close"
          onClick={onClose}
          aria-label="Close forgot password dialog"
        >
          ×
        </button>
        <span className="forgot-kicker">Account recovery</span>
        <h2>Reset your password</h2>
        <p>Enter your account email. We&apos;ll send a secure link valid for 30 minutes.</p>
        <label className="auth-field">
          <span className="auth-field-icon"><EmailOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            autoComplete="email"
            required
            autoFocus
          />
        </label>
        <button className="auth-submit" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <style>{`
        .forgot-dialog{width:min(440px,calc(100vw - 28px));padding:0;border:0;border-radius:14px;background:#fff;color:#172033;box-shadow:0 28px 90px rgba(7,15,27,.36)}
        .forgot-dialog::backdrop{background:rgba(9,16,26,.68);backdrop-filter:blur(5px)}
        .forgot-dialog form{position:relative;padding:34px}
        .forgot-close{position:absolute;right:17px;top:14px;width:34px;height:34px;border-radius:50%;background:#f2eee7;color:#657086;font-size:22px}
        .forgot-kicker{color:#c57914;font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase}
        .forgot-dialog h2{margin:8px 0;font-size:29px}.forgot-dialog p{margin-bottom:22px;color:#697386;font-size:13px;line-height:1.65}
        .forgot-dialog .auth-submit{width:100%;margin-top:14px}
      `}</style>
    </dialog>
  );
}
