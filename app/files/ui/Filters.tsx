'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type React from 'react';

// --- HSV/HEX utilities for a visible spectrum picker ---
function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }
function hexToRgb(hex: string) {
  const s = hex.replace('#','');
  const v = s.length === 3
    ? s.split('').map(ch => parseInt(ch+ch, 16))
    : [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
  return { r: v[0], g: v[1], b: v[2] };
}
function rgbToHex(r: number, g: number, b: number) {
  const f = (x:number)=> x.toString(16).padStart(2,'0');
  return `#${f(r)}${f(g)}${f(b)}`.toUpperCase();
}
function rgbToHsv(r:number,g:number,b:number){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0, s= max===0?0:(max-min)/max, v=max;
  if(max!==min){
    const d=max-min;
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h/=6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), v: Math.round(v*100) };
}
function hsvToRgb(h:number,s:number,v:number){
  s/=100; v/=100; const c=v*s; const x=c*(1-Math.abs(((h/60)%2)-1)); const m=v-c;
  let r=0,g=0,b=0;
  if (0<=h && h<60){ r=c; g=x; b=0; }
  else if (60<=h && h<120){ r=x; g=c; b=0; }
  else if (120<=h && h<180){ r=0; g=c; b=x; }
  else if (180<=h && h<240){ r=0; g=x; b=c; }
  else if (240<=h && h<300){ r=x; g=0; b=c; }
  else { r=c; g=0; b=x; }
  return { r: Math.round((r+m)*255), g: Math.round((g+m)*255), b: Math.round((b+m)*255) };
}
function hsvToHex(h:number,s:number,v:number){ const {r,g,b}=hsvToRgb(h,s,v); return rgbToHex(r,g,b); }

function Spectrum({ value, onChange }:{ value:string, onChange:(hex:string)=>void }){
  const { r,g,b } = hexToRgb(value);
  const base = rgbToHsv(r,g,b);
  const [h, setH] = useState(base.h);
  const [sv, setSV] = useState<{s:number;v:number}>({ s: base.s, v: base.v });

  useEffect(()=>{
    try{
      const {r,g,b}=hexToRgb(value);
      const hv = rgbToHsv(r,g,b);
      setH(hv.h); setSV({s:hv.s, v:hv.v});
    }catch{}
  }, [value]);

  function updateSV(e: React.MouseEvent<HTMLDivElement>){
    const el=e.currentTarget; const rect=el.getBoundingClientRect();
    const x=clamp((e.clientX-rect.left)/rect.width,0,1);
    const y=clamp((e.clientY-rect.top)/rect.height,0,1);
    const s=Math.round(x*100); const v=Math.round((1-y)*100);
    setSV({s,v}); onChange(hsvToHex(h,s,v));
  }

  return (
    <div className="space-y-2 select-none">
      {/* Saturation/Value square */}
      <div
        className="relative h-28 w-full cursor-crosshair rounded border"
        onMouseDown={updateSV}
        onMouseMove={(e)=>{ if(e.buttons===1) updateSV(e); }}
        style={{
          backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`
        }}
      >
        <div
          className="absolute h-3 w-3 -mt-1.5 -ml-1.5 rounded-full border border-white shadow"
          style={{
            left: `${sv.s}%`,
            top: `${100 - sv.v}%`,
            backgroundColor: hsvToHex(h, sv.s, sv.v)
          }}
        />
      </div>
      {/* Hue slider */}
      <input
        type="range"
        min={0}
        max={360}
        value={h}
        onChange={(e)=>{ const nh=Number(e.target.value); setH(nh); onChange(hsvToHex(nh, sv.s, sv.v)); }}
        className="w-full h-2 rounded bg-[linear-gradient(to_right,_red,_yellow,_lime,_cyan,_blue,_magenta,_red)] appearance-none"
      />
    </div>
  );
}

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

const GRAYS = ['#ffffff','#f9fafb','#f3f4f6','#e5e7eb','#d1d5db','#9ca3af','#6b7280','#4b5563','#374151','#1f2937','#111827','#000000'];

export default function Filters({ value, onChangeAction, hideType }: Props) {
  const [local, setLocal] = useState<FiltersState>(value ? { ...DEFAULTS, ...value } : DEFAULTS);
  const [recent, setRecent] = useState<string[]>([]);
  const colorId = useId();
  const peopleName = useId();
  const tolId = useId();

  // Load recent colors from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('FILES_RECENT_COLORS');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setRecent(arr.filter((x) => typeof x === 'string'));
      }
    } catch {}
  }, []);

  // Persist recent colors whenever they change
  useEffect(() => {
    try { localStorage.setItem('FILES_RECENT_COLORS', JSON.stringify(recent)); } catch {}
  }, [recent]);

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

  async function copyHexToClipboard() {
    const hex = (local.colorHex ?? '').toUpperCase();
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
    } catch {}
  }

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
          <div className="space-y-2">
            <Spectrum value={(local.colorHex ?? '#FF0000').toUpperCase()} onChange={(hex)=>update({ colorHex: hex })} />
            <div className="flex items-center gap-2">
              <input
                id={colorId}
                type="text"
                inputMode="text"
                placeholder="#RRGGBB"
                aria-invalid={!hexValid}
                className={'w-[120px] rounded border px-2 py-1 text-sm font-mono ' + (hexValid ? '' : 'border-red-500')}
                value={(local.colorHex ?? '').toUpperCase()}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (v === '') { update({ colorHex: null }); return; }
                  if (/^#?[0-9a-fA-F]{3,8}$/.test(v)) {
                    update({ colorHex: v.startsWith('#') ? v : `#${v}` });
                  }
                }}
              />
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: (local.colorHex ?? '#ffffff').toUpperCase() }}
                title={(local.colorHex ?? '#ffffff').toUpperCase()}
                aria-label={`Valgt farve ${(local.colorHex ?? '#ffffff').toUpperCase()}`}
              />
              {local.colorHex && (
                <button type="button" onClick={copyHexToClipboard} className="rounded border px-2 py-1 text-xs hover:bg-zinc-50" title="Kopiér HEX">
                  Kopiér
                </button>
              )}
              {local.colorHex && (
                <button type="button" onClick={() => update({ colorHex: null })} className="ml-auto rounded border px-2 py-1 text-xs hover:bg-zinc-50">
                  Ryd
                </button>
              )}
            </div>
          </div>

          {/* Gråskala */}
          <div className="flex flex-wrap gap-1.5">
            {GRAYS.map((hex) => (
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
          <div className="flex items-center gap-2">
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
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={local.colorTolerance ?? DEFAULTS.colorTolerance}
              onChange={(e) => {
                const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                update({ colorTolerance: v });
              }}
              className="w-16 rounded border px-2 py-1 text-sm text-right"
              aria-label="Tolerance i procent"
            />
          </div>
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