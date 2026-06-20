'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import LockOutlined from '@mui/icons-material/LockOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import AuthShell from '@/components/auth/AuthShell';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Password reset failed');
      toast.success(payload.message);
      router.replace('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="auth-heading">Choose New Password</h1>
      <p className="auth-subtitle">Use at least 8 characters for your new password</p>
      {!token ? (
        <div className="auth-error" role="alert">
          Reset token missing. <Link className="auth-link" href="/login">Request another link.</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span className="auth-field-icon"><LockOutlined fontSize="small" /></span>
            <input
              className="auth-input"
              type={visible ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
            />
            <button
              className="auth-password-toggle"
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
            </button>
          </label>
          <label className="auth-field">
            <span className="auth-field-icon"><LockOutlined fontSize="small" /></span>
            <input
              className="auth-input"
              type={visible ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="auth-submit" type="submit" disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
      <p className="auth-switch">
        Remembered it? <Link className="auth-link" href="/login">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-page">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
