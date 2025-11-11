'use client';

import { useEffect, useId, useState } from 'react';

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
        </div>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="border-t px-4 py-3">{children}</div>}
    </div>
  );
}

export default function Filters({ value, onChangeAction, hideType }: Props) {
  const [local, setLocal] = useState<FiltersState>(value ? { ...DEFAULTS, ...value } : DEFAULTS);
  const colorId = useId();
  const peopleName = useId();

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

  return (
    <aside className="w-[260px] shrink-0 space-y-3">
      <div className="px-2 pb-1 text-sm font-semibold text-zinc-700">Filtre</div>

      {!hideType && (
        <Section title="Type">
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
        </Section>
      )}

      <Section title="Personer">
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
              className="w-[100px] rounded border px-2 py-1 text-sm font-mono"
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
          </div>

          <label className="block text-xs text-zinc-500">
            Tolerance ({(local.colorTolerance ?? DEFAULTS.colorTolerance)}%)
          </label>
          <input
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

      <div className="pt-2">
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
      </div>
    </aside>
  );
}