import { IKatha } from '@/types';
import KathaCard from './KathaCard';

interface KathaListProps {
  kathas: Array<Partial<IKatha> & { _id: string; title: string; slug: string; type: 'audio' | 'video' }>;
}

export default function KathaList({ kathas }: KathaListProps) {
  return (
    <div className="katha-list">
      {kathas.map((katha) => (
        <KathaCard key={katha._id} katha={katha} layout="list" />
      ))}
      <style>{`
        .katha-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
      `}</style>
    </div>
  );
}
