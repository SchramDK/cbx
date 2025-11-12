'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { STOCK, type StockItem } from '../data';

function normalizeId(raw: string | string[] | undefined) {
  if (!raw) return '';
  const s0 = Array.isArray(raw) ? raw[0] : raw;
  let s = decodeURIComponent(s0 || '');
  const q = s.indexOf('?');
  if (q !== -1) s = s.slice(0, q);
  const h = s.indexOf('#');
  if (h !== -1) s = s.slice(0, h);
  return s.trim();
}

function findItem(id: string): StockItem | undefined {
  if (!id) return undefined;
  let it = STOCK.find((x) => x.id === id);
  if (it) return it;
  const low = id.toLowerCase();
  it = STOCK.find((x) => x.id.toLowerCase() === low);
  return it;
}

export default function StockPreviewPage() {
  const params = useParams();
  const rawId = (params as Record<string, any>)?.id as string | string[] | undefined;
  const id = useMemo(() => normalizeId(rawId), [rawId]);
  const item = useMemo(() => findItem(id), [id]);

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded border bg-white p-4">
          <p className="font-medium text-zinc-900">Elementet findes ikke.</p>
          <p className="mt-1 text-sm text-zinc-600">Efterspurgt id: <code className="rounded bg-zinc-50 px-1 py-0.5">{String(id || '')}</code></p>
          <p className="mt-2 text-sm text-zinc-600">Tilbage til <Link className="underline" href="/stock">stock</Link>.</p>
        </div>
      </div>
    );
  }

  const isVideo = item.mime?.startsWith('video/') ?? false;
  const isVector = item.mime === 'image/svg+xml';

  const related = useMemo(() => (
    (item.tags?.length ?
      STOCK.filter(x => x.id !== item.id && x.tags.some(t => item.tags.includes(t))) :
      STOCK.filter(x => x.id !== item.id)
    ).slice(0, 12)
  ), [item]);

  return (
    <div className="w-full">
      {/* Top bar: breadcrumb + title */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="w-full px-6 py-3 md:px-10 md:py-4">
          <nav className="flex items-center gap-2 text-sm text-zinc-600">
            <Link href="/stock" className="rounded-full border px-3 py-1 hover:bg-zinc-50">Stock</Link>
            <span className="text-zinc-400">/</span>
            <span className="truncate font-medium text-zinc-900" title={item.title}>{item.title}</span>
          </nav>
        </div>
      </div>

      {/* Main two-column */}
      <div className="w-full px-4 md:px-8 lg:px-12 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8">
          {/* Left: Large media viewer */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-lg bg-black">
              <div className="flex h-[75vh] items-center justify-center md:h-[calc(100vh-180px)]">
                {isVideo ? (
                  <video controls preload="metadata" poster={item.src} className="max-h-full max-w-full object-contain">
                    <source src={item.src} type={item.mime || 'video/mp4'} />
                  </video>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt ?? item.title}
                    className="block max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Info below media (title, short meta, tags) */}
            <section className="mt-6 space-y-4">
              <h1 className="text-2xl lg:text-3xl font-semibold leading-tight text-zinc-900">{item.title}</h1>
              <dl className="grid grid-cols-1 gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                <div className="flex items-center justify-between sm:block">
                  <dt className="text-zinc-500">Type</dt>
                  <dd>{isVideo ? 'Video' : isVector ? 'Vektor' : 'Billede'}</dd>
                </div>
                {item.width && item.height ? (
                  <div className="flex items-center justify-between sm:block">
                    <dt className="text-zinc-500">Dimensioner</dt>
                    <dd>{item.width} × {item.height}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between sm:block">
                  <dt className="text-zinc-500">Personer</dt>
                  <dd>{item.has_people ? 'Ja' : 'Nej'}</dd>
                </div>
              </dl>

              {!!item.tags?.length && (
                <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {item.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/stock?q=${encodeURIComponent(t)}`}
                      className="whitespace-nowrap rounded-full border px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Related images */}
            {related.length > 0 && (
              <section className="mt-8">
                <h3 className="mb-3 text-base font-semibold">Lignende filer</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/stock/${r.id}`}
                      className="group block overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-black/5 transition hover:shadow-md hover:ring-black/10"
                    >
                      <img
                        src={r.src}
                        alt={r.alt ?? r.title}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Purchase & Details */}
          <aside>
            <div className="md:sticky md:top-24 space-y-6">
              {/* Purchase card */}
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">Royalty‑free</div>
                    <div className="text-2xl font-semibold">DKK 99</div>
                  </div>
                  <div className="text-xs text-zinc-500">Ingen kreditering påkrævet</div>
                </div>

                {/* Size options (mock) */}
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Vælg størrelse</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50">S</button>
                    <button className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50">M</button>
                    <button className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50">L</button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link href="/cart" className="rounded-md bg-black px-4 py-2 text-center text-white hover:bg-zinc-800">Læg i kurv</Link>
                  <Link href="/stock" className="rounded-md border px-4 py-2 text-center hover:bg-zinc-50">Fortsæt med at browse</Link>
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  Licens: Royalty‑free, kommerciel brug tilladt.
                </p>
              </div>

              {/* Technical details */}
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold">Detaljer</h4>
                <dl className="mt-3 space-y-2 text-sm text-zinc-700">
                  <div className="flex justify-between">
                    <dt>ID</dt>
                    <dd className="tabular-nums">{item.id}</dd>
                  </div>
                  {item.width && item.height ? (
                    <div className="flex justify-between">
                      <dt>Dimensioner</dt>
                      <dd>{item.width} × {item.height}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt>Filtype</dt>
                    <dd>{isVideo ? 'Video' : isVector ? 'SVG' : 'Billede'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Primærfarve</dt>
                    <dd className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: item.dominant_color }} />
                      <code className="text-xs">{item.dominant_color}</code>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Personer</dt>
                    <dd>{item.has_people ? 'Ja' : 'Nej'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
