'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

type Folder = { id: string; name: string; emoji?: string };

export default function FoldersNav({
  activeId,
  onSelectAction,
}: {
  activeId?: string;
  onSelectAction?: (id: string) => void;
}) {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    // Demo: statisk liste – byt til fetch('/api/folders') ved rigtig data
    setFolders([
      { id: 'all', name: 'Alle', emoji: '📁' },
      { id: 'ferier', name: 'Ferier', emoji: '🏖️' },
      { id: 'por', name: 'Portrætter', emoji: '🧑‍🦰' },
      { id: 'prod', name: 'Produkter', emoji: '📦' },
    ]);
  }, []);

  return (
    <nav role="navigation" aria-label="Mapper" className="px-3 pt-2">
      <div className="text-[11px] uppercase tracking-wide text-zinc-400 px-2 mb-2">Mapper</div>
      <ul className="space-y-1 max-h-[50vh] overflow-auto pr-1">
        {folders.map((f) => {
          const active = f.id === activeId;
          return (
            <li key={f.id} className="relative">
              <button
                type="button"
                onClick={() => onSelectAction?.(f.id)}
                aria-current={active ? 'page' : undefined}
                aria-label={`Åbn mappe ${f.name}`}
                className={clsx(
                  'group relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors outline-none',
                  active
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-700 hover:bg-zinc-50',
                  'focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:bg-zinc-50'
                )}
              >
                {/* Active left rail */}
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-zinc-900"
                  />
                )}

                {/* Icon */}
                <span className="inline-flex w-5 shrink-0 items-center justify-center" aria-hidden>
                  {f.emoji ?? '📁'}
                </span>

                {/* Name */}
                <span className="min-w-0 truncate">{f.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}