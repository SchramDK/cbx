'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

type Folder = { id: string; name: string };

export default function FoldersNav({
  activeId,
  onSelectAction,
}: {
  activeId?: string;
  onSelectAction?: (id: string) => void;
}) {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    // Demo: statisk liste – byt til fetch('/api/folders')
    setFolders([
      { id: 'all', name: 'All photos' },
      { id: 'ferier', name: 'Ferier' },
      { id: 'por', name: 'Portrætter' },
      { id: 'prod', name: 'Produkter' },
    ]);
  }, []);

  return (
    <div className="px-3 pt-2">
      <div className="text-[11px] uppercase tracking-wide text-zinc-400 px-2 mb-2">Mapper</div>
      <ul className="space-y-1">
        {folders.map(f => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => onSelectAction?.(f.id)}
              className={clsx(
                'w-full text-left px-2 py-1.5 rounded hover:bg-zinc-50',
                activeId === f.id ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-700'
              )}
            >
              {f.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}