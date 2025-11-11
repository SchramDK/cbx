'use client';

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useMemo, useState } from "react";
import Gallery, { DemoItem } from "./ui/Gallery";
import GlobalDropOverlay from "./ui/GlobalDropOverlay";
import ErrorBoundary from "./ui/ErrorBoundary";
import FoldersNav from "../ui/FoldersNav";
import Filters, { FiltersState } from "./ui/Filters";

/** ---- Row type for our demo dataset ---- */
type Row = {
  id: string;
  src: string;
  mime: string;             // "image/jpeg" | "image/png" | "video/mp4" | ...
  has_people: boolean;
  dominant_color: string;   // hex, e.g. "#a18072"
  width?: number;
  height?: number;
  alt?: string;
  palette?: string[];
  folder?: string;          // NEW: demo folder id (matches FoldersNav ids)
};

/** ---- Hand-authored dataset: add your real images here ----
 * Du kan ændre hver post (src, has_people, dominant_color osv.)
 * Kopiér en linje og sæt din egen URL ind. Brug lokale /public-filer
 * eller eksterne URLs. Farven bruges til farvefilteret.
 */
const INITIAL_IMAGES: Row[] = [
  // --- Ferier ---
  {
    id: "hero-01",
    src: "https://picsum.photos/id/1015/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#6b879a",
    width: 1600,
    height: 1066,
    alt: "Mountains and water",
    folder: "ferier",
  },
  {
    id: "beach-01",
    src: "https://picsum.photos/id/1016/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#8ac0d6",
    width: 1600,
    height: 1066,
    alt: "Beach and ocean",
    folder: "ferier",
  },
  {
    id: "forest-01",
    src: "https://picsum.photos/id/1018/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#2e5b3c",
    width: 1600,
    height: 1066,
    alt: "Forest trail",
    folder: "ferier",
  },
  {
    id: "cabins-01",
    src: "https://picsum.photos/id/1019/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#6b4a3b",
    width: 1600,
    height: 1066,
    alt: "Cabins by the lake",
    folder: "ferier",
  },
  {
    id: "lake-01",
    src: "https://picsum.photos/id/1020/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#4a7a8e",
    width: 1600,
    height: 1066,
    alt: "Lake and mountains",
    folder: "ferier",
  },

  // --- Portrætter ---
  {
    id: "people-portrait-01",
    src: "https://picsum.photos/id/1027/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#cfa483",
    width: 1600,
    height: 1066,
    alt: "Portrait",
    folder: "por",
  },
  {
    id: "people-portrait-02",
    src: "https://picsum.photos/id/1021/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#a46f58",
    width: 1600,
    height: 1066,
    alt: "Portrait outdoors",
    folder: "por",
  },
  {
    id: "people-portrait-03",
    src: "https://picsum.photos/id/1024/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#8b6d6a",
    width: 1600,
    height: 1066,
    alt: "Casual portrait",
    folder: "por",
  },
  {
    id: "people-portrait-04",
    src: "https://picsum.photos/id/1025/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#5c6b78",
    width: 1600,
    height: 1066,
    alt: "Studio portrait",
    folder: "por",
  },
  {
    id: "people-portrait-05",
    src: "https://picsum.photos/id/1022/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#b49a85",
    width: 1600,
    height: 1066,
    alt: "Street portrait",
    folder: "por",
  },

  // --- Produkter ---
  {
    id: "product-01",
    src: "https://picsum.photos/id/1060/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#a18072",
    width: 1600,
    height: 1066,
    alt: "Product still life",
    folder: "prod",
  },
  {
    id: "product-02",
    src: "https://picsum.photos/id/1069/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#3c3c3c",
    width: 1600,
    height: 1066,
    alt: "Minimal product",
    folder: "prod",
  },
  {
    id: "product-03",
    src: "https://picsum.photos/id/1074/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#6e8ca0",
    width: 1600,
    height: 1066,
    alt: "Styled product",
    folder: "prod",
  },
  {
    id: "product-04",
    src: "https://picsum.photos/id/1076/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#d3c9b8",
    width: 1600,
    height: 1066,
    alt: "Product on background",
    folder: "prod",
  },
  {
    id: "product-05",
    src: "https://picsum.photos/id/1080/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#4a5568",
    width: 1600,
    height: 1066,
    alt: "Product packaging",
    folder: "prod",
  },

  // --- City / blandet ---
  {
    id: "city-01",
    src: "https://picsum.photos/id/1011/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#2a2a2a",
    width: 1600,
    height: 1066,
    alt: "City skyline",
    folder: "ferier",
  },
  {
    id: "city-02",
    src: "https://picsum.photos/id/1012/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#4b5b6a",
    width: 1600,
    height: 1066,
    alt: "City bridge",
    folder: "ferier",
  },
  {
    id: "city-03",
    src: "https://picsum.photos/id/1013/1600/1066",
    mime: "image/jpeg",
    has_people: true,
    dominant_color: "#6f7a88",
    width: 1600,
    height: 1066,
    alt: "City street",
    folder: "ferier",
  },
  {
    id: "city-04",
    src: "https://picsum.photos/id/1014/1600/1066",
    mime: "image/jpeg",
    has_people: false,
    dominant_color: "#8aa0b5",
    width: 1600,
    height: 1066,
    alt: "Harbor",
    folder: "ferier",
  },
];

export default function FilesPage() {
  /** State: the editable dataset */
  const [rows, setRows] = useState<Row[]>(INITIAL_IMAGES);
  /** Preview of newly dropped images (optional visual cue) */
  const [added, setAdded] = useState<DemoItem[]>([]);
  /** Selected image for metadata editing */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Selected folder (demo-only) */
  const [folderId, setFolderId] = useState<string>('all');

  /** Mobile drawers */
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  /** Filters (restored) */
  const [filters, setFilters] = useState<FiltersState>({
    types: [],
    people: "any",
    colorHex: null,
    colorTolerance: 30,
  });

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
  }, [rows, folderId, filters]);

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

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 flex flex-col gap-6 h-screen overflow-hidden">
        <GlobalDropOverlay onNewImagesAction={handleNew} />

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Files (Demo – håndskrevne billeder)</h1>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500">
              items:{filteredItems.length} · uploads:{added.length}
            </span>
          </div>
        </div>
        {/* Mobile actions */}
        <div className="md:hidden -mt-2 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-white active:scale-[.99]"
          >
            Mapper & Filtre
          </button>
          <button
            onClick={() => selected ? setShowDetails(true) : null}
            disabled={!selected}
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.99]"
          >
            Detaljer
          </button>
        </div>

        <div className="flex gap-6 min-h-0 flex-1 overflow-hidden">
          {/* Left: folders + filters */}
          <div className="hidden md:block w-[260px] shrink-0 space-y-4">
            <FoldersNav activeId={folderId} onSelectAction={setFolderId} />
            <Filters value={filters} onChangeAction={setFilters} />
          </div>

          {/* Center: gallery */}
          <div className="min-w-0 flex-1 overflow-auto md:pr-2">
            <Gallery
              items={filteredItems}
              extra={added}
              selectedId={selectedId ?? undefined}
              onSelectAction={(it) => { setSelectedId(it.id); if (window.innerWidth < 768) setShowDetails(true); }}
            />
          </div>

          {/* Right: simple metadata editor for the selected image */}
          <div className="hidden md:block w-[300px] shrink-0 border-l bg-white p-4">
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
        </div>
        {/* Mobile Drawer: Folders + Filters */}
        {showFilters && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-white shadow-xl flex flex-col">
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
            <div className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-white rounded-t-2xl shadow-2xl">
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