'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Config {
  heroKathaSlug: string;
  featuredKathaSlug: string;
  featuredSeriesSlug: string;
  quote: string;
}

interface ContentOption {
  _id: string;
  slug: string;
  title: string;
}

const empty: Config = { heroKathaSlug: '', featuredKathaSlug: '', featuredSeriesSlug: '', quote: '' };

export default function HomepageAdminPage() {
  const [form, setForm] = useState<Config>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [kathas, setKathas] = useState<ContentOption[]>([]);
  const [series, setSeries] = useState<ContentOption[]>([]);

  const load = useCallback(async () => {
    try {
      const [res, kathasRes, seriesRes] = await Promise.all([
        fetch('/api/homepage'),
        fetch('/api/kathas?limit=100&sort=newest'),
        fetch('/api/series'),
      ]);
      const [data, kathasData, seriesData] = await Promise.all([
        res.json(),
        kathasRes.json(),
        seriesRes.json(),
      ]);
      if (data.success && data.data) {
        const cfg = data.data;
        setForm({
          heroKathaSlug: cfg.heroKatha?.slug ?? '',
          featuredKathaSlug: cfg.featuredKatha?.slug ?? '',
          featuredSeriesSlug: cfg.featuredSeries?.slug ?? '',
          quote: cfg.quote ?? '',
        });
      }
      if (kathasData.success) {
        setKathas(kathasData.data.map((item: ContentOption) => ({
          _id: item._id,
          slug: item.slug,
          title: item.title,
        })));
      }
      if (seriesData.success) {
        setSeries(seriesData.data.map((item: ContentOption) => ({
          _id: item._id,
          slug: item.slug,
          title: item.title,
        })));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
  useEffect(() => { void load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Homepage settings saved.');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error ?? 'Failed to save');
        toast.error(data.error ?? 'Failed to save homepage settings.');
      }
    } catch {
      setError('Network error');
      toast.error('Network error while saving homepage settings.');
    }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div style={{ padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Homepage Settings</h1>
          <p className="admin-page-sub">Configure featured content on the homepage</p>
        </div>
        <button className="btn btn-primary btn-sm" form="homepage-form" type="submit" disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
          {error}
        </div>
      )}

      <form id="homepage-form" onSubmit={handleSave} className="homepage-settings">
        {/* Hero */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Hero Section
          </h2>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="hero-katha">Hero Katha Slug</label>
              <select id="hero-katha" className="input"
                value={form.heroKathaSlug} onChange={(e) => setForm(f => ({ ...f, heroKathaSlug: e.target.value }))}>
                <option value="">No hero Katha</option>
                {kathas.map((katha) => <option key={katha._id} value={katha.slug}>{katha.title}</option>)}
              </select>
              <span className="settings-hint">The katha shown in the hero mini-player</span>
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            Featured Content
          </h2>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="feat-katha">Featured Katha Slug</label>
              <select id="feat-katha" className="input"
                value={form.featuredKathaSlug} onChange={(e) => setForm(f => ({ ...f, featuredKathaSlug: e.target.value }))}>
                <option value="">No featured Katha</option>
                {kathas.map((katha) => <option key={katha._id} value={katha.slug}>{katha.title}</option>)}
              </select>
              <span className="settings-hint">Shown in the dark &quot;Featured Katha&quot; banner</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="feat-series">Featured Series Slug</label>
              <select id="feat-series" className="input"
                value={form.featuredSeriesSlug} onChange={(e) => setForm(f => ({ ...f, featuredSeriesSlug: e.target.value }))}>
                <option value="">No featured series</option>
                {series.map((item) => <option key={item._id} value={item.slug}>{item.title}</option>)}
              </select>
              <span className="settings-hint">Highlighted in Popular Series section</span>
            </div>
          </div>
        </div>

        {/* Daily Wisdom */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
            Daily Wisdom
          </h2>
          <div className="form-group">
            <label className="form-label" htmlFor="daily-quote">Shabad / Quote</label>
            <textarea
              id="daily-quote"
              className="input"
              rows={4}
              placeholder="Enter the daily Gurbani shabad or quote…"
              style={{ resize: 'vertical' }}
              value={form.quote}
              onChange={(e) => setForm(f => ({ ...f, quote: e.target.value }))}
            />
            <span className="settings-hint">Displayed in the Daily Wisdom card on homepage</span>
          </div>
        </div>
      </form>

      <style>{`
        .admin-page { padding: var(--space-8); }
        .admin-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-8); gap: var(--space-4); }
        .admin-page-title { font-family: var(--font-heading); font-size: var(--font-size-2xl); font-weight: 700; margin-bottom: var(--space-1); }
        .admin-page-sub { color: var(--color-text-muted); font-size: var(--font-size-sm); }
        .homepage-settings { display: flex; flex-direction: column; gap: var(--space-6); }
        .settings-section { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); }
        .settings-section-title { display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-heading); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-5); padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); }
        .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
        .settings-hint { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 4px; display: block; }
        @media (max-width: 640px) { .settings-grid { grid-template-columns: 1fr; } .admin-page { padding: var(--space-4); } }
      `}</style>
    </div>
  );
}
