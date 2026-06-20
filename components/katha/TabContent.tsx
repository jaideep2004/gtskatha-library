'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IKatha } from '@/types';
import { toast } from 'sonner';

type TabId = 'overview' | 'takeaways' | 'notes' | 'references';

interface TabContentProps {
  katha: Pick<IKatha, '_id' | 'description' | 'keyTakeaways' | 'references'>;
  categorySlug?: string;
  categoryName?: string;
  isAuthenticated: boolean;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'takeaways', label: 'Key Takeaways' },
  { id: 'notes', label: 'Notes' },
  { id: 'references', label: 'References' },
];

export default function TabContent({
  katha,
  categorySlug,
  categoryName,
  isAuthenticated,
}: TabContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [note, setNote] = useState('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch(`/api/notes?kathaId=${encodeURIComponent(katha._id)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setNote(payload?.data?.content ?? ''))
      .catch(() => {});
  }, [isAuthenticated, katha._id]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function handleNoteChange(value: string) {
    setNote(value);
    setNoteStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kathaId: katha._id, content: value }),
        });
        setNoteStatus(response.ok ? 'saved' : 'error');
        if (response.ok) toast.success('Private note saved.', { id: `note-${katha._id}` });
        else toast.error('Could not save your note.', { id: `note-${katha._id}` });
      } catch {
        setNoteStatus('error');
        toast.error('Could not save your note.', { id: `note-${katha._id}` });
      }
    }, 700);
  }

  return (
    <>
      {/* Tab row */}
      <div className="tabs" role="tablist" aria-label="Katha information tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="tab-panels">
        {/* Overview */}
        <div
          id="tab-panel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
          className={`tab-panel${activeTab === 'overview' ? ' tab-panel--active' : ''}`}
        >
          <h3>About This Katha</h3>
          {katha.description ? (
            <p>{katha.description}</p>
          ) : (
            <p className="tab-empty">No description available.</p>
          )}
          {categorySlug && categoryName && (
            <p style={{ marginTop: 'var(--space-3)' }}>
              Category:{' '}
              <Link
                href={`/search?category=${categorySlug}`}
                style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
              >
                {categoryName}
              </Link>
            </p>
          )}
        </div>

        {/* Key Takeaways */}
        <div
          id="tab-panel-takeaways"
          role="tabpanel"
          aria-labelledby="tab-takeaways"
          className={`tab-panel${activeTab === 'takeaways' ? ' tab-panel--active' : ''}`}
        >
          <h3>Key Takeaways</h3>
          {katha.keyTakeaways && katha.keyTakeaways.length > 0 ? (
            <ul className="takeaways-list">
              {katha.keyTakeaways.map((item, i) => (
                <li key={i} className="takeaway-item">
                  <span className="takeaway-dot" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tab-empty">No key takeaways available.</p>
          )}
        </div>

        {/* Notes */}
        <div
          id="tab-panel-notes"
          role="tabpanel"
          aria-labelledby="tab-notes"
          className={`tab-panel${activeTab === 'notes' ? ' tab-panel--active' : ''}`}
        >
          <h3>Notes</h3>
          {isAuthenticated ? (
            <div className="notes-area">
              <textarea
                className="input notes-textarea"
                placeholder="Add your personal notes here... Your notes are private and only visible to you."
                rows={6}
                aria-label="Personal notes"
                value={note}
                onChange={(event) => handleNoteChange(event.target.value)}
              />
              <p className="notes-hint">
                {noteStatus === 'saving'
                  ? 'Saving...'
                  : noteStatus === 'saved'
                    ? 'Saved privately.'
                    : noteStatus === 'error'
                      ? 'Could not save. Keep this page open and try again.'
                      : 'Your notes are private and only visible to you.'}
              </p>
            </div>
          ) : (
            <div className="notes-login-prompt">
              <p>
                <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  Sign in
                </Link>{' '}
                to save personal notes for this katha.
              </p>
            </div>
          )}
        </div>

        {/* References */}
        <div
          id="tab-panel-references"
          role="tabpanel"
          aria-labelledby="tab-references"
          className={`tab-panel${activeTab === 'references' ? ' tab-panel--active' : ''}`}
        >
          <h3>References</h3>
          {katha.references && katha.references.length > 0 ? (
            <ul className="references-list">
              {katha.references.map((ref, i) => (
                <li key={i} className="reference-item">
                  {ref}
                </li>
              ))}
            </ul>
          ) : (
            <p className="tab-empty">No references available.</p>
          )}
        </div>
      </div>

      <style>{`
        .tab-panels {
          position: relative;
          min-height: 120px;
        }

        .tab-panel {
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: opacity 250ms ease, transform 250ms ease;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: var(--space-6) 0;
        }

        .tab-panel--active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          position: relative;
        }

        .tab-panel h3 {
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-4);
        }

        .tab-panel p {
          margin-bottom: var(--space-3);
          line-height: 1.65;
        }

        .tab-empty {
          color: var(--color-text-muted);
          font-style: italic;
        }

        .takeaways-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          list-style: none;
        }

        .takeaway-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          line-height: 1.55;
        }

        .takeaway-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          flex-shrink: 0;
          margin-top: 5px;
        }

        .notes-area {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .notes-textarea {
          resize: vertical;
          min-height: 120px;
          font-size: var(--font-size-sm);
          line-height: 1.6;
        }

        .notes-hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          font-style: italic;
        }

        .notes-login-prompt {
          padding: var(--space-5);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px dashed var(--color-border);
          font-size: var(--font-size-sm);
        }

        .references-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          list-style: none;
        }

        .reference-item {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          padding-left: var(--space-4);
          border-left: 2px solid var(--color-border);
          line-height: 1.55;
        }
      `}</style>
    </>
  );
}
