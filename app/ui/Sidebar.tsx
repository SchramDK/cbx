'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Cloud, Store, Wand2 } from 'lucide-react';
import clsx from 'clsx';

type ItemProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function NavItem({ href, label, icon: Icon }: ItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'group flex flex-col items-center gap-1 rounded-md px-2 py-3 transition-colors',
        active
          ? 'text-zinc-900 font-medium'
          : 'text-zinc-500 hover:text-zinc-800'
      )}
      title={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        size={20}
        className={clsx(
          'transition-colors',
          active ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-800'
        )}
      />
      <span
        className={clsx(
          'text-[11px] transition-colors',
          active ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-800'
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[76px] border-r bg-white">
      {/* Logo */}
      <div className="h-14 border-b flex items-center justify-center">
        <span className="font-semibold tracking-tight">CBX</span>
      </div>

      {/* Nav */}
      <nav className="py-4 flex flex-col items-center gap-2">
        <NavItem href="/" label="Home" icon={Home} />
        <NavItem href="/files" label="Files" icon={Cloud} />
        <NavItem href="/stock" label="Stock" icon={Store} />
      </nav>
    </aside>
  );
}