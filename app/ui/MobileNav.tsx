'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

type Tab = { href: string; label: string; icon: React.ReactNode; match: (p: string) => boolean };

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconFiles() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6a2 2 0 0 1 2-2h5l3 3h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconStock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 16l4-5 3 3 5-7 4 6v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function MobileNav() {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { href: '/', label: 'Home', icon: <IconHome />, match: p => p === '/' },
    { href: '/files', label: 'Filer', icon: <IconFiles />, match: p => p.startsWith('/files') },
    { href: '/stock', label: 'Stock', icon: <IconStock />, match: p => p.startsWith('/stock') },
    { href: '/profile', label: 'Profil', icon: <IconUser />, match: p => p.startsWith('/profile') },
  ];

  return (
    <nav
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-[80]
        border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70
      "
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
      }}
      aria-label="Primær navigation"
    >
      <ul className="mx-auto max-w-6xl grid grid-cols-4">
        {tabs.map((t) => {
          const active = t.match(pathname || '/');
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={
                  'flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors duration-200 ' +
                  (active ? 'text-black' : 'text-zinc-600 hover:text-zinc-900')
                }
                aria-current={active ? 'page' : undefined}
              >
                <span className={'grid place-items-center h-7 w-14 rounded-md transition-all duration-200 ' + (active ? 'bg-zinc-900 text-white scale-105' : 'bg-transparent')}>{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}