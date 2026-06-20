'use client';

import KathaActions from '@/components/katha/KathaActions';
import { IKatha } from '@/types';

export default function VideoDetailClient({
  katha,
  isAuthenticated,
}: {
  katha: IKatha;
  isAuthenticated: boolean;
}) {
  return (
    <div className="video-action-bar">
      <div className="video-actions">
        <KathaActions katha={katha} isAuthenticated={isAuthenticated} />
      </div>

      <style>{`
        .video-action-bar {
          display: flex;
          align-items: center;
          padding: var(--space-3) 0;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        .video-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
