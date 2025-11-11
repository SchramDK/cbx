'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Toolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const set = (k: string, v?: string) => {
    const p = new URLSearchParams(sp.toString());
    if (!v) p.delete(k); else p.set(k, v);
    router.replace(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center border-b pb-3 mb-4">
      {/* Sortering */}
      <label className="text-sm">Sortér:</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={sp.get('sort') ?? 'new'}
        onChange={e=>set('sort', e.target.value)}
      >
        <option value="new">Nyeste</option>
        <option value="old">Ældste</option>
        <option value="az">Navn A–Å</option>
        <option value="za">Navn Å–A</option>
      </select>

      {/* Størrelse (kontrollerer kolonnebredde) */}
      <label className="text-sm ml-2">Størrelse:</label>
      <input
        type="range" min={220} max={420} step={20}
        defaultValue={Number(sp.get('col') ?? 300)}
        onChange={e=>set('col', e.target.value)}
      />

      {/* Farve */}
      <label className="text-sm ml-2">Farve:</label>
      <input
        type="color"
        value={sp.get('color') ?? '#000000'}
        onChange={e=>set('color', e.target.value)}
      />
      <select
        className="border rounded px-2 py-1 text-sm"
        value={sp.get('tol') ?? '30'}
        onChange={e=>set('tol', e.target.value)}
      >
        <option value="20">±20</option>
        <option value="30">±30</option>
        <option value="40">±40</option>
        <option value="60">±60</option>
      </select>
      <button className="text-sm underline" onClick={()=>{set('color'); set('tol');}}>Ryd farve</button>

      {/* People */}
      <div className="ml-auto flex items-center gap-2">
        <label className="text-sm">Kun mennesker</label>
        <input
          type="checkbox"
          checked={sp.get('people') === '1'}
          onChange={e=>set('people', e.target.checked ? '1' : undefined)}
        />
      </div>
    </div>
  );
}