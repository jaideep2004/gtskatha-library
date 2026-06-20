'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AuthShell from '@/components/auth/AuthShell';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function updateField(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Account could not be created.');
        toast.error(data.error ?? 'Account could not be created.');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!result?.ok) {
        toast.success('Account created. Sign in to continue.');
        router.replace('/login');
        return;
      }

      toast.success('Account created. Welcome to Sikh Katha.');
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Account could not be created. Please try again.');
      toast.error('Account could not be created. Please try again.');
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="auth-heading">Create Account</h1>
      <p className="auth-subtitle">Build your personal library and continue across devices</p>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className="auth-field-icon"><PersonOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            name="name"
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={updateField}
            autoComplete="name"
            required
          />
        </label>

        <label className="auth-field">
          <span className="auth-field-icon"><EmailOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span className="auth-field-icon"><LockOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={updateField}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button
            className="auth-password-toggle"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
          >
            {showPassword
              ? <VisibilityOffOutlined fontSize="small" />
              : <VisibilityOutlined fontSize="small" />}
          </button>
        </label>

        <label className="auth-field">
          <span className="auth-field-icon"><LockOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            name="confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={form.confirm}
            onChange={updateField}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Creating Account…' : 'Create Account'}
          {!loading && <ArrowForward fontSize="small" />}
        </button>
      </form>

      <p className="auth-legal">
        By creating an account, you agree to platform terms and privacy policy.
      </p>
      <p className="auth-switch">
        Already registered? <Link className="auth-link" href="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
