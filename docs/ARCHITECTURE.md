# Architecture

## Project name
Capital Ops

## High-level architecture
This project uses a modern web frontend, a lightweight analytics backend, and a relational database for app data. Analytical calculations should be deterministic and traceable.

## Frontend
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Recharts

## Backend
- Python FastAPI service
- Responsible for:
  - metric normalization
  - scenario calculations
  - memo generation
  - data transformation
  - API responses for analytics views

## Data layer
- PostgreSQL for application data
- DuckDB for local analytical queries and cached structured datasets

## Proposed monorepo structure
- apps/web
- apps/api
- packages/shared
- docs

## Core modules
### 1. Company module
- company profile
- industry
- sector
- company metadata

### 2. Metrics module
- revenue growth
- gross margin
- operating margin
- free cash flow margin
- capex intensity
- cash conversion proxy

### 3. Peer comparison module
- comparable company selection
- normalized side-by-side metrics
- ranking or relative comparison

### 4. Scenario module
- bull / base / bear assumptions
- projected revenue
- projected operating income
- projected free cash flow

### 5. Memo module
- converts structured app state into a concise analyst-style summary
- should only use available in-app data
- should not invent unsupported facts

### 6. Saved analysis module
- store scenario inputs
- store selected company and peer set
- store generated memo output

## Data philosophy
- Start with mocked but realistic seed data
- Introduce live or external data only after the core workflow is solid
- Keep raw source values separate from derived metrics
- Every derived metric should map to a helper function or formula

## Engineering principles
- Keep calculations deterministic
- Prefer explicit formulas over magic abstractions
- Build in vertical slices
- Keep the architecture simple and demoable
- Avoid unnecessary libraries
- Optimize for speed to MVP

## Initial technical priorities
1. Scaffold frontend and backend
2. Define shared metric types
3. Build company overview page with realistic mock data
4. Add peer comparison
5. Add scenario engine
6. Add memo generation
7. Add persistence
8. Polish and deploy

## Non-functional requirements
- Clean UI
- Fast page loads with mock data
- Clear file organization
- Strong typing on frontend
- Predictable API contracts
- Easy to explain in interviews