'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type DemoItem = {
  id: string;
  src: string;
  /** Optional known dimensions to avoid layout shift */
  width?: number;
  height?: number;
  /** If you already know the ratio (w/h), provide it */
  ratio?: number;
  /** Optional alt text for a11y */
  alt?: string;
};

type Props = {
  items?: DemoItem[];
  extra?: DemoItem[];
  /** Optional click handler for opening a viewer, etc. */
  onSelectAction?: (item: DemoItem, index: number) => void;
  selectedId?: string;
  /** Optional classNames to tweak spacing */
  containerClassName?: string;
  itemClassName?: string;
  /** Target row height in px (approximate). Default 260. */
  targetRowHeight?: number;
  /** Gap (px) between items. Default 16. */
  gap?: number;
};

export default function Gallery({
  items = [],
  extra = [],
  onSelectAction,
  selectedId,
  containerClassName = '',
  itemClassName = '',
  targetRowHeight = 260,
  gap = 16,
}: Props) {
  // 1) Build final list (extra → items)
  const renderList = useMemo(() => {
    return [...extra, ...items];
  }, [items, extra]);

  // 2) Container width (ResizeObserver)
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapWidth, setWrapWidth] = useState<number>(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWrapWidth(Math.max(0, Math.floor(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 3) Aspect ratios (update as images load). Start with 3:2 by default.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const upsertRatioOnce = (id: string, r: number) => {
    setRatios((prev) => (prev[id] ? prev : { ...prev, [id]: r }));
  };
  const handleNaturalSize = (id: string, img: HTMLImageElement) => {
    const r =
      img.naturalWidth && img.naturalHeight
        ? img.naturalWidth / img.naturalHeight
        : 1.5;
    upsertRatioOnce(id, r);
  };

  // Prefer ratio from props if provided
  const getRatio = (it: DemoItem) => {
    if (typeof it.ratio === 'number' && isFinite(it.ratio) && it.ratio > 0) return it.ratio;
    if (it.width && it.height && it.width > 0 && it.height > 0) return it.width / it.height;
    return ratios[it.id] ?? 1.5;
  };

  // 4) Compute justified rows
  type Placed = DemoItem & { w: number; h: number; _ratio: number };
  const placedRows = useMemo(() => {
    const width = wrapWidth;
    if (width <= 0) return [] as Placed[][];

    const rowTarget = targetRowHeight;
    const g = gap;
    const rows: Placed[][] = [];

    let cur: { item: DemoItem; ratio: number }[] = [];
    let sumRatio = 0;

    const flush = (isLast: boolean) => {
      if (!cur.length) return;

      // Height so total row width matches container width (except last)
      let h = rowTarget;
      if (!isLast) {
        const totalRatio = sumRatio;
        h = Math.max(60, (width - g * (cur.length - 1)) / totalRatio);
      }

      const row: Placed[] = cur.map(({ item, ratio }) => ({
        ...item,
        w: Math.max(50, Math.round(ratio * h)),
        h: Math.round(h),
        _ratio: ratio,
      }));
      rows.push(row);
      cur = [];
      sumRatio = 0;
    };

    for (const it of renderList) {
      const r = getRatio(it);
      cur.push({ item: it, ratio: r });
      sumRatio += r;

      const totalWidth = sumRatio * rowTarget + g * (cur.length - 1);
      if (totalWidth >= width) flush(false);
    }
    // Last row: keep target height (no stretching)
    if (cur.length) {
      const row: Placed[] = cur.map(({ item, ratio }) => ({
        ...item,
        w: Math.max(50, Math.round(ratio * rowTarget)),
        h: Math.round(rowTarget),
        _ratio: ratio,
      }));
      rows.push(row);
    }

    return rows;
  }, [renderList, wrapWidth, targetRowHeight, gap, ratios]);

  return (
    <div ref={wrapRef} className={`min-w-0 ${containerClassName}`}>
      <div className="flex flex-col" style={{ gap }}>
        {placedRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex" style={{ gap }}>
            {row.map((it, idx) => {
              const key = `${it.id}-${rowIndex}-${idx}`;
              const isInteractive = Boolean(onSelectAction);
              const role = isInteractive ? 'button' : undefined;
              const tabIndex = isInteractive ? 0 : -1;
              const alt = it.alt ?? '';
              const isSelected = selectedId === it.id;

              return (
                <div
                  key={key}
                  className={`relative group overflow-hidden rounded-lg ${itemClassName}`}
                  style={{ width: it.w, height: it.h }}
                  tabIndex={tabIndex}
                  role={role}
                  onClick={
                    isInteractive ? () => onSelectAction?.({ id: it.id, src: it.src, alt: it.alt }, idx) : undefined
                  }
                  onKeyDown={
                    isInteractive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectAction?.({ id: it.id, src: it.src, alt: it.alt }, idx);
                          }
                        }
                      : undefined
                  }
                  aria-label={alt}
                >
                  <img
                    data-id={it.id}
                    src={it.src}
                    alt={alt}
                    width={it.w}
                    height={it.h}
                    className={`h-full w-full object-cover transition-transform duration-300 ${isInteractive ? 'cursor-pointer' : ''} ${isSelected ? ' ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : ''}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => handleNaturalSize(it.id, e.currentTarget)}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.visibility = 'hidden';
                      el.style.display = 'none';
                    }}
                  />

                  {/* Hover gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                  {/* Quick actions (visible on hover) */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-zinc-800 shadow hover:bg-white"
                      title="Like"
                      onClick={(e) => { e.stopPropagation(); /* TODO: like */ }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 21s-6.716-4.35-9.33-7.2C.91 12.88.5 11.61.5 10.3.5 7.79 2.54 6 4.86 6c1.36 0 2.68.63 3.5 1.63C9.46 6.63 10.78 6 12.14 6c2.32 0 4.36 1.79 4.36 4.3 0 1.31-.41 2.58-2.17 3.5C18.716 16.65 12 21 12 21z"/></svg>
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-zinc-800 shadow hover:bg-white"
                      title="Add to collection"
                      onClick={(e) => { e.stopPropagation(); /* TODO: add to collection */ }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-zinc-800 shadow hover:bg-white"
                      title="Download"
                      onClick={(e) => { e.stopPropagation(); /* TODO: download */ }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4V7h3l-5-5z"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}