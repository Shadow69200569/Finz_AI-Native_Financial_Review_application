# Finz — AI-Native Financial Review
**NYC Restaurant Co. | Q1 2026 (Jan–Mar)**

> Assignment — FINZ Software Engineering Internship

---

## What This Is

An AI-native financial review application that turns **raw bank transactions into an explainable monthly P&L**, with variance analysis, flagged review items, and a conversational AI analyst.

Built with: **HTML + Vanilla CSS + JavaScript** (no frameworks, no backend required).

---

## How to Run

```
python -m http.server 3000
```
Then open: [http://localhost:3000](http://localhost:3000)

---

## Features

### 1. Dashboard
- KPI cards: Q1 Net Revenue, Gross Profit, Operating Profit, month-over-month revenue change
- Bar chart: Monthly Revenue vs COGS vs Payroll vs OpEx
- Doughnut chart: Q1 expense breakdown by category
- AI Quick Insights: 5 auto-generated observations from the data

### 2. Transaction Ledger
- All 181 transactions displayed in a table
- Filter by month, category, flag status, or search text
- AI-assigned accounting category shown per transaction
- Click any row to edit/correct its category (saved in session)
- Status badges: ✓ OK / ⚠️ Uncertain / 🔴 Flagged / ✏️ Corrected

### 3. P&L Statement
- Fully calculated from raw transaction data (no LLM estimates)
- Monthly tabs: January, February, March, Q1 Total
- Shows: Net Revenue → Gross Profit → Operating Profit
- Below-the-line items (CapEx, loan repayments, owner draws, sales tax) flagged separately
- Click any line item to drill into its underlying transactions

### 4. Variance Analysis
- Compare any two months side by side
- Material variances highlighted (>$2,000 change)
- Bar chart shows relative magnitude
- Drill down to see exact transactions behind any variance

### 5. Review Items
- Auto-surfaced transactions requiring human judgment:
  - Balance sheet items (owner distributions, loan repayments, sales tax)
  - CapEx items (equipment purchase needing depreciation decision)
  - Uncertain classifications
- Mark items as resolved or edit their category

### 6. AI Financial Analyst (Chat)
- Conversational interface grounded in actual transaction data
- Answers questions like:
  - "What was our revenue in March?"
  - "How much did we spend on payroll each month?"
  - "Why did operating profit change between February and March?"
  - "What drove the increase in food costs?"
  - "Which transactions need my attention?"
- Shows traceable evidence (supporting transactions) with each answer

---

## Technical Decisions

| Area | Choice | Why |
|------|--------|-----|
| Application | Single HTML file + CSS + JS | Simple, portable, no build step needed |
| AI usage | Rule-based categorization engine | Deterministic, auditable, no hallucination risk |
| Financial math | Pure JavaScript arithmetic | P&L totals calculated from raw data, not LLM-generated |
| Charts | Chart.js (CDN) | Lightweight, no install required |
| AI Analyst | Pattern-matching + data lookup | Grounded in actual data, answers are traceable |

### Where AI is Used
- **Transaction categorization**: Rule-based pattern matching (not LLM) to classify each transaction
- **Quick Insights**: Auto-generated narrative from computed P&L data
- **AI Analyst**: Natural language query parsing + deterministic data retrieval

### Where Deterministic Logic is Used
- All P&L calculations (revenue, COGS, gross profit, payroll, opex, operating profit)
- Variance computations (month-over-month change)
- Drill-down transaction lookups

### How Incorrect Financial Answers are Prevented
- All financial totals are computed from `data.js` (the raw Excel data)
- The AI analyst does NOT generate financial numbers — it retrieves and formats computed values
- LLM-generated responses are never used for P&L math

---

## Data Source

`NYC Restaurant Co. - Raw Transactions.xlsx` — 181 transactions from Jan–Mar 2026.

**Columns:** Transaction ID, Date, Description, Counterparty, Amount, Method

---

## Category Scheme

| Category | P&L Group |
|----------|-----------|
| Revenue - Food Sales, Beverage Sales, Catering, Delivery, Gift Cards | Revenue |
| Revenue Contra - Refunds | Revenue (contra) |
| COGS - Food Inventory, Beverage Inventory, Packaging, Delivery Commissions | COGS |
| Payroll - Hourly & Taxes, Management | Payroll |
| OpEx - Rent, Utilities, Insurance, Internet, Accounting, Marketing, Cleaning, Repairs, Office, Software, Licenses | Operating Expenses |
| CapEx - Equipment | Below the line (excluded from P&L) |
| Balance Sheet - Loan Repayment, Owner Draw, Sales Tax | Below the line (excluded from P&L) |
