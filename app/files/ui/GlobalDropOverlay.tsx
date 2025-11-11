'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabaseBrowser } from '../../../lib/supabase';
import { extractDominantHex } from '../../../lib/color';

type Props = {
  onNewImagesAction?: (items: { id: string; src: string }[]) => void;
};

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

function safeObjectName(fileName: string): string {
  // remove diacritics + keep a-z0-9._-
  let name = fileName.toLowerCase();
  try {
    name = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  } catch {}
  name = name.replace(/\s+/g, '_');
  name = name.replace(/[^a-z0-9._-]/g, '');
  name = name.replace(/^[_\.]+/, '');
  if (!name.length) name = 'file';
  // keep it short to avoid path length issues
  return name.slice(-120);
}

export default function GlobalDropOverlay({ onNewImagesAction }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const enterCounter = useRef(0);
  const supabase = supabaseBrowser();

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const onlyImages = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!onlyImages.length) return;

    // Optimistiske previews
    const previews = await Promise.all(onlyImages.map(async (f) => ({ id: crypto.randomUUID(), src: await readAsDataURL(f) })));
    if (previews.length && onNewImagesAction) onNewImagesAction(previews);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Log ind først i Supabase (auth).');
      return;
    }

    for (const file of onlyImages) {
      const baseName = `${crypto.randomUUID()}-${safeObjectName(file.name)}`;
      const path = `${user.id}/${baseName}`;
      const up = await supabase.storage.from('assets').upload(path, file, { upsert: false });
      if (up.error) {
        console.error('[Storage upload error]', up.error);
        alert('Upload til Storage fejlede: ' + up.error.message + '\nTjek at bucket "assets" findes og at du har policies for upload.');
        continue;
      }

      const dominant = await extractDominantHex(file);

      const ins = await supabase.from('assets').insert({
        user_id: user.id,
        filename: path,
        mime: file.type,
        size_bytes: file.size,
        dominant_color: dominant ?? null,
      }).select('id, dominant_color').single();

      if (ins.error) {
        console.error('[DB insert error]', ins.error);
        alert('Gem i database fejlede: ' + ins.error.message + '\nTjek at tabellen public.assets findes og RLS/policies tillader INSERT for authenticated.');
        continue;
      }

      try {
        await fetch('/api/queue-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: ins.data.id, path })
        });
      } catch (e) {
        console.warn('Queue-process call failed', e);
      }
    }
  }, [onNewImagesAction, supabase]);

  useEffect(() => {
    async function onDrop(e: DragEvent) {
      e.preventDefault();
      enterCounter.current = 0;
      setDragOver(false);
      await processFiles(e.dataTransfer?.files ?? null);
    }
    function onDragOver(e: DragEvent) {
      e.preventDefault();
      setDragOver(true);
    }
    function onDragEnter(e: DragEvent) {
      e.preventDefault();
      enterCounter.current += 1;
      setDragOver(true);
    }
    function onDragLeave(e: DragEvent) {
      e.preventDefault();
      enterCounter.current = Math.max(0, enterCounter.current - 1);
      if (enterCounter.current === 0) setDragOver(false);
    }

    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [processFiles]);

  if (!dragOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative rounded-2xl border-2 border-dashed bg-white/90 px-6 py-5 text-center shadow-xl">
        <p className="text-lg font-semibold">Slip filerne for at uploade</p>
        <p className="text-sm text-zinc-600 mt-1">Billeder vises med det samme</p>
      </div>
    </div>
  );
}
