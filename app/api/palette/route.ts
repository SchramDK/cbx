export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

type VibrantModule = {
  default?: {
    from: (src: any, opts?: any) => { getPalette: () => Promise<any> };
  };
  from?: (src: any, opts?: any) => { getPalette: () => Promise<any> };
};

async function loadVibrant() {
  const mod = (await import('node-vibrant')) as unknown as VibrantModule;
  // Support both ESM default export and CJS namespace export
  return (mod.default ?? (mod as any)) as { from: (src: any, opts?: any) => { getPalette: () => Promise<any> } };
}

async function bufferFromSrc(src: string): Promise<Buffer> {
  // Support both remote URLs and data URLs
  if (src.startsWith('data:')) {
    const b64 = src.substring(src.indexOf(',') + 1);
    return Buffer.from(b64, 'base64');
  }
  const res = await fetch(src, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    const buf = await bufferFromSrc(url);
    const Vibrant = await loadVibrant();
    const sw = await Vibrant.from(buf, { colorCount: 5, quality: 5 }).getPalette();
    const colors = Object.values(sw)
      .filter(Boolean)
      .map((s: any) => s.getHex());

    return NextResponse.json({ colors });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'palette failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const src = body?.src as string | undefined;
    if (!src) return NextResponse.json({ error: 'Missing src' }, { status: 400 });

    const buf = await bufferFromSrc(src);
    const Vibrant = await loadVibrant();
    const sw = await Vibrant.from(buf, { colorCount: 5, quality: 5 }).getPalette();
    const colors = Object.values(sw)
      .filter(Boolean)
      .map((s: any) => s.getHex());

    return NextResponse.json({ colors });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'palette failed' }, { status: 500 });
  }
}