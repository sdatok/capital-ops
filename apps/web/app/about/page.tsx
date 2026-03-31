import Link from "next/link";

const STACK = [
  {
    layer: "Frontend",
    items: [
      { name: "Next.js 16", desc: "React framework with App Router and server components" },
      { name: "TypeScript", desc: "Strict typing across all frontend code" },
      { name: "Tailwind CSS", desc: "Utility-first styling, no custom CSS" },
      { name: "Recharts", desc: "Composable chart library for React" },
    ],
  },
  {
    layer: "Backend",
    items: [
      { name: "Python FastAPI", desc: "High-performance async REST API with automatic OpenAPI docs" },
      { name: "Pydantic v2", desc: "Schema validation and serialization for all API responses" },
      { name: "DuckDB", desc: "In-memory analytical database — loads seed data at startup, no query overhead" },
      { name: "PostgreSQL", desc: "Relational store for saved analyses (coming in next release)" },
    ],
  },
  {
    layer: "Data",
    items: [
      { name: "yfinance", desc: "Fetches real annual financials from Yahoo Finance for offline seed refresh" },
      { name: "Seed JSON files", desc: "Pre-fetched annual data committed to the repo — app never depends on a live third-party API at runtime" },
    ],
  },
  {
    layer: "Infrastructure",
    items: [
      { name: "Vercel", desc: "Frontend hosting with automatic deploys on every git push" },
      { name: "Railway", desc: "Backend hosting with zero-downtime deploys and no cold starts" },
      { name: "DigitalOcean DNS", desc: "DNS for sonamdatok.com, CNAME routes capital-ops subdomain to Vercel" },
      { name: "GitHub", desc: "Source of truth — both Vercel and Railway auto-deploy on push to main" },
    ],
  },
];

const METRICS = [
  { name: "Revenue Growth", formula: "(Revenue_t − Revenue_{t−1}) / Revenue_{t−1}", why: "Measures how fast the business is expanding." },
  { name: "Gross Margin", formula: "Gross Profit / Revenue", why: "Shows core product economics before operating costs." },
  { name: "Operating Margin", formula: "Operating Income / Revenue", why: "Shows operational efficiency after all core expenses." },
  { name: "FCF Margin", formula: "Free Cash Flow / Revenue", why: "Shows how much cash the business actually generates from sales." },
  { name: "Capex Intensity", formula: "Capital Expenditures / Revenue", why: "Measures how capital-heavy the business model is." },
  { name: "Cash Conversion", formula: "Operating Cash Flow / Net Income", why: "Shows whether accounting earnings are turning into real cash." },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6"
        >
          ← Back to companies
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">About Capital Ops</h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          Capital Ops is a portfolio-grade analytics platform for evaluating how well public
          companies allocate capital and run their operations. Most financial tools focus on stock
          price — this one focuses on the underlying business quality.
        </p>
      </div>

      {/* What it does */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-900 mb-4">What it answers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Which company is converting revenue into free cash flow most efficiently?",
            "Which company appears to be overinvesting relative to returns?",
            "Which company has the strongest operating margin trend?",
            "How does this company compare to peers operationally?",
            "How sensitive is future cash generation to a margin compression scenario?",
            "Is management deploying capital well or destroying value?",
          ].map((q) => (
            <div key={q} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
              {q}
            </div>
          ))}
        </div>
      </section>

      {/* Data pipeline */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-900 mb-3">How data flows</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm flex-wrap">
            {[
              { label: "Yahoo Finance", sub: "source" },
              { label: "yfinance script", sub: "offline refresh" },
              { label: "Seed JSON files", sub: "committed to repo" },
              { label: "DuckDB", sub: "in-memory at startup" },
              { label: "FastAPI", sub: "deterministic metrics" },
              { label: "Next.js", sub: "rendered in browser" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-gray-300 font-light hidden sm:block">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
            The app never calls a live third-party API at runtime — data is pre-fetched and committed
            to the repo. This means the app is fast, reliable, and works even if Yahoo Finance is down.
            Run <code className="font-mono bg-gray-100 px-1 rounded">python -m scripts.refresh_seed_data</code> from{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">apps/api</code> to update the data.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Metric definitions</h2>
        <p className="text-sm text-gray-500 mb-4">
          Every number shown in the app traces back to one of these deterministic formulas.
          No black boxes, no AI-generated estimates.
        </p>
        <div className="flex flex-col gap-3">
          {METRICS.map((m) => (
            <div key={m.name} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                <code className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {m.formula}
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-1">{m.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Tech stack</h2>
        <div className="flex flex-col gap-6">
          {STACK.map((group) => (
            <div key={group.layer}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                {group.layer}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer links */}
      <div className="border-t border-gray-200 pt-6 flex gap-4 text-sm">
        <a
          href="https://github.com/sdatok/capital-ops"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View source on GitHub →
        </a>
      </div>
    </div>
  );
}
