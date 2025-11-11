'use client';

import * as React from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Gallery, { DemoItem } from '../files/ui/Gallery';
import Filters, { FiltersState } from '../files/ui/Filters';

// --- Small colour helpers for tolerance filtering (CIELAB) ---
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
function deltaE(a:{L:number,a:number,b:number}, b:{L:number,a:number,b:number}){ return Math.sqrt((a.L-b.L)**2 + (a.a-b.a)**2 + (a.b-b.b)**2); }

// --- Demo dataset for Stock ---
type StockItem = {
  id: string;
  src: string;
  title: string;
  tags: string[];
  mime: string;            // image/jpeg | image/png | video/mp4 | ...
  has_people: boolean;
  dominant_color: string;  // hex
  width?: number;
  height?: number;
  alt?: string;
};

const STOCK: StockItem[] = [
  // Photos
  { id:'st-001', src:'https://picsum.photos/id/1003/1600/1066', title:'Forest river', tags:['nature','forest','river','water'], mime:'image/jpeg', has_people:false, dominant_color:'#3a5a44', width:1600, height:1066, alt:'Forest river' },
  { id:'st-002', src:'https://picsum.photos/id/1015/1600/1066', title:'Mountains lake', tags:['mountain','lake','nature'], mime:'image/jpeg', has_people:false, dominant_color:'#6b879a', width:1600, height:1066, alt:'Mountains' },
  { id:'st-003', src:'https://picsum.photos/id/1016/1600/1066', title:'Beach', tags:['beach','ocean','summer'], mime:'image/jpeg', has_people:true, dominant_color:'#8ac0d6', width:1600, height:1066, alt:'Beach' },
  { id:'st-004', src:'https://picsum.photos/id/1018/1600/1066', title:'Forest trail', tags:['forest','trail','green'], mime:'image/jpeg', has_people:false, dominant_color:'#2e5b3c', width:1600, height:1066, alt:'Forest' },
  { id:'st-005', src:'https://picsum.photos/id/1020/1600/1066', title:'Lake view', tags:['lake','mountain','travel'], mime:'image/jpeg', has_people:true, dominant_color:'#4a7a8e', width:1600, height:1066, alt:'Lake' },
  { id:'st-006', src:'https://picsum.photos/id/1011/1600/1066', title:'City skyline', tags:['city','skyline','urban'], mime:'image/jpeg', has_people:true, dominant_color:'#2a2a2a', width:1600, height:1066, alt:'City skyline' },
  { id:'st-007', src:'https://picsum.photos/id/1012/1600/1066', title:'City bridge', tags:['city','bridge','architecture'], mime:'image/jpeg', has_people:false, dominant_color:'#4b5b6a', width:1600, height:1066, alt:'Bridge' },
  { id:'st-008', src:'https://picsum.photos/id/1013/1600/1066', title:'Street life', tags:['street','city','people'], mime:'image/jpeg', has_people:true, dominant_color:'#6f7a88', width:1600, height:1066, alt:'Street' },
  { id:'st-009', src:'https://picsum.photos/id/1014/1600/1066', title:'Harbor', tags:['harbor','sea','city'], mime:'image/jpeg', has_people:false, dominant_color:'#8aa0b5', width:1600, height:1066, alt:'Harbor' },

  // Vectors (svg previews)
  { id:'st-v001', src:'https://picsum.photos/id/1054/1600/1066', title:'Line shapes vector', tags:['vector','lines','abstract'], mime:'image/svg+xml', has_people:false, dominant_color:'#3a86ff', width:1600, height:1066, alt:'Vector lines' },
  { id:'st-v002', src:'https://picsum.photos/id/1055/1600/1066', title:'Color blocks vector', tags:['vector','abstract','blocks'], mime:'image/svg+xml', has_people:false, dominant_color:'#ff006e', width:1600, height:1066, alt:'Vector blocks' },
  { id:'st-v003', src:'https://picsum.photos/id/1050/1600/1066', title:'Pattern vector', tags:['vector','pattern'], mime:'image/svg+xml', has_people:false, dominant_color:'#a1b2c3', width:1600, height:1066, alt:'Vector pattern' },

  // Videos (use poster previews)
  { id:'st-vid001', src:'https://picsum.photos/id/1062/1600/1066', title:'Cinematic waves', tags:['video','ocean'], mime:'video/mp4', has_people:false, dominant_color:'#264653', width:1600, height:1066, alt:'Video: waves' },
  { id:'st-vid002', src:'https://picsum.photos/id/1063/1600/1066', title:'City timelapse', tags:['video','city'], mime:'video/mp4', has_people:false, dominant_color:'#2a2a2a', width:1600, height:1066, alt:'Video: city' },
  { id:'st-vid003', src:'https://picsum.photos/id/1064/1600/1066', title:'Forest b-roll', tags:['video','forest'], mime:'video/mp4', has_people:false, dominant_color:'#2e5b3c', width:1600, height:1066, alt:'Video: forest' },
];

function StockPageInner() {
  const [rows] = useState<StockItem[]>(STOCK);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FiltersState>({
    types: [],
    people: 'any',
    colorHex: null,
    colorTolerance: 30,
  });

  type UniverseType = 'photos' | 'vectors' | 'videos' | null;
  const searchParams = useSearchParams();
  const router = useRouter();
  const universe: UniverseType = (searchParams.get('type') as UniverseType) ?? null;
  // Reset search & filters whenever the universe (tabs) changes
  useEffect(() => {
    setQuery('');
    setFilters({
      types: [],
      people: 'any',
      colorHex: null,
      colorTolerance: 30,
    });
    setShowFilters(false);
  }, [universe]);

  // --- Cart state (demo) ---
  type CartItem = DemoItem;
  const [cart, setCart] = useState<CartItem[]>([]);
  const inCart = (id: string) => cart.some(c => c.id === id);
  const addToCart = (item: CartItem) => {
    setCart(prev => (prev.some(c => c.id === item.id) ? prev : [...prev, item]));
    setCartOpen(true);
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));

  // Mobile drawer state
  const [showFilters, setShowFilters] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const list = useMemo<DemoItem[]>(() => {
    // Universe pre-filter (photos | vectors | videos) from URL
    let base = [...rows];
    if (universe === 'photos') {
      base = base.filter(it => it.mime.toLowerCase().startsWith('image/') && it.mime.toLowerCase() !== 'image/svg+xml');
    } else if (universe === 'vectors') {
      base = base.filter(it => it.mime.toLowerCase() === 'image/svg+xml');
    } else if (universe === 'videos') {
      base = base.filter(it => it.mime.toLowerCase().startsWith('video/'));
    }
    let r = base;

    const q = query.trim().toLowerCase();
    if (q) {
      r = r.filter(it => it.title.toLowerCase().includes(q) || it.tags.some(t => t.includes(q)));
    }

    if (filters.types.length) {
      r = r.filter((row) => {
        const m = row.mime.toLowerCase();
        const isPhoto = m.startsWith('image/') && m !== 'image/svg+xml';
        const isVector = m === 'image/svg+xml';
        const isVideo = m.startsWith('video/');
        const pickPhoto = filters.types.includes('photo') && isPhoto;
        const pickVector = filters.types.includes('vector') && isVector;
        const pickVideo = filters.types.includes('video') && isVideo;
        return pickPhoto || pickVector || pickVideo;
      });
    }

    if (filters.people === 'has') r = r.filter(row => row.has_people);
    else if (filters.people === 'none') r = r.filter(row => !row.has_people);

    if (filters.colorHex) {
      try {
        const target = hexToLab(filters.colorHex);
        const tol = typeof filters.colorTolerance === 'number' ? filters.colorTolerance : 30;
        r = r.filter(row => {
          const hx = (row.dominant_color ?? '').trim();
          if (!hx) return false;
          const d = deltaE(target, hexToLab(hx));
          return d <= tol;
        });
        r.sort((a,b) => {
          const da = deltaE(target, hexToLab(a.dominant_color ?? '#000'));
          const db = deltaE(target, hexToLab(b.dominant_color ?? '#000'));
          return da - db;
        });
      } catch {}
    }

    return r.map(it => ({ id: it.id, src: it.src, alt: it.alt ?? it.title, width: it.width, height: it.height }));
  }, [rows, query, filters, universe]);

  // 1) Add helper to detect active filters
  const hasActiveFilters =
    universe !== null ||
    (filters.types && filters.types.length > 0) ||
    filters.people !== 'any' ||
    !!filters.colorHex;

  // 2) Curated blocks for the "Discover" front state (simple slices from STOCK)
  const picksNature = React.useMemo(() => STOCK.filter(it => it.tags.includes('nature') || it.tags.includes('forest')).slice(0, 8), []);
  const picksCity   = React.useMemo(() => STOCK.filter(it => it.tags.includes('city') || it.tags.includes('urban')).slice(0, 8), []);
  const picksPeople = React.useMemo(() => STOCK.filter(it => it.has_people).slice(0, 8), []);

  const toDemo = (it: StockItem): DemoItem => ({
    id: it.id,
    src: it.src,
    alt: it.alt ?? it.title,
    width: it.width,
    height: it.height,
  });

  // Reveal-on-scroll for sections
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.js-reveal'));
    if (!('IntersectionObserver' in window) || els.length === 0) {
      // Fallback: show immediately
      els.forEach(el => el.classList.add('reveal-show'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-show');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 3) Dual mode: Discover front page or Search Results
  return (
    <div className="flex flex-col gap-6">
      {/* Universe Tabs – top of page */}
      <div className="sticky top-0 z-[70] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-2">
          {/* Left: Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: null as UniverseType, label: 'Alle' },
              { key: 'photos' as UniverseType, label: 'Billeder' },
              { key: 'vectors' as UniverseType, label: 'Vektorer' },
              { key: 'videos' as UniverseType, label: 'Video' },
            ]).map((t) => (
              <button
                key={String(t.key)}
                type="button"
                onClick={() => {
                  if (t.key === null) router.push('/stock');
                  else router.push(`/stock?type=${t.key}`);
                }}
                className={
                  'rounded-full px-3 py-1 text-sm transition border ' +
                  (universe === t.key
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50')
                }
                aria-pressed={universe === t.key}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right: Cart */}
          <div ref={cartRef} className="relative">
            <button
              type="button"
              onClick={() => setCartOpen((v) => !v)}
              className={(cartOpen ? 'cart-pulse ' : '') + 'inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 shadow hover:bg-zinc-800'}
              title="Kurv"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44A1.99 1.99 0 0 0 8 18a2 2 0 1 0 2 2h6a2 2 0 1 0 2-2H9.42c.03-.06.06-.12.09-.18l1.1-1.98h6.45a2 2 0 0 0 1.79-1.11l3.58-7.16A1 1 0 0 0 22 4h-2l-3.6 7.2H10.1L7 4z"/></svg>
              <span className="text-sm">Kurv</span>
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-black px-1.5 text-[11px]">
                {cart.length}
              </span>
            </button>

            {cartOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-white shadow-xl p-2">
                {cart.length > 0 ? (
                  <>
                    <div className="max-h-64 overflow-auto divide-y">
                      {cart.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 py-2">
                          <img src={c.src} alt={c.alt ?? ''} className="h-10 w-14 object-cover rounded" />
                          <div className="min-w-0 flex-1 truncate text-sm">{c.alt ?? c.id}</div>
                          <button
                            className="rounded px-2 py-1 text-xs border hover:bg-zinc-50"
                            onClick={() => removeFromCart(c.id)}
                          >
                            Fjern
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-zinc-600">{cart.length} i kurv</div>
                      <button className="rounded bg-black text-white px-3 py-1.5 text-xs hover:bg-zinc-800">Til checkout</button>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-zinc-600">Kurven er tom</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-0" />
      {/* Hero banner */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden rounded-b-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,.35)]">
        <img
          src="https://picsum.photos/id/1056/2000/800"
          alt="Stock inspiration banner"
          className="h-full w-full object-cover will-change-transform animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      {/* Decorative floating blobs */}
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl animate-floaty" />
      <div className="pointer-events-none absolute right-0 -bottom-8 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl animate-floaty-slow" />
        <div className="absolute inset-x-0 bottom-12 flex flex-col items-center text-center text-white px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow">Find det perfekte billede</h1>
          <p className="max-w-2xl text-sm md:text-base text-white/90 mb-4">
            Udforsk millioner af billeder og videoer fra fotografer og kreative over hele verden.
          </p>
          <div className="flex w-full max-w-md overflow-hidden rounded-md border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,.25)] ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-white/50 transition">
            <input
              type="search"
              placeholder="Søg i Stock…"
              value={query}
              onChange={(e)=>setQuery(e.currentTarget.value)}
              className="flex-1 bg-transparent px-4 py-2 text-white placeholder:text-white/70 focus:outline-none focus:bg-white/15"
            />
            <button
              onClick={()=>{}}
              className="px-4 py-2 bg-white/25 hover:bg-white/35 active:bg-white/40 text-white text-sm font-medium transition"
            >
              Søg
            </button>
          </div>
        </div>
      </section>

      <div className="p-4 md:p-6 flex flex-col gap-6 js-reveal">
      {/* Top bar with heading + search */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">
          {universe === 'photos' ? 'Stock · Billeder' : universe === 'vectors' ? 'Stock · Vektorer' : universe === 'videos' ? 'Stock · Video' : 'Stock'}
        </h1>
        <input
          type="search"
          placeholder="Søg i Stock…"
          className="ml-auto w-[260px] rounded border px-3 py-2 text-sm"
          value={query}
          onChange={(e)=>setQuery(e.currentTarget.value)}
        />
      </div>

      {/* Mobile actions */}
      <div className="md:hidden -mt-2 flex items-center gap-3">
        <button
          onClick={() => setShowFilters(true)}
          className="flex-1 rounded-md border px-3 py-2 text-sm bg-white active:scale-[.99]"
        >
          Filtre
        </button>
        <button
          onClick={() => setQuery('')}
          className="rounded-md border px-3 py-2 text-sm bg-white active:scale-[.99]"
        >
          Nulstil søgning
        </button>
      </div>

      {/* If no query, no filters, and no universe → Discover */}
      {(!query && !hasActiveFilters && !universe) ? (
        <div className="space-y-8">
          {/* Theme chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['Nature','City','People','Products','Abstract'].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-full border px-3 py-1 hover:bg-zinc-50 transition ring-1 ring-transparent hover:ring-zinc-200"
                onClick={() => {
                  const q = label.toLowerCase();
                  setQuery(q);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Curated sections */}
          <section className="js-reveal">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Udvalgt: Natur</h2>
              <button className="text-sm text-zinc-600 hover:underline" onClick={()=>setQuery('nature')}>Se flere →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {picksNature.map(it => (
                <div
                  key={it.id}
                  className="relative overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-black/5 hover:ring-black/10 transition shadow-sm hover:shadow-md group"
                >
                  <img src={it.src} alt={it.alt ?? it.title} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {inCart(it.id) ? (
                      <button
                        type="button"
                        className="rounded-md bg-white/90 text-zinc-800 text-xs px-3 py-1.5 shadow"
                        onClick={() => removeFromCart(it.id)}
                      >
                        Fjern fra kurv
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-md bg-white/90 text-zinc-800 text-xs px-3 py-1.5 shadow hover:bg-white"
                        onClick={() => addToCart(toDemo(it))}
                      >
                        Læg i kurv
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="js-reveal">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Udvalgt: By & Urban</h2>
              <button className="text-sm text-zinc-600 hover:underline" onClick={()=>setQuery('city')}>Se flere →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {picksCity.map(it => (
                <div
                  key={it.id}
                  className="relative overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-black/5 hover:ring-black/10 transition shadow-sm hover:shadow-md group"
                >
                  <img src={it.src} alt={it.alt ?? it.title} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {inCart(it.id) ? (
                      <button
                        type="button"
                        className="rounded-md bg-white/90 text-zinc-800 text-xs px-3 py-1.5 shadow"
                        onClick={() => removeFromCart(it.id)}
                      >
                        Fjern fra kurv
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-md bg-white/90 text-zinc-800 text-xs px-3 py-1.5 shadow hover:bg-white"
                        onClick={() => addToCart(toDemo(it))}
                      >
                        Læg i kurv
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="js-reveal">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Udvalgt: People</h2>
              <button className="text-sm text-zinc-600 hover:underline" onClick={()=>setQuery('people')}>Se flere →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {picksPeople.map(it => (
                <div
                  key={it.id}
                  className="relative overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-black/5 hover:ring-black/10 transition shadow-sm hover:shadow-md group"
                >
                  <img src={it.src} alt={it.alt ?? it.title} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {inCart(it.id) ? (
                      <button
                        type="button"
                        className="rounded-md bg-white/90 text-zinc-800 text-xs px-3 py-1.5 shadow"
                        onClick={() => removeFromCart(it.id)}
                      >
                        Fjern fra kurv
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-md bg-white/90 text-zinc-800 text-xs px-3 py-1.5 shadow hover:bg-white"
                        onClick={() => addToCart(toDemo(it))}
                      >
                        Læg i kurv
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        // Otherwise show the search results view (Filters + Gallery)
        <div className="flex gap-6 js-reveal">
          <div className="hidden md:block w-[260px] shrink-0">
            <Filters value={filters} onChangeAction={setFilters} hideType={!!universe} />
          </div>
          <div className="min-w-0 flex-1">
            {list.length > 0 ? (
              <Gallery items={list} onSelectAction={(it) => addToCart(it)} />
            ) : (
              <div className="flex h-40 items-center justify-center rounded border border-dashed text-sm text-zinc-500">
                Ingen resultater – prøv at ændre type, søgning eller filtre.
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      {/* Mobile Drawer: Filters */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b p-3">
              <div className="text-sm font-medium">Filtre</div>
              <button onClick={() => setShowFilters(false)} className="rounded border px-2 py-1 text-sm bg-white">Luk</button>
            </div>
            <div className="p-3 overflow-auto">
              <Filters value={filters} onChangeAction={setFilters} hideType={!!universe} />
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes kenburns {
          0% { transform: scale(1) translateZ(0); }
          100% { transform: scale(1.08) translateZ(0); }
        }
        .animate-kenburns { animation: kenburns 18s ease-in-out infinite alternate; }

        @keyframes floaty {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        .animate-floaty { animation: floaty 6s ease-in-out infinite; }
        .animate-floaty-slow { animation: floaty 11s ease-in-out infinite; }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .js-reveal { opacity: 0; transform: translateY(12px); }
        .js-reveal.reveal-show { animation: fadeUp .45s cubic-bezier(.22,.61,.36,1) forwards; }

        .cart-pulse { animation: cartPulse .6s ease; }
        @keyframes cartPulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function StockPage() {
  return (
    <React.Suspense fallback={<div className="p-6 md:p-10">Indlæser…</div>}>
      <StockPageInner />
    </React.Suspense>
  );
}
