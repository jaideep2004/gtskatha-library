'use client';

import { useState, useLayoutEffect, useRef } from 'react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

export default function ShareButtons({ title, url: urlProp }: ShareButtonsProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const resolvedUrlRef = useRef(urlProp ?? '');
  const [resolvedUrl, setResolvedUrl] = useState('');

  // useLayoutEffect resolves window.location client-side; setState is intentional here
  useLayoutEffect(() => {
    const next = urlProp ?? window.location.href;
    resolvedUrlRef.current = next;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolving window.location after mount
    setResolvedUrl(next);
  }, [urlProp]);

  function share(platform: 'whatsapp' | 'telegram' | 'facebook') {
    const u = encodeURIComponent(resolvedUrl);
    const t = encodeURIComponent(title);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + resolvedUrl)}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
    setTimeout(() => setCopyStatus('idle'), 2000);
  }

  return (
    <>
      <div className="share-buttons">
        <button
          className="share-btn share-btn--whatsapp"
          aria-label="Share on WhatsApp"
          onClick={() => share('whatsapp')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>

        <button
          className="share-btn share-btn--telegram"
          aria-label="Share on Telegram"
          onClick={() => share('telegram')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram
        </button>

        <button
          className="share-btn share-btn--facebook"
          aria-label="Share on Facebook"
          onClick={() => share('facebook')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        <button
          className={`share-btn share-btn--copy${copyStatus === 'copied' ? ' share-btn--copied' : copyStatus === 'failed' ? ' share-btn--failed' : ''}`}
          aria-label="Copy link"
          onClick={copyLink}
        >
          {copyStatus === 'copied' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ਕਾਪੀ ਹੋ ਗਿਆ
            </>
          ) : copyStatus === 'failed' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              ਕਾਪੀ ਨਹੀਂ ਹੋਇਆ
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              ਲਿੰਕ ਕਾਪੀ ਕਰੋ
            </>
          )}
        </button>
      </div>

      <style>{`
        .share-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
        }

        .share-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: transparent;
          font-size: var(--font-size-xs);
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-body);
          white-space: nowrap;
        }

        .share-btn:hover {
          background: var(--color-bg-secondary);
          border-color: var(--color-text-muted);
          color: var(--color-text-primary);
        }

        .share-btn--whatsapp:hover {
          background: rgba(37, 211, 102, 0.1);
          border-color: #25D366;
          color: #128C7E;
        }

        .share-btn--telegram:hover {
          background: rgba(0, 136, 204, 0.1);
          border-color: #0088CC;
          color: #0088CC;
        }

        .share-btn--facebook:hover {
          background: rgba(24, 119, 242, 0.1);
          border-color: #1877F2;
          color: #1877F2;
        }

        .share-btn--copied {
          background: var(--color-success-bg);
          border-color: var(--color-success);
          color: var(--color-success);
        }

        .share-btn--failed {
          background: var(--color-error-bg);
          border-color: var(--color-error);
          color: var(--color-error);
        }
      `}</style>
    </>
  );
}
