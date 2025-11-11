'use client';

import { useCallback, useRef, useState } from 'react';

type Props = {
  onNewImagesAction?: (items: { id: string; src: string }[]) => void;
};

export default function Dropzone({ onNewImagesAction }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const items: { id: string; src: string }[] = [];
      Array.from(fileList).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        items.push({ id: crypto.randomUUID(), src: url });
      });
      if (items.length && onNewImagesAction) onNewImagesAction(items);
    },
    [onNewImagesAction]
  );

  return (
    <div
      className={[
        'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
        dragOver ? 'bg-zinc-100 border-zinc-400' : 'bg-white border-zinc-300',
      ].join(' ')}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-medium">Træk billeder hertil eller klik for at vælge</p>
      <p className="text-sm text-zinc-500 mt-1">PNG, JPG, HEIC m.fl.</p>
    </div>
  );
}