import { IKatha } from '@/types';
import KathaCard from './KathaCard';

interface KathaGridProps {
  kathas: Array<Partial<IKatha> & { _id: string; title: string; slug: string; type: 'audio' | 'video' }>;
  columns?: 2 | 3 | 4;
}

export default function KathaGrid({ kathas, columns = 4 }: KathaGridProps) {
  return (
    <div className={`katha-grid katha-grid-cols-${columns} stagger-children`}>
      {kathas.map((katha, idx) => (
        <div key={katha._id} style={{ '--stagger-index': idx } as React.CSSProperties}>
          <KathaCard katha={katha} layout="grid" />
        </div>
      ))}

      <style>{`
        .katha-grid {
          display: grid;
          gap: var(--space-6);
        }
        .katha-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .katha-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .katha-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }

        @media (max-width: 1024px) {
          .katha-grid-cols-4 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .katha-grid-cols-4,
          .katha-grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
          .katha-grid { gap: var(--space-5); }
        }
        @media (max-width: 480px) {
          .katha-grid-cols-4,
          .katha-grid-cols-3,
          .katha-grid-cols-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
