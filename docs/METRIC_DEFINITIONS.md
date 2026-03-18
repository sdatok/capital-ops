# Metric Definitions

## Principles
- All metrics should be deterministic
- Keep formulas simple and transparent
- Prefer business usefulness over academic complexity
- Each metric should have a clear helper function in code

## Revenue Growth
Formula:
(Current period revenue - Prior period revenue) / Prior period revenue

Why it matters:
Measures how quickly the business is expanding.

## Gross Margin
Formula:
Gross profit / Revenue

Why it matters:
Shows how efficiently the company produces or delivers its core offering before operating expenses.

## Operating Margin
Formula:
Operating income / Revenue

Why it matters:
Shows operational efficiency after core business expenses.

## Free Cash Flow Margin
Formula:
Free cash flow / Revenue

Why it matters:
Shows how much actual cash the business generates from sales after capital spending.

## Capex Intensity
Formula:
Capital expenditures / Revenue

Why it matters:
Shows how capital-intensive the business is.

## Cash Conversion Proxy
Formula:
Operating cash flow / Net income

Why it matters:
Shows how effectively accounting earnings turn into cash.

## Revenue CAGR
Formula:
(Ending revenue / Beginning revenue) ^ (1 / Number of years) - 1

Why it matters:
Shows smoothed long-term revenue growth.

## Margin Change
Formula:
Current operating margin - Prior operating margin

Why it matters:
Shows whether profitability is improving or deteriorating.

## Scenario Revenue Projection
Formula:
Projected revenue = Current revenue * (1 + growth assumption)

## Scenario Operating Income Projection
Formula:
Projected operating income = Projected revenue * operating margin assumption

## Scenario Free Cash Flow Projection
Formula:
Projected free cash flow = Projected revenue * free cash flow margin assumption

## Notes
- For MVP, use annual values
- Keep units consistent
- Percentages should be stored as decimals in code and formatted in the UI
- Do not show metrics in the UI unless the source values required for the formula are available