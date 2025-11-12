'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

// ---- Types ----
type AnyRecord = Record<string, any>;

type Result = {
  id: string;
  title: string;
  section: 'stock' | 'files';
  href: string;
  thumb?: string;
  badges?: string[];
};

// ---- Helpers ----
function norm(v: any): string {
  return (v ?? '').toString().toLowerCase();
}

function includes(hay: string, needle: string) {
  return hay.indexOf(needle) !== -1;
}

function matchScore(q: string, fields: string[]): number {
  if (!q) return 0;
  let best = Infinity;
  for (const f of fields) {
    const i = f.indexOf(q);
    if (i !== -1 && i < best) best = i;
  }
  return best === Infinity ? -1 : best;
}

// ---- Command Menu ----
export default function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [section, setSection] = React.useState<'all' | 'files' | 'stock'>('all');
  const [results, setResults] = React.useState<Result[]>([]);
  const [cursor, setCursor] = React.useState(0);
  const [dataTick, setDataTick] = React.useState(0);

  // Data caches
  const stockRef = React.useRef<AnyRecord[] | null>(null);
  const filesRef = React.useRef<AnyRecord[] | null>(null);

  // Load datasets lazily when menu opens
  React.useEffect(() => {
    if (!open) return;
    let cancel = false;

    (async () => {
      // STOCK — import canonical dataset
      try {
        let mod: any = null;
        try { mod = await import('../stock/data'); } catch {}
        const arr = (mod as any)?.STOCK ?? (mod as any)?.default ?? [];
        if (!cancel) stockRef.current = Array.isArray(arr) ? arr : [];
        console.debug('[CommandMenu] STOCK items loaded:', Array.isArray(stockRef.current) ? stockRef.current.length : 0);
        if (!cancel) setDataTick((t) => t + 1);
      } catch {}

      // FILES — import canonical dataset
      try {
        let mod: any = null;
        try { mod = await import('../files/data'); } catch {}
        const arr = (mod as any)?.FILES ?? (mod as any)?.default ?? [];
        if (!cancel) filesRef.current = Array.isArray(arr) ? arr : [];
        console.debug('[CommandMenu] FILES items loaded:', Array.isArray(filesRef.current) ? filesRef.current.length : 0);
        if (!cancel) setDataTick((t) => t + 1);
      } catch {
        if (!cancel) filesRef.current = [];
      }
    })();

    return () => { cancel = true; };
  }, [open]);

  // Global hotkey ⌘K / Ctrl+K and `/` for quick open
  React.useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if ((isMod && (e.key === 'k' || e.key === 'K')) || e.key === 'F2') {
        e.preventDefault();
        setOpen((v) => !v);
        setTimeout(() => {
          const el = document.getElementById('cbx-command-input') as HTMLInputElement | null;
          el?.focus();
        }, 0);
      }
      if (!open && e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => {
          const el = document.getElementById('cbx-command-input') as HTMLInputElement | null;
          el?.focus();
        }, 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Build results whenever q/section/data changes
  React.useEffect(() => {
    const qn = norm(q);
    const out: Result[] = [];

    const pushStock = (row: AnyRecord) => {
      const id = (row.id ?? '').toString();
      const title = row.title || row.alt || id;
      const text = [norm(id), norm(title), norm((row.tags || []).join(' '))].join(' \n ');
      const score = matchScore(qn, [text]);
      if (qn && score < 0) return;
      out.push({
        id,
        title,
        section: 'stock',
        href: `/stock/${id}`,
        thumb: row.src,
        badges: row.tags?.slice(0, 2) || [],
      });
    };

    const pushFiles = (row: AnyRecord) => {
      const id = (row.id ?? '').toString();
      const title = row.title || row.filename || row.alt || id;
      const meta = [row.folderName, row.folderId, (row.tags || []).join(' ')].filter(Boolean).join(' ');
      const text = [norm(id), norm(title), norm(meta)].join(' \n ');
      const score = matchScore(qn, [text]);
      if (qn && score < 0) return;
      out.push({
        id,
        title,
        section: 'files',
        href: `/files?select=${encodeURIComponent(id)}`,
        thumb: row.thumb || row.src,
        badges: [row.folderName].filter(Boolean),
      });
    };

    if (section === 'all' || section === 'stock') {
      (stockRef.current || []).forEach(pushStock);
    }
    if (section === 'all' || section === 'files') {
      (filesRef.current || []).forEach(pushFiles);
    }

    // Simple ranking: prioritize startsWith matches, then includes
    const ranked = out
      .map((r) => ({
        r,
        rank: qn ? (norm(r.title).startsWith(qn) ? 0 : norm(r.title).includes(qn) ? 1 : 2) : 3,
      }))
      .sort((a, b) => a.rank - b.rank)
      .map((x) => x.r)
      .slice(0, 30);

    setResults(ranked);
    setCursor(0);
  }, [q, section, open, dataTick]);

  // Keyboard navigation inside the list
  const onListKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = results[cursor];
      if (sel) router.push(sel.href);
    }
  };

  if (!mounted) return null;

  return createPortal(
    open ? (
      <div aria-modal className="fixed inset-0 z-[100000] isolate">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

        {/* Panel */}
        <div className="absolute left-1/2 top-[12vh] z-10 w-[92vw] max-w-2xl -translate-x-1/2 rounded-xl border bg-white/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80">
          {/* Header: input + tabs */}
          <div className="border-b p-2">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-60"><path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 001.57-4.23C15.99 6.01 13.98 4 11.49 4S7 6.01 7 8.5 9.01 13 11.5 13c1.61 0 3.06-.59 4.23-1.57l.27.28v.79l4.25 4.25L19.75 18 15.5 14zm-4 0C9.01 14 7 11.99 7 9.5S9.01 5 11.5 5 16 7.01 16 9.5 13.99 14 11.5 14z"/></svg>
              <input
                id="cbx-command-input"
                value={q}
                onChange={(e) => setQ(e.currentTarget.value)}
                placeholder="Søg i hele platformen… (⌘K)"
                className="h-10 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
                onKeyDown={onListKey}
                autoFocus
              />
              <button onClick={() => setOpen(false)} className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100">Luk</button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              {(['all','files','stock'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSection(tab)}
                  className={`rounded-full border px-2.5 py-1 ${section===tab ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-50'}`}
                >
                  {tab === 'all' ? 'Alle' : tab === 'files' ? 'Files' : 'Stock'}
                </button>
              ))}
              <span className="ml-auto text-zinc-500">Enter for at åbne · ↑/↓ navigér</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-auto p-2" onKeyDown={onListKey} tabIndex={0}>
            {results.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500">
                Søg på tværs af Files og Stock…
                {(!stockRef.current || stockRef.current.length === 0) && (!filesRef.current || filesRef.current.length === 0) ? (
                  <div className="mt-3 text-xs text-zinc-400">
                    Ingen datakilder fundet. Tilføj f.eks.:
                    <pre className="mt-2 rounded bg-zinc-50 p-2 text-left whitespace-pre-wrap">app/stock/data.ts → export const STOCK = [ {'{'} id, title, src, tags {'}'} ];
app/files/data.ts → export const FILES = [ {'{'} id, title, thumb/src, folderName, tags {'}'} ];</pre>
                  </div>
                ) : null}
              </div>
            ) : (
              <ul className="divide-y">
                {results.map((r, i) => (
                  <li key={`${r.section}-${r.id}`}>
                    <button
                      className={`flex w-full items-center gap-3 px-2 py-2 text-left ${i===cursor ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => router.push(r.href)}
                    >
                      <div className="h-10 w-14 overflow-hidden rounded bg-zinc-100 ring-1 ring-black/5">
                        {r.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.thumb} alt="" className="h-full w-full object-cover"/>
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs text-zinc-400">{r.section}</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-zinc-900">{r.title}</div>
                        <div className="truncate text-xs text-zinc-500">{r.section === 'stock' ? 'Stock' : 'Files'}</div>
                      </div>
                      {r.badges?.length ? (
                        <div className="hidden md:flex items-center gap-1">
                          {r.badges.map((b) => (
                            <span key={b} className="truncate rounded-full border px-2 py-0.5 text-[10px] text-zinc-600">{b}</span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    ) : null,
    document.body
  );
}
