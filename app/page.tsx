'use client';

import Link from 'next/link';
import * as React from 'react';

/** Simple preview item type for Home */
type PreviewItem = { id: string; src: string; alt?: string; href: string };

/** Curated previews (demo-only). Replace with your own thumbs if you want */
const FILES_PREVIEW: PreviewItem[] = [
  { id: 'f-01', src: 'https://picsum.photos/id/1015/800/600', alt: 'Mountains', href: '/files' },
  { id: 'f-02', src: 'https://picsum.photos/id/1016/800/600', alt: 'Beach', href: '/files' },
  { id: 'f-03', src: 'https://picsum.photos/id/1018/800/600', alt: 'Forest', href: '/files' },
  { id: 'f-04', src: 'https://picsum.photos/id/1020/800/600', alt: 'Lake', href: '/files' },
  { id: 'f-05', src: 'https://picsum.photos/id/1011/800/600', alt: 'City', href: '/files' },
  { id: 'f-06', src: 'https://picsum.photos/id/1012/800/600', alt: 'Bridge', href: '/files' },
  { id: 'f-07', src: 'https://picsum.photos/id/1013/800/600', alt: 'Street', href: '/files' },
  { id: 'f-08', src: 'https://picsum.photos/id/1014/800/600', alt: 'Harbor', href: '/files' },
];

const STOCK_PREVIEW: PreviewItem[] = [
  { id: 's-01', src: 'https://picsum.photos/id/1060/800/600', alt: 'Product still', href: '/stock' },
  { id: 's-02', src: 'https://picsum.photos/id/1069/800/600', alt: 'Minimal product', href: '/stock' },
  { id: 's-03', src: 'https://picsum.photos/id/1074/800/600', alt: 'Styled product', href: '/stock' },
  { id: 's-04', src: 'https://picsum.photos/id/1076/800/600', alt: 'Product bg', href: '/stock' },
  { id: 's-05', src: 'https://picsum.photos/id/1054/800/600', alt: 'Lines', href: '/stock' },
  { id: 's-06', src: 'https://picsum.photos/id/1055/800/600', alt: 'Color blocks', href: '/stock' },
  { id: 's-07', src: 'https://picsum.photos/id/1058/800/600', alt: 'Deep green', href: '/stock' },
  { id: 's-08', src: 'https://picsum.photos/id/1061/800/600', alt: 'Cold steel', href: '/stock' },
];

const COLOR_THEMES = ['#2622A5', '#E4572E', '#3AB795', '#F3A712', '#17BEBB', '#A78BFA', '#6EE7B7', '#F59E0B'];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Mosaic hero (cleaner) */}
        <section className="grid grid-cols-12 gap-4">
          <MosaicItem item={FILES_PREVIEW[0]} className="col-span-12 md:col-span-7 row-span-2 aspect-[16/9]" label="Fra dine filer" />
          <MosaicItem item={STOCK_PREVIEW[0]} className="col-span-12 md:col-span-5 aspect-[16/9]" label="Udvalgt fra Stock" />
          <MosaicItem item={FILES_PREVIEW[2]} className="col-span-12 md:col-span-5 aspect-[16/9]" />
        </section>

        {/* Quick actions (clean) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction href="/files" title="Åbn Filer" subtitle="Se dine uploads" />
          <QuickAction href="/stock" title="Gå til Stock" subtitle="Find inspiration" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Files + Stock previews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Files section */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Seneste fra dine Filer</h2>
                <Link href="/files" className="text-sm text-zinc-600 hover:underline">Se alle →</Link>
              </div>
              <PreviewGrid items={FILES_PREVIEW} />
            </section>

            {/* Stock section */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Udvalgt fra Stock</h2>
                <Link href="/stock" className="text-sm text-zinc-600 hover:underline">Gå til Stock →</Link>
              </div>
              <PreviewGrid items={STOCK_PREVIEW} />
            </section>
          </div>

          {/* Right column: Activity + Colors */}
          <aside className="space-y-6">
            <section className="rounded-lg border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Aktivitet i dag</div>
              <ul className="space-y-3 text-sm">
                <ActivityItem who="Emily" action="delte" what="2 billeder" when="for 12 min." />
                <ActivityItem who="Esben" action="oprettede" what="mappen ‘Portrætter’" when="for 35 min." />
                <ActivityItem who="Nicki" action="uploadede" what="5 billeder" when="for 1 time siden" />
                <ActivityItem who="Joseph" action="tilføjede tag" what="‘product’ på 3 filer" when="i morges" />
              </ul>
              <Link href="/files" className="mt-3 inline-block text-xs text-zinc-600 hover:underline">Se al aktivitet</Link>
            </section>

            <section className="rounded-lg border bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Farvetemaer</div>
              <div className="flex flex-wrap gap-2">
                {COLOR_THEMES.map((hex) => (
                  <Link key={hex} href="/stock" className="inline-flex items-center gap-2 rounded border px-2 py-1 text-xs hover:bg-zinc-50">
                    <span className="h-4 w-4 rounded" style={{ backgroundColor: hex }} />
                    <span className="font-mono">{hex.toUpperCase()}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-zinc-500">Klik for at søge i Stock med en farve som udgangspunkt.</div>
            </section>
          </aside>
        </div>

        {/* Themes / Inspiration */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Temaer &amp; inspiration</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ThemeCard title="Portrætter" href="/stock" src="https://picsum.photos/id/1027/800/600" />
            <ThemeCard title="Natur" href="/stock" src="https://picsum.photos/id/1018/800/600" />
            <ThemeCard title="By & urban" href="/stock" src="https://picsum.photos/id/1011/800/600" />
            <ThemeCard title="Produkter" href="/stock" src="https://picsum.photos/id/1060/800/600" />
          </div>
        </section>
      </main>
    </div>
  );
}

/** ----- Components ----- */

function MosaicItem({ item, className, label }: { item: PreviewItem; className?: string; label?: string }) {
  return (
    <Link href={item.href} className={`group relative block overflow-hidden rounded-lg bg-zinc-100 ${className ?? ''}`}>
      <img src={item.src} alt={item.alt ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      {label ? (
        <div className="absolute left-3 top-3 text-[11px] rounded bg-white/90 px-2 py-1 text-zinc-800 shadow">{label}</div>
      ) : null}
      <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded bg-white/90 text-zinc-800 shadow opacity-0 group-hover:opacity-100">Åbn</div>
    </Link>
  );
}

function PreviewGrid({ items }: { items: PreviewItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <Link key={it.id} href={it.href} className="group relative block overflow-hidden rounded-lg bg-zinc-100">
          <img src={it.src} alt={it.alt ?? ''} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded bg-white/90 text-zinc-800 shadow opacity-0 group-hover:opacity-100">Åbn</div>
        </Link>
      ))}
    </div>
  );
}

function ThemeCard({ title, href, src }: { title: string; href: string; src: string }) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-lg border bg-white">
      <div className="aspect-[4/3]">
        <img src={src} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70" />
      </div>
      <div className="absolute left-3 bottom-3 text-white font-medium drop-shadow">{title}</div>
    </Link>
  );
}

function QuickAction({ href, title, subtitle }: { href: string; title: string; subtitle?: string }) {
  return (
    <Link href={href} className="group block rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="text-sm font-medium">{title}</div>
      {subtitle ? <div className="text-xs text-zinc-500">{subtitle}</div> : null}
    </Link>
  );
}

function ActivityItem({ who, action, what, when }: { who: string; action: string; what: string; when: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="h-7 w-7 shrink-0 rounded-full bg-zinc-200" />
      <div className="min-w-0">
        <div className="truncate"><span className="font-medium">{who}</span> {action} <span className="font-medium">{what}</span></div>
        <div className="text-[11px] text-zinc-500">{when}</div>
      </div>
    </li>
  );
}
