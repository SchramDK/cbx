'use client';
import { useEffect } from 'react';

export default function Viewer({ open, src, onClose }:{open:boolean;src?:string;onClose:()=>void}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e:KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <img src={src} className="max-h-[90vh] max-w-[90vw] object-contain" alt="" />
      {/* Tilføj knapper: Fit / 100% / Fill og næste/forrige */}
    </div>
  );
}