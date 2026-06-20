export async function trackQualifiedView(kathaId: string, watchedSeconds: number) {
  if (typeof window === 'undefined' || watchedSeconds < 30) return;

  const storageKey = 'sikh-katha-session-key';
  let sessionKey = window.sessionStorage.getItem(storageKey);
  if (!sessionKey) {
    sessionKey = crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, sessionKey);
  }

  await fetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kathaId, sessionKey, watchedSeconds }),
    keepalive: true,
  });
}
