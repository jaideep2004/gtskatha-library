'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AuthShell from '@/components/auth/AuthShell';
import ForgotPasswordDialog from '@/components/auth/ForgotPasswordDialog';
import { toast } from 'sonner';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email or password is incorrect.');
      toast.error('Email or password is incorrect.');
      setLoading(false);
      return;
    }

    const session = await getSession();
    const destination = session?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    toast.success('Welcome back.');
    router.replace(destination);
    router.refresh();
  }

  return (
    <>
      <h1 className="auth-heading">Welcome Back</h1>
      <p className="auth-subtitle">Sign in to continue your spiritual journey</p>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className="auth-field-icon"><EmailOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span className="auth-field-icon"><LockOutlined fontSize="small" /></span>
          <input
            className="auth-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            className="auth-password-toggle"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <VisibilityOffOutlined fontSize="small" />
              : <VisibilityOutlined fontSize="small" />}
          </button>
        </label>

        <div className="auth-form-row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <button className="auth-forgot" type="button" onClick={() => setForgotOpen(true)}>
            Forgot password?
          </button>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Signing In…' : 'Sign In'}
          {!loading && <ArrowForward fontSize="small" />}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link className="auth-link" href="/register">Sign up</Link>
      </p>
      <ForgotPasswordDialog
        open={forgotOpen}
        initialEmail={email}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
