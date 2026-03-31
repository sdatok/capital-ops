import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capital Ops",
  description: "Analytics for capital allocators — evaluate operating efficiency and capital allocation quality for public companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-slate-950 border-b border-white/5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4-4 4 4 4-7 4 4" />
                  </svg>
                </div>
                <span className="text-white font-bold text-sm tracking-tight group-hover:text-indigo-300 transition-colors">
                  Capital Ops
                </span>
              </Link>
              <span className="hidden sm:block text-white/10 text-xs select-none">|</span>
              <span className="hidden sm:block text-slate-500 text-xs">
                Capital allocation &amp; operating efficiency analytics
              </span>
            </div>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
              >
                Companies
              </Link>
              <Link
                href="/about"
                className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
              >
                About
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
