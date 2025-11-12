'use client';

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useMemo, useState } from "react";
import Gallery, { DemoItem } from "./ui/Gallery";
import GlobalDropOverlay from "./ui/GlobalDropOverlay";
import ErrorBoundary from "./ui/ErrorBoundary";
import FoldersNav from "../ui/FoldersNav";
import Filters, { FiltersState } from "./ui/Filters";
import { IMAGES, type Row } from "../data/images";


export default function FilesPage() {
  /** State: the editable dataset */
  const [rows, setRows] = useState<Row[]>(IMAGES);
  /** Preview of newly dropped images (optional visual cue) */
  const [added, setAdded] = useState<DemoItem[]>([]);
  /** Selected image for metadata editing */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Selected folder (demo-only) */
  const [folderId, setFolderId] = useState<string>('all');

  /** Text search */
  const [q, setQ] = useState('');

  /** Mobile drawers */
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  /** Desktop: show/hide folders sidebar */
  const [showFolders, setShowFolders] = useState<boolean>(true);
  /** Desktop: show/hide metadata sidebar */
  const [showMeta, setShowMeta] = useState<boolean>(true);

  /** Filters (restored) */
  const [filters, setFilters] = useState<FiltersState>({
    types: [],
    people: "any",
    colorHex: null,
    colorTolerance: 30,
  });

  // Enter animations
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Persist/restore UI state for a nicer demo experience
  React.useEffect(() => {
    try {
      const q0 = localStorage.getItem('FILES_Q');
      const f0 = localStorage.getItem('FILES_FOLDER');
      const s0 = localStorage.getItem('FILES_FILTERS');
      if (q0 !== null) setQ(q0);
      if (f0) setFolderId(f0);
      if (s0) {
        const parsed = JSON.parse(s0);
        if (parsed && typeof parsed === 'object') setFilters((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    // keyboard shortcuts
    const onKey = (e: KeyboardEvent) => {
      // Press '/' to focus search
      if (e.key === '/' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        const el = document.getElementById('files-search-input');
        if (el) (el as HTMLInputElement).focus();
      }
      // Press 'f' to open filters on mobile
      if (e.key.toLowerCase() === 'f' && window.innerWidth < 768) {
        setShowFilters(true);
      }
      // Escape closes drawers
      if (e.key === 'Escape') {
        setShowFilters(false);
        setShowDetails(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem('FILES_Q', q); } catch {}
  }, [q]);
  React.useEffect(() => {
    try { localStorage.setItem('FILES_FOLDER', folderId); } catch {}
  }, [folderId]);
  React.useEffect(() => {
    try { localStorage.setItem('FILES_FILTERS', JSON.stringify(filters)); } catch {}
  }, [filters]);

  // Restore folder visibility
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('FILES_SHOW_FOLDERS');
      if (v === '0') setShowFolders(false);
      if (v === '1') setShowFolders(true);
    } catch {}
  }, []);

  // Restore metadata visibility
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('FILES_SHOW_META');
      if (v === '0') setShowMeta(false);
      if (v === '1') setShowMeta(true);
    } catch {}
  }, []);

  // Persist folder visibility
  React.useEffect(() => {
    try { localStorage.setItem('FILES_SHOW_FOLDERS', showFolders ? '1' : '0'); } catch {}
  }, [showFolders]);

  // Persist metadata visibility
  React.useEffect(() => {
    try { localStorage.setItem('FILES_SHOW_META', showMeta ? '1' : '0'); } catch {}
  }, [showMeta]);

  /** Add new images (drag-drop) into our dataset with default metadata */
  const handleNew = React.useCallback((files: DemoItem[]) => {
    // files: { id, src, alt? } from GlobalDropOverlay
    setAdded((prev) => [...files, ...prev]);

    const toAdd: Row[] = files.map((f, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      src: f.src,
      mime: "image/jpeg",
      has_people: false,
      dominant_color: "#a18072", // sæt en default; kan rettes i panelet
      width: 1200,
      height: 800,
      alt: f.alt ?? "Uploaded image",
      folder: folderId, // NEW: place new uploads in active folder
    }));

    setRows((prev) => [...toAdd, ...prev]);
    if (!selectedId && toAdd[0]) setSelectedId(toAdd[0].id);
    // Kick off palette extraction for the newly added items
    toAdd.forEach(row => loadPaletteFor(row.id, row.src));
  }, [selectedId, folderId]);
  // Track palettes being fetched to avoid duplicate calls
  const pendingPalette = React.useRef<Set<string>>(new Set());

  function hexToRgb(hex: string) {
    const h = hex.replace('#','');
    const n = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToLab(r:number,g:number,b:number){
    [r,g,b] = [r,g,b].map(v=>{ v/=255; return v>0.04045 ? Math.pow((v+0.055)/1.055,2.4) : v/12.92; });
    const x = r*0.4124 + g*0.3576 + b*0.1805;
    const y = r*0.2126 + g*0.7152 + b*0.0722;
    const z = r*0.0193 + g*0.1192 + b*0.9505;
    const f=(t:number)=> t>0.008856 ? Math.cbrt(t) : (7.787*t)+(16/116);
    const X = f(x/0.95047), Y = f(y/1), Z = f(z/1.08883);
    return { L:(116*Y)-16, a:500*(X-Y), b:200*(Y-Z) };
  }
  function hexToLab(hex:string){ const {r,g,b}=hexToRgb(hex); return rgbToLab(r,g,b); }
  function deltaE(a:{L:number,a:number,b:number}, b:{L:number,a:number,b:number}){
    return Math.sqrt((a.L-b.L)**2 + (a.a-b.a)**2 + (a.b-b.b)**2);
  }

  /** Build gallery items with folder + filters */
  const filteredItems = useMemo(() => {
    let r = [...rows];

    // Text query (id/alt)
    const qq = q.trim().toLowerCase();
    if (qq) {
      r = r.filter(row => {
        const hay = `${row.id} ${row.alt ?? ''}`.toLowerCase();
        return hay.includes(qq);
      });
    }

    // Folder filter (demo)
    if (folderId !== 'all') {
      r = r.filter(row => row.folder === folderId);
    }

    // Type filter
    if (filters.types.length) {
      r = r.filter((row) => {
        const m = row.mime.toLowerCase();
        const isPhoto = m.startsWith("image/") && m !== "image/svg+xml";
        const isVector = m === "image/svg+xml";
        const isVideo = m.startsWith("video/");
        const pickPhoto = filters.types.includes("photo") && isPhoto;
        const pickVector = filters.types.includes("vector") && isVector;
        const pickVideo = filters.types.includes("video") && isVideo;
        return pickPhoto || pickVector || pickVideo;
      });
    }

    // People filter
    if (filters.people === "has") r = r.filter((row) => row.has_people);
    else if (filters.people === "none") r = r.filter((row) => !row.has_people);

    // Color + tolerance (CIELAB ΔE threshold using slider 0–100)
    if (filters.colorHex) {
      try {
        const target = hexToLab(filters.colorHex);
        const tol = typeof filters.colorTolerance === 'number' ? filters.colorTolerance : 30;
        r = r.filter((row) => {
          const hx = (row.dominant_color ?? "").trim();
          if (!hx) return false;
          const d = deltaE(target, hexToLab(hx));
          return d <= tol;
        });
        // Optional: sort by nearest color first
        r.sort((a,b) => {
          const da = deltaE(target, hexToLab(a.dominant_color ?? '#000'));
          const db = deltaE(target, hexToLab(b.dominant_color ?? '#000'));
          return da - db;
        });
      } catch {}
    }

    return r.map((row) => ({
      id: row.id,
      src: row.src,
      alt: row.alt ?? "Image",
      width: row.width,
      height: row.height,
    })) as DemoItem[];
  }, [rows, folderId, filters, q]);

  // Ensure selection stays valid when filters/search change
  React.useEffect(() => {
    if (!selectedId) return;
    const ok = filteredItems.some((it) => it.id === selectedId);
    if (!ok) setSelectedId(null);
  }, [filteredItems, selectedId]);

  /** Selected row + convenience setters */
  const selected = selectedId ? rows.find(r => r.id === selectedId) ?? null : null;
  const updateSelected = <K extends keyof Row>(key: K, value: Row[K]) => {
    setRows(prev => prev.map(r => r.id === selectedId ? { ...r, [key]: value } : r));
  };

  async function loadPaletteFor(id: string, src: string) {
    if (!id || !src) return;
    if (pendingPalette.current.has(id)) return; // already fetching
    pendingPalette.current.add(id);
    try {
      const res = await fetch(`/api/palette?url=${encodeURIComponent(src)}`);
      const json = await res.json();
      if (json?.colors?.length) {
        setRows(prev => prev.map(r => r.id === id ? { ...r, palette: json.colors } : r));
      }
    } catch (err) {
      console.error("Palette load failed", err);
    } finally {
      pendingPalette.current.delete(id);
    }
  }

  // Auto-load palettes for any rows without palette (limited concurrency per pass)
  React.useEffect(() => {
    const targets = rows.filter(r => !r.palette && r.src);
    if (targets.length === 0) return;

    // Fetch up to 4 at a time per render pass
    const batch = targets.slice(0, 4);
    batch.forEach(r => loadPaletteFor(r.id, r.src));
  }, [rows]);

  // — UX helpers —
  const hasActiveFilters = useMemo(() => {
    const hasTypes = filters.types && filters.types.length > 0;
    const hasPeople = filters.people !== 'any';
    const hasColor = !!filters.colorHex;
    const hasQuery = q.trim().length > 0;
    const notAllFolder = folderId !== 'all';
    return hasTypes || hasPeople || hasColor || hasQuery || notAllFolder;
  }, [filters, q, folderId]);

  const clearQuery = () => setQ('');
  const clearTypes = () => setFilters((f) => ({ ...f, types: [] }));
  const clearPeople = () => setFilters((f) => ({ ...f, people: 'any' }));
  const clearColor = () => setFilters((f) => ({ ...f, colorHex: null }));
  const clearFolder = () => setFolderId('all');
  const clearAllFilters = () => {
    setQ('');
    setFolderId('all');
    setFilters({ types: [], people: 'any', colorHex: null, colorTolerance: 30 });
  };

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 flex flex-col gap-6 h-screen overflow-hidden">
        <GlobalDropOverlay onNewImagesAction={handleNew} />

        <div className="sticky -top-px z-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent" />
          <div
            className={
              `relative flex items-center justify-between border-b bg-white/80 px-2 py-2 md:px-3 md:py-2 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`
            }
          >
            <h1 className="text-base md:text-lg font-semibold">Filer</h1>
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFolders((v) => !v)}
                aria-pressed={showFolders}
                className="rounded border px-2 py-2 text-xs bg-white hover:bg-zinc-50 active:scale-95"
                title={showFolders ? 'Skjul mapper' : 'Vis mapper'}
              >
                {showFolders ? 'Skjul mapper' : 'Vis mapper'}
              </button>
              <button
                type="button"
                onClick={() => setShowMeta((v) => !v)}
                aria-pressed={showMeta}
                className="rounded border px-2 py-2 text-xs bg-white hover:bg-zinc-50 active:scale-95"
                title={showMeta ? 'Skjul detaljer' : 'Vis detaljer'}
              >
                {showMeta ? 'Skjul detaljer' : 'Vis detaljer'}
              </button>
              <div className="relative">
                <input
                  id="files-search-input"
                  type="search"
                  placeholder="Søg i filer… (tryk /)"
                  value={q}
                  onChange={(e)=>setQ(e.currentTarget.value)}
                  className="w-[260px] rounded border px-3 py-2 text-sm pr-8"
                  aria-label="Søg i filer"
                />
                {q && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded hover:bg-zinc-100 active:scale-95"
                    aria-label="Ryd søgning"
                  >
                    ×
                  </button>
                )}
              </div>
              <span className="text-[11px] text-zinc-500" aria-live="polite">
                {filteredItems.length} elementer
              </span>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="bg-white/80 px-2 pb-2 md:px-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-xs uppercase tracking-wide text-zinc-400">Aktive filtre:</span>
                {folderId !== 'all' && (
                  <button onClick={clearFolder} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-zinc-50">Mappe: {folderId} <span aria-hidden>×</span></button>
                )}
                {!!q && (
                  <button onClick={clearQuery} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-zinc-50">Søgning: “{q}” <span aria-hidden>×</span></button>
                )}
                {filters.types?.length ? (
                  <button onClick={clearTypes} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-zinc-50">Type: {filters.types.join(', ')} <span aria-hidden>×</span></button>
                ) : null}
                {filters.people !== 'any' ? (
                  <button onClick={clearPeople} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-zinc-50">Personer: {filters.people === 'has' ? 'Ja' : 'Nej'} <span aria-hidden>×</span></button>
                ) : null}
                {filters.colorHex ? (
                  <button onClick={clearColor} className="inline-flex items-center gap-2 rounded-full border px-2 py-1 hover:bg-zinc-50">
                    <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: filters.colorHex }} />
                    <span>Farve</span> <span aria-hidden>×</span>
                  </button>
                ) : null}
                <button onClick={clearAllFilters} className="ml-auto inline-flex items-center gap-1 rounded-full border px-3 py-1 text-zinc-600 hover:bg-zinc-50">Nulstil alle</button>
              </div>
            </div>
          )}
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
        {/* Mobile actions */}
        <div className="md:hidden -mt-2 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-white active:scale-[.99]"
          >
            Mapper og filtre
          </button>
          <button
            onClick={() => selected ? setShowDetails(true) : null}
            disabled={!selected}
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.99]"
          >
            Detaljer
          </button>
        </div>
        {/* Mobile search */}
        <div className="md:hidden -mt-2">
          <div className="relative">
            <input
              id="files-search-input"
              type="search"
              placeholder="Søg i filer… (tryk /)"
              value={q}
              onChange={(e)=>setQ(e.currentTarget.value)}
              className="w-full rounded-md border px-3 py-2 pr-9 text-sm bg-white"
              aria-label="Søg i filer"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 rounded hover:bg-zinc-100"
                aria-label="Ryd søgning"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6 min-h-0 flex-1 overflow-hidden">
          {/* Leftmost: folders (full height) */}
          {showFolders && (
            <div className={`hidden md:block w-[220px] shrink-0 space-y-4 transition-all duration-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
              <FoldersNav activeId={folderId} onSelectAction={setFolderId} />
            </div>
          )}
          {/* Left: filters panel (second column) */}
          <div className={`hidden md:block w-[260px] shrink-0 space-y-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
            <Filters value={filters} onChangeAction={setFilters} />
          </div>

          {/* Center: gallery */}
          <div className={`relative min-w-0 flex-1 overflow-auto md:pr-2 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
            {filteredItems.length === 0 ? (
              <div className="h-full grid place-items-center p-6">
                <div className="text-center max-w-sm">
                  <div className="text-lg font-medium mb-1">Ingen resultater</div>
                  <p className="text-sm text-zinc-600 mb-3">Prøv at ændre dine filtre eller ryd søgningen.</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      className="rounded border px-3 py-2 text-sm bg-white hover:bg-zinc-50 active:scale-95"
                      onClick={clearAllFilters}
                    >
                      Nulstil alle filtre
                    </button>
                    {folderId !== 'all' && (
                      <button
                        className="rounded border px-3 py-2 text-sm bg-white hover:bg-zinc-50 active:scale-95"
                        onClick={clearFolder}
                      >
                        Gå til Alle mapper
                      </button>
                    )}
                    {!!filters.colorHex && (
                      <button
                        className="rounded border px-3 py-2 text-sm bg-white hover:bg-zinc-50 active:scale-95"
                        onClick={clearColor}
                      >
                        Fjern farvefilter
                      </button>
                    )}
                    {!!q && (
                      <button
                        className="rounded border px-3 py-2 text-sm bg-white hover:bg-zinc-50 active:scale-95"
                        onClick={clearQuery}
                      >
                        Ryd søgning
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Gallery
                items={filteredItems}
                extra={added}
                selectedId={selectedId ?? undefined}
                onSelectAction={(it) => { setSelectedId(it.id); if (window.innerWidth < 768) setShowDetails(true); }}
              />
            )}
          </div>

          {/* Right: simple metadata editor for the selected image */}
          {showMeta && (
            <div className={`hidden md:block w-[300px] shrink-0 border-l bg-white p-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
              <div className="text-sm font-medium mb-3">Metadata</div>
              {!selected ? (
                <div className="text-sm text-zinc-600">Klik på et billede for at redigere metadata.</div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => e.preventDefault()}
                >
                <div className="text-xs uppercase tracking-wide text-zinc-400">ID</div>
                <div className="text-sm">{selected.id}</div>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">Alt tekst</span>
                  <input
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={selected.alt ?? ""}
                    onChange={(e) => updateSelected("alt", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">MIME-type</span>
                  <select
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={selected.mime}
                    onChange={(e) => updateSelected("mime", e.target.value)}
                  >
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/png">image/png</option>
                    <option value="image/svg+xml">image/svg+xml</option>
                    <option value="video/mp4">video/mp4</option>
                  </select>
                </label>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has_people}
                      onChange={(e) => updateSelected("has_people", e.currentTarget.checked)}
                    />
                    <span className="text-sm">Mennesker</span>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">Dominerende farve</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={selected.dominant_color}
                      onChange={(e) => updateSelected("dominant_color", e.currentTarget.value)}
                    />
                    <input
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={selected.dominant_color}
                      onChange={(e) => updateSelected("dominant_color", e.currentTarget.value)}
                    />
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-xs uppercase tracking-wide text-zinc-400">Width</span>
                    <input
                      type="number"
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      value={selected.width ?? 0}
                      onChange={(e) => updateSelected("width", Number(e.currentTarget.value))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-wide text-zinc-400">Height</span>
                    <input
                      type="number"
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      value={selected.height ?? 0}
                      onChange={(e) => updateSelected("height", Number(e.currentTarget.value))}
                    />
                  </label>
                </div>

                {selected?.palette?.length ? (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">Palette (5)</div>
                    <div className="flex gap-2 mb-2">
                      {selected.palette.map(hex => (
                        <div key={hex} className="h-6 w-6 rounded border" style={{ backgroundColor: hex }} title={hex} />
                      ))}
                    </div>
                  </div>
                ) : null}


                <button
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => setSelectedId(null)}
                >
                  Luk
                </button>
              </form>
            )}
          </div>
          )}
        </div>
        {/* Mobile Drawer: Folders + Filters */}
        {showFilters && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
              <div className="flex items-center justify-between border-b p-3">
                <div className="text-sm font-medium">Mapper & Filtre</div>
                <button onClick={() => setShowFilters(false)} className="rounded border px-2 py-1 text-sm bg-white">Luk</button>
              </div>
              <div className="p-3 space-y-4 overflow-auto">
                <FoldersNav activeId={folderId} onSelectAction={(id)=>{ setFolderId(id); }} />
                <Filters value={filters} onChangeAction={setFilters} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Drawer: Details */}
        {showDetails && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowDetails(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out translate-y-0">
              <div className="flex items-center justify-between border-b p-3">
                <div className="text-sm font-medium">Detaljer</div>
                <button onClick={() => setShowDetails(false)} className="rounded border px-2 py-1 text-sm bg-white">Luk</button>
              </div>
              <div className="p-4 overflow-auto">
                {!selected ? (
                  <div className="text-sm text-zinc-600">Vælg et billede i galleriet.</div>
                ) : (
                  <form className="space-y-3" onSubmit={(e)=>e.preventDefault()}>
                    <div className="text-xs uppercase tracking-wide text-zinc-400">ID</div>
                    <div className="text-sm">{selected.id}</div>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wide text-zinc-400">Alt tekst</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1 text-sm"
                        value={selected.alt ?? ''}
                        onChange={(e)=>updateSelected('alt', e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wide text-zinc-400">MIME-type</span>
                      <select
                        className="mt-1 w-full border rounded px-2 py-1 text-sm"
                        value={selected.mime}
                        onChange={(e)=>updateSelected('mime', e.target.value)}
                      >
                        <option value="image/jpeg">image/jpeg</option>
                        <option value="image/png">image/png</option>
                        <option value="image/svg+xml">image/svg+xml</option>
                        <option value="video/mp4">video/mp4</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected.has_people}
                        onChange={(e)=>updateSelected('has_people', e.currentTarget.checked)}
                      />
                      <span className="text-sm">Mennesker</span>
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wide text-zinc-400">Dominerende farve</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="color" value={selected.dominant_color} onChange={(e)=>updateSelected('dominant_color', e.currentTarget.value)} />
                        <input
                          className="flex-1 border rounded px-2 py-1 text-sm"
                          value={selected.dominant_color}
                          onChange={(e)=>updateSelected('dominant_color', e.currentTarget.value)}
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wide text-zinc-400">Width</span>
                        <input type="number" className="mt-1 w-full border rounded px-2 py-1 text-sm" value={selected.width ?? 0} onChange={(e)=>updateSelected('width', Number(e.currentTarget.value))} />
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wide text-zinc-400">Height</span>
                        <input type="number" className="mt-1 w-full border rounded px-2 py-1 text-sm" value={selected.height ?? 0} onChange={(e)=>updateSelected('height', Number(e.currentTarget.value))} />
                      </label>
                    </div>
                    {selected?.palette?.length ? (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">Palette (5)</div>
                        <div className="flex gap-2 mb-2">
                          {selected.palette.map(hex => (
                            <div key={hex} className="h-6 w-6 rounded border" style={{ backgroundColor: hex }} title={hex} />
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <button className="mt-2 w-full rounded-md border px-3 py-2 text-sm bg-white" onClick={()=>setShowDetails(false)}>Luk</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}