import Link from "next/link";

const SEEDED_PATH = [
  { label: "yfinance script", sub: "Offline refresh", icon: "⟳" },
  { label: "Seed JSON", sub: "Committed to repo", icon: "◈" },
  { label: "DuckDB", sub: "In-memory at startup", icon: "▦" },
];

const LIVE_PATH = [
  { label: "Any ticker", sub: "User request", icon: "⌨" },
  { label: "yfinance", sub: "On-demand fetch", icon: "⚡" },
  { label: "Memory cache", sub: "Cached per process", icon: "◈" },
];

const METRICS = [
  {
    name: "Revenue Growth",
    formula: "(Rev_t − Rev_{t−1}) / Rev_{t−1}",
    why: "Measures how fast the business is expanding top-line.",
    accent: "indigo",
  },
  {
    name: "Gross Margin",
    formula: "Gross Profit / Revenue",
    why: "Core product economics before operating costs — pricing power proxy.",
    accent: "violet",
  },
  {
    name: "Operating Margin",
    formula: "Operating Income / Revenue",
    why: "Operational efficiency after all core expenses including SG&A and R&D.",
    accent: "sky",
  },
  {
    name: "FCF Margin",
    formula: "Free Cash Flow / Revenue",
    why: "How much cash the business actually generates relative to sales.",
    accent: "emerald",
  },
  {
    name: "Capex Intensity",
    formula: "Capital Expenditures / Revenue",
    why: "How capital-heavy the business model is — lower favors asset-light models.",
    accent: "amber",
  },
  {
    name: "Cash Conversion",
    formula: "Operating Cash Flow / Net Income",
    why: "Whether accounting earnings are materializing as real cash.",
    accent: "rose",
  },
];

const ACCENT_MAP: Record<string, { bg: string; text: string; border: string }> = {
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-100" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-100" },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-100"    },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100"},
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100"  },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-100"   },
};

const STACK = [
  {
    layer: "Frontend",
    color: "indigo",
    items: [
      { name: "Next.js 16", desc: "App Router, server components, file-based routing" },
      { name: "TypeScript", desc: "Strict typing across all frontend code" },
      { name: "Tailwind CSS", desc: "Utility-first styling — no custom CSS files" },
      { name: "Recharts", desc: "Composable, declarative chart library for React" },
    ],
  },
  {
    layer: "Backend",
    color: "violet",
    items: [
      { name: "FastAPI", desc: "High-performance async REST API with automatic OpenAPI docs" },
      { name: "Pydantic v2", desc: "Schema validation and serialization for all API responses" },
      { name: "DuckDB", desc: "In-memory analytical DB — loads seed data at startup, zero cold-query cost" },
      { name: "PostgreSQL", desc: "Relational store for saved analyses (coming in next release)" },
    ],
  },
  {
    layer: "Data",
    color: "emerald",
    items: [
      { name: "yfinance", desc: "Fetches real annual financials from Yahoo Finance for offline seed refresh" },
      { name: "Seed JSON files", desc: "Pre-fetched data committed to repo — no live third-party dependency at runtime" },
    ],
  },
  {
    layer: "Infrastructure",
    color: "sky",
    items: [
      { name: "Vercel", desc: "Frontend hosting — auto deploys on every push to main" },
      { name: "Railway", desc: "Backend hosting — nixpacks build, zero-downtime deploys" },
      { name: "DigitalOcean DNS", desc: "CNAME routes capital-ops subdomain to Vercel edge" },
      { name: "GitHub", desc: "Source of truth — both platforms auto-deploy on push" },
    ],
  },
];

const STACK_COLOR_MAP: Record<string, { border: string; label: string }> = {
  indigo:  { border: "border-l-indigo-400",  label: "text-indigo-600"  },
  violet:  { border: "border-l-violet-400",  label: "text-violet-600"  },
  emerald: { border: "border-l-emerald-400", label: "text-emerald-600" },
  sky:     { border: "border-l-sky-400",     label: "text-sky-600"     },
};

const QUESTIONS = [
  "Which company converts revenue into free cash flow most efficiently?",
  "Which company appears to be overinvesting relative to returns?",
  "Which company has the strongest operating margin trend?",
  "How does this company compare to peers operationally?",
  "How sensitive is future cash generation to margin compression?",
  "Is management deploying capital well or destroying value?",
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors mb-8 group"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to companies
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-12 mb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Capital Ops — About
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight leading-snug mb-4">
            Built for fundamental analysts,<br />
            not traders.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Most financial tools optimize for stock price charts. Capital Ops focuses on the
            underlying business quality — the metrics that tell you{" "}
            <span className="text-slate-200 font-medium">
              how well management allocates capital and runs operations
            </span>
            , not whether the stock went up yesterday.
          </p>
        </div>
      </div>

      {/* What it answers */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">What it answers</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUESTIONS.map((q, i) => (
            <div
              key={q}
              className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3.5 group hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <span className="text-xs font-bold text-gray-300 tabular-nums mt-0.5 group-hover:text-indigo-400 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data pipeline */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Data pipeline</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="bg-slate-950 rounded-2xl p-6">
          {/* Two paths */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Seeded path */}
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
                Seeded path — 10 companies
              </p>
              <div className="flex items-center gap-0 overflow-x-auto">
                {SEEDED_PATH.map((step, i) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center text-center w-24">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-mono mb-1.5">
                        {step.icon}
                      </div>
                      <p className="text-xs font-semibold text-white leading-tight">{step.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{step.sub}</p>
                    </div>
                    {i < SEEDED_PATH.length - 1 && (
                      <div className="flex items-center mx-0.5">
                        <div className="w-4 h-px bg-indigo-500/30" />
                        <svg className="w-2.5 h-2.5 text-indigo-600" fill="currentColor" viewBox="0 0 6 6">
                          <path d="M0 3l6-3v6L0 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Live path */}
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">
                Live path — any publicly traded ticker
              </p>
              <div className="flex items-center gap-0 overflow-x-auto">
                {LIVE_PATH.map((step, i) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center text-center w-24">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-mono mb-1.5">
                        {step.icon}
                      </div>
                      <p className="text-xs font-semibold text-white leading-tight">{step.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{step.sub}</p>
                    </div>
                    {i < LIVE_PATH.length - 1 && (
                      <div className="flex items-center mx-0.5">
                        <div className="w-4 h-px bg-amber-500/30" />
                        <svg className="w-2.5 h-2.5 text-amber-600" fill="currentColor" viewBox="0 0 6 6">
                          <path d="M0 3l6-3v6L0 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shared tail */}
          <div className="border-t border-white/5 pt-4 flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-indigo-500/20" />
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-sm font-mono mb-1.5">
                ⟨/⟩
              </div>
              <p className="text-xs font-semibold text-white">FastAPI</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Metrics engine</p>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-px bg-white/10" />
              <svg className="w-2.5 h-2.5 text-slate-500" fill="currentColor" viewBox="0 0 6 6">
                <path d="M0 3l6-3v6L0 3z" />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-sm font-mono mb-1.5">
                ◻
              </div>
              <p className="text-xs font-semibold text-white">Next.js</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Browser render</p>
            </div>
            <div className="flex-1 h-px bg-amber-500/20" />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            10 companies are pre-seeded for instant load times. Any other publicly traded ticker is
            fetched on demand from Yahoo Finance, computed through the same metrics engine, and
            cached in memory for the process lifetime. Run{" "}
            <code className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[11px]">
              python -m scripts.refresh_seed_data
            </code>{" "}
            from <code className="font-mono text-slate-400 text-[11px]">apps/api</code> to refresh
            the seeded data.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Metric definitions</span>
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">No black boxes</span>
        </div>
        <div className="flex flex-col gap-3">
          {METRICS.map((m) => {
            const colors = ACCENT_MAP[m.accent];
            return (
              <div
                key={m.name}
                className="bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-900">{m.name}</p>
                  <code
                    className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {m.formula}
                  </code>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{m.why}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Tech stack</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="flex flex-col gap-6">
          {STACK.map((group) => {
            const colors = STACK_COLOR_MAP[group.color];
            return (
              <div key={group.layer}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${colors.label}`}>
                  {group.layer}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className={`bg-white border border-gray-100 border-l-2 ${colors.border} rounded-xl px-4 py-3 hover:shadow-sm transition-shadow`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-gray-400">
          Built as a portfolio project — open source, no affiliation with any financial institution.
        </p>
        <a
          href="https://github.com/sdatok/capital-ops"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors group"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          View source on GitHub
          <svg className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}
