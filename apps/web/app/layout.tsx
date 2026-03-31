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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-blue-600 font-bold text-lg tracking-tight group-hover:text-blue-700 transition-colors">
                  Capital Ops
                </span>
              </Link>
              <span className="text-gray-300 text-sm select-none hidden sm:block">|</span>
              <span className="text-gray-400 text-sm hidden sm:block">
                Capital allocation &amp; operating efficiency analytics
              </span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                Companies
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900 transition-colors">
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
