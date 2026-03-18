# Product Requirements Document

## Project
Capital Ops

## One-line summary
A portfolio-grade analytics platform for evaluating how well public companies allocate capital and run their operations.

## Goal
Build a web app that helps users analyze a public company’s operating efficiency and capital allocation quality using normalized financial data, peer comparison, scenario modeling, and analyst-style summaries.

## Why this project exists
Most stock tools focus on price, news, or generic charts. This product focuses on the underlying business quality of a company by answering questions like:
- Is management deploying capital well
- Are margins improving or deteriorating
- Is growth efficient or low quality
- Is free cash flow keeping up with revenue
- How does this company compare to peers operationally

## Target users
- Finance recruiting managers
- Strategy and operations hiring managers
- Product managers who value decision-support tools
- Me, as the primary analyst user

## Core user flow
1. Search for a company
2. Open the company overview page
3. Review normalized metrics and trends
4. Compare against selected peers
5. Build bull, base, and bear scenarios
6. Generate a concise analyst memo
7. Save or export the analysis

## MVP features
- Company search
- Company overview page
- Core metric cards
- Historical trend charts
- Peer comparison table
- Bull / base / bear scenario builder
- Analyst memo generator
- Saved analyses

## Out of scope for MVP
- Real-time market data
- Trading or brokerage integrations
- Mobile app
- Advanced portfolio management
- Collaboration or team roles
- Full DCF engine with every possible assumption

## Key product principles
- Prioritize clarity over complexity
- Keep calculations deterministic and explainable
- Make the output feel like a real analyst workflow
- Optimize for recruiter demo value
- Build something that is impressive but still shippable

## Success criteria
- A user can analyze one company end-to-end in under 5 minutes
- All displayed metrics trace back to clear formulas
- The demo looks polished and professional
- The project is strong enough to discuss in interviews for finance, analyst, and PM roles

## Example MVP company set
- Apple
- Microsoft
- Amazon
- Costco
- Nvidia

## Example questions the product should answer
- Which company is converting growth into free cash flow most efficiently
- Which company appears to be overinvesting relative to returns
- Which company has the strongest operating margin trend
- How sensitive is future cash generation to a lower-margin scenario