'use client';

import { useEffect, useId, useMemo, useState } from 'react';

export type FiltersState = {
  types: string[];
  people: 'any' | 'has' | 'none';
  colorHex: string | null;
  colorTolerance?: number; // 0–100 range for demo
};

type Props = {
  value?: FiltersState;
  onChangeAction?: (next: FiltersState) => void;
  hideType?: boolean;
};

const DEFAULTS: FiltersState = {
  types: [],
  people: 'any',
  colorHex: null,
  colorTolerance: 30,
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const btnId = useId();
  const panelId = useId();
  return (
    <div className="rounded-lg border bg-white">
      <button
        id={btnId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{title}</span>
        </div>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.13l3.71-2.9a.75.75 0 1 1 .92 1.18l-4.17 3.25a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2z" />
        </svg>
      </button>
      {open && (
        <div id={panelId} role="region" aria-labelledby={btnId} className="border-t px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

// Quick color choices for faster filtering
const QUICK_SWATCHES = ['#000000', '#ffffff', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#af52de'];

export default function Filters({ value, onChangeAction, hideType }: Props) {
  const [local, setLocal] = useState<FiltersState>(value ? { ...DEFAULTS, ...value } : DEFAULTS);
  const colorId = useId();
  const peopleName = useId();
  const tolId = useId();

  useEffect(() => {
    if (value) setLocal({ ...DEFAULTS, ...value });
    else setLocal(DEFAULTS);
  }, [value]);

  function update(partial: Partial<FiltersState>) {
    const next = { ...local, ...partial };
    setLocal(next);
    onChangeAction?.(next);
  }

  function toggleType(key: string) {
    const has = local.types.includes(key);
    const next = has ? local.types.filter((x) => x !== key) : [...local.types, key];
    update({ types: next });
  }

  const activeCount = useMemo(() => {
    let n = 0;
    if (local.types.length > 0) n++;
    if (local.people !== 'any') n++;
    if (local.colorHex) n++;
    return n;
  }, [local]);

  const colorPreview = (local.colorHex ?? '#ffffff').toUpperCase();
  const hexValid = useMemo(() => {
    if (local.colorHex == null) return true;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(local.colorHex.trim());
  }, [local.colorHex]);

  return (
    <aside className="w-[260px] shrink-0 space-y-3">
      <div className="px-2 pb-1 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-700">Filtre</div>
        <div className="text-[11px] text-zinc-500">{activeCount} aktiv{activeCount === 1 ? '' : 'e'}</div>
      </div>

      {!hideType && (
        <Section title="Type">
          <fieldset>
            <legend className="sr-only">Medietyper</legend>
            <div className="space-y-2">
              {[
                ['photo', 'Foto'],
                ['vector', 'Vektor'],
                ['illustration', 'Illustration'],
                ['video', 'Video'],
              ].map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={local.types.includes(key)}
                    onChange={() => toggleType(key)}
                    className="h-4 w-4"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Section>
      )}

      <Section title="Personer">
        <fieldset>
          <legend className="sr-only">Personer i motiv</legend>
          <div className="flex flex-col gap-2 text-sm">
            {[
              ['any', 'Alle'],
              ['has', 'Med personer'],
              ['none', 'Uden personer'],
            ].map(([val, label]) => (
              <label key={val} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name={peopleName}
                  value={val}
                  checked={local.people === (val as FiltersState['people'])}
                  onChange={() => update({ people: val as FiltersState['people'] })}
                  className="h-4 w-4"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section title="Farve">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              id={colorId}
              type="color"
              value={local.colorHex ?? '#ffffff'}
              onChange={(e) => update({ colorHex: e.target.value || null })}
              className="h-8 w-10 cursor-pointer rounded border bg-white"
              aria-label="Vælg farve"
            />
            <input
              type="text"
              inputMode="text"
              placeholder="#RRGGBB"
              aria-invalid={!hexValid}
              className={
                'w-[110px] rounded border px-2 py-1 text-sm font-mono ' +
                (hexValid ? '' : 'border-red-500')
              }
              value={(local.colorHex ?? '').toUpperCase()}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v === '') {
                  update({ colorHex: null });
                  return;
                }
                if (/^#?[0-9a-fA-F]{3,8}$/.test(v)) {
                  update({ colorHex: v.startsWith('#') ? v : `#${v}` });
                }
              }}
            />
            <div
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: colorPreview }}
              title={colorPreview}
              aria-label={`Valgt farve ${colorPreview}`}
            />
            {local.colorHex && (
              <button
                type="button"
                onClick={() => update({ colorHex: null })}
                className="ml-auto rounded border px-2 py-1 text-xs hover:bg-zinc-50"
              >
                Ryd
              </button>
            )}
          </div>

          {/* Quick swatches */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                aria-label={`Vælg ${hex}`}
                onClick={() => update({ colorHex: hex })}
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          <label htmlFor={tolId} className="block text-xs text-zinc-500">
            Tolerance ({(local.colorTolerance ?? DEFAULTS.colorTolerance)}%)
          </label>
          <input
            id={tolId}
            type="range"
            min={0}
            max={100}
            step={5}
            value={local.colorTolerance ?? DEFAULTS.colorTolerance}
            onChange={(e) => update({ colorTolerance: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      </Section>

      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setLocal(DEFAULTS);
            onChangeAction?.(DEFAULTS);
          }}
          className="text-xs rounded border px-2 py-1 hover:bg-zinc-50"
        >
          Nulstil filtre
        </button>
        {activeCount > 0 && (
          <span className="text-[11px] text-zinc-500">{activeCount} aktiv{activeCount === 1 ? '' : 'e'}</span>
        )}
      </div>
    </aside>
  );
}