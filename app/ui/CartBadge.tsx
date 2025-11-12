

'use client';

import * as React from 'react';
import Link from 'next/link';
import { getCount } from './cart';

type Props = {
  className?: string;
};

/**
 * CartBadge – lightweight header badge that reflects the number of items in the demo cart.
 * - Reads from localStorage via getCount()
 * - Subscribes to `cart:changed` and `storage` events to stay in sync
 */
export default function CartBadge({ className }: Props) {
  const [count, setCount] = React.useState<number>(0);
  const [bump, setBump] = React.useState(false);

  // Initialize + subscribe to updates
  React.useEffect(() => {
    const update = () => {
      const c = getCount();
      setCount((prev) => {
        if (prev !== c) {
          setBump(true);
          setTimeout(() => setBump(false), 220);
        }
        return c;
      });
    };
    update();

    const onChanged = () => update();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'cbx_demo_cart') update();
    };

    window.addEventListener('cart:changed', onChanged as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cart:changed', onChanged as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className={
        'relative inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] hover:bg-zinc-50 transition ' +
        (className ?? '')
      }
      aria-label={count > 0 ? `Kurv med ${count} elementer` : 'Kurv (tom)'}
    >
      {/* Icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 6h2l2.4 10.4A2 2 0 0 0 9.37 18h7.26a2 2 0 0 0 1.97-1.6L20 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="20" r="1.2" fill="currentColor" />
        <circle cx="17" cy="20" r="1.2" fill="currentColor" />
      </svg>
      <span>Kurv</span>

      {/* Count pill */}
      <span
        className={
          'ml-1 inline-flex min-w-[20px] justify-center rounded-full bg-zinc-900 px-1.5 py-0.5 text-[11px] font-medium text-white will-change-transform ' +
          (bump ? 'scale-110 transition-transform duration-200' : 'transition-transform duration-200')
        }
        aria-hidden
      >
        {count}
      </span>
    </Link>
  );
}