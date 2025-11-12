import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "./ui/Sidebar";
import AuthGate from "./ui/AuthGate";
import MobileNav from "./ui/MobileNav";
import CommandMenu from "./ui/CommandMenu";

export const metadata: Metadata = {
  title: "Colourbox Demo",
  description: "Files/Upload demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <AuthGate>
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Page wrapper: left gutter for sidebar + top padding for sticky header + bottom padding for mobile nav */}
          <div className="min-h-screen md:pl-[76px] pt-[56px] md:pt-[88px] pb-20 md:pb-0">
            {/* Unsplash-like sticky top navigation */}
            <header className="fixed left-0 md:left-[76px] right-0 top-0 z-[90] bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
              <div className="mx-auto max-w-7xl px-3 md:px-6">
                <div className="flex h-14 items-center gap-3 md:gap-4">
                  {/* Left: Logo */}
                  <a
                    href="/"
                    className="shrink-0 rounded px-2 py-1 text-[13px] font-bold tracking-wide text-zinc-900 hover:bg-zinc-100 transition-transform active:scale-95"
                    aria-label="Home"
                  >
                    CBX
                  </a>

                  {/* Center: Big Search (desktop) */}
                  <div className="flex-1 hidden md:block">
                    <form
                      action="/stock"
                      className="group relative transition"
                    >
                      <input
                        type="search"
                        name="q"
                        placeholder="Søg gratis billeder"
                        className="w-full rounded-md border border-zinc-200 bg-zinc-100/70 px-3 py-2 pl-9 text-sm outline-none placeholder:text-zinc-500 transition
focus:border-zinc-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'radial-gradient(120%_60% at 0% 0%, rgba(255,255,255,0.25), transparent 60%)' }}
                      />
                      <svg className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </form>
                  </div>

                  {/* Right: Links + Upload (desktop) */}
                  <nav className="hidden md:flex items-center gap-2 text-[13px]">
                    <a href="/explore" className="relative rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 transition-colors before:absolute before:left-2 before:right-2 before:-bottom-0.5 before:h-[2px] before:scale-x-0 before:rounded-full before:bg-zinc-900 before:transition-transform before:origin-left hover:before:scale-x-100">Explore</a>
                    <a href="/advertise" className="relative rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 transition-colors before:absolute before:left-2 before:right-2 before:-bottom-0.5 before:h-[2px] before:scale-x-0 before:rounded-full before:bg-zinc-900 before:transition-transform before:origin-left hover:before:scale-x-100">Advertise</a>
                    <a href="/blog" className="relative rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100 transition-colors before:absolute before:left-2 before:right-2 before:-bottom-0.5 before:h-[2px] before:scale-x-0 before:rounded-full before:bg-zinc-900 before:transition-transform before:origin-left hover:before:scale-x-100">Blog</a>
                    <a href="/upload" className="relative ml-1 rounded-md border px-3 py-1.5 font-medium hover:bg-zinc-50 transition-colors before:absolute before:left-2 before:right-2 before:-bottom-0.5 before:h-[2px] before:scale-x-0 before:rounded-full before:bg-zinc-900 before:transition-transform before:origin-left hover:before:scale-x-100">Upload</a>
                  </nav>

                  {/* Mobile: search + menu icons */}
                  <div className="md:hidden ml-auto flex items-center gap-1">
                    <a href="/stock" className="rounded p-2 hover:bg-zinc-100" aria-label="Søg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </a>
                    <button type="button" className="rounded p-2 hover:bg-zinc-100" aria-label="Menu">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Topics bar (desktop) */}
              <div className="hidden md:block border-t bg-white/70">
                <div className="mx-auto max-w-7xl px-3 md:px-6">
                  <nav className="-mx-2 flex h-10 items-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                    {['Wallpapers','3D Renders','Nature','People','Architecture','Current Events','Business & Work','Technology','Animals','Travel','Fashion'].map((t)=> (
                      <a key={t} href={`/stock?topic=${encodeURIComponent(t)}`} className="mx-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 shadow-sm transition active:scale-95">
                        {t}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
            </header>

            {children}
          </div>
        </AuthGate>
        <MobileNav />
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="pointer-events-auto">
            <CommandMenu />
          </div>
        </div>
      </body>
    </html>
  );
}