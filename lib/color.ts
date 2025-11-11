export async function extractDominantHex(file: File): Promise<string | null> {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(e);
      i.src = url;
    });

    const w = 64; // downscale for performance
    const h = Math.max(1, Math.round((img.height / img.width) * w));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    // Simple histogram on 4-bit per channel (reduce noise)
    const buckets = new Map<string, number>();
    for (let p = 0; p < data.length; p += 4) {
      const a = data[p + 3];
      if (a < 16) continue; // skip near-transparent
      const r = data[p] >> 4;
      const g = data[p + 1] >> 4;
      const b = data[p + 2] >> 4;
      const key = (r << 8) | (g << 4) | b;
      buckets.set(String(key), (buckets.get(String(key)) || 0) + 1);
    }

    let bestKey: number | null = null;
    let bestCount = -1;
    buckets.forEach((count, keyStr) => {
      if (count > bestCount) {
        bestCount = count;
        bestKey = Number(keyStr);
      }
    });

    if (bestKey == null) return null;
    const r4 = (bestKey >> 8) & 0xf;
    const g4 = (bestKey >> 4) & 0xf;
    const b4 = bestKey & 0xf;
    // expand 4-bit to 8-bit
    const r8 = (r4 << 4) | r4;
    const g8 = (g4 << 4) | g4;
    const b8 = (b4 << 4) | b4;
    const hex = `#${r8.toString(16).padStart(2, '0')}${g8
      .toString(16)
      .padStart(2, '0')}${b8.toString(16).padStart(2, '0')}`.toLowerCase();

    URL.revokeObjectURL(url);
    return hex;
  } catch {
    return null;
  }
}
