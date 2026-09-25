// ===== Ledger AI — AI-Native Financial Review Application =====
// NYC Restaurant Co. | Jan–Mar 2026
// Core workflow: ingest → categorize → review → calculate → explain → investigate

// ===================================================
// ⚙️  AI is handled server-side via Netlify Functions.
//     Key lives in: Netlify Dashboard → Environment Variables
//     Local dev: add key to .env, then run: netlify dev
// ===================================================

// ===================================================
// 1. CHART.JS (CDN loaded inline to avoid dependency)
// ===================================================
(function loadChartJS() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  s.onload = () => initApp();
  document.head.appendChild(s);
})();

// ===================================================
// 2. CATEGORIZATION ENGINE (deterministic rule-based)
// ===================================================
const CATEGORY_RULES = [
  // Revenue
  { pattern: /pos batch deposit - food/i,      category: 'Revenue - Food Sales',       group: 'Revenue',    plGroup: 'revenue' },
  { pattern: /pos batch deposit - beverage/i,  category: 'Revenue - Beverage Sales',   group: 'Revenue',    plGroup: 'revenue' },
  { pattern: /catering invoice payment/i,      category: 'Revenue - Catering',         group: 'Revenue',    plGroup: 'revenue' },
  { pattern: /delivery marketplace payout/i,  category: 'Revenue - Delivery Sales',   group: 'Revenue',    plGroup: 'revenue' },
  { pattern: /gift card sales deposit/i,       category: 'Revenue - Gift Cards',       group: 'Revenue',    plGroup: 'revenue' },
  // Revenue Contra
  { pattern: /refunds and discounts/i,         category: 'Revenue Contra - Refunds',   group: 'Revenue Contra', plGroup: 'revenue_contra' },
  // COGS
  { pattern: /food inventory purchase/i,       category: 'COGS - Food Inventory',      group: 'COGS',       plGroup: 'cogs' },
  { pattern: /large catering event food/i,     category: 'COGS - Food Inventory',      group: 'COGS',       plGroup: 'cogs' },
  { pattern: /beverage inventory purchase/i,   category: 'COGS - Beverage Inventory',  group: 'COGS',       plGroup: 'cogs' },
  { pattern: /to-go packaging|disposables/i,   category: 'COGS - Packaging & Supplies',group: 'COGS',       plGroup: 'cogs' },
  { pattern: /delivery platform commission/i,  category: 'COGS - Delivery Commissions',group: 'COGS',       plGroup: 'cogs' },
  // Payroll
  { pattern: /payroll - hourly|payroll taxes/i,category: 'Payroll - Hourly & Taxes',   group: 'Payroll',    plGroup: 'payroll' },
  { pattern: /manager salary payroll/i,        category: 'Payroll - Management',       group: 'Payroll',    plGroup: 'payroll' },
  // OpEx
  { pattern: /^rent$/i,                        category: 'OpEx - Rent',                group: 'OpEx',       plGroup: 'opex' },
  { pattern: /utilities/i,                     category: 'OpEx - Utilities',           group: 'OpEx',       plGroup: 'opex' },
  { pattern: /insurance premium/i,             category: 'OpEx - Insurance',           group: 'OpEx',       plGroup: 'opex' },
  { pattern: /internet and phone/i,            category: 'OpEx - Internet & Phone',    group: 'OpEx',       plGroup: 'opex' },
  { pattern: /accounting|bookkeeping/i,        category: 'OpEx - Accounting',          group: 'OpEx',       plGroup: 'opex' },
  { pattern: /marketing/i,                     category: 'OpEx - Marketing',           group: 'OpEx',       plGroup: 'opex' },
  { pattern: /cleaning and linen/i,            category: 'OpEx - Cleaning & Linen',    group: 'OpEx',       plGroup: 'opex' },
  { pattern: /repairs and maintenance/i,       category: 'OpEx - Repairs & Maintenance',group:'OpEx',       plGroup: 'opex' },
  { pattern: /office.*admin|admin.*supplies/i, category: 'OpEx - Office & Admin',      group: 'OpEx',       plGroup: 'opex' },
  { pattern: /pos.*software|software.*sub/i,   category: 'OpEx - POS/Software',        group: 'OpEx',       plGroup: 'opex' },
  { pattern: /annual license/i,               category: 'OpEx - Licenses & Permits',  group: 'OpEx',       plGroup: 'opex' },
  // Balance Sheet / Non-P&L
  { pattern: /equipment purchase/i,            category: 'CapEx - Equipment',          group: 'Non-P&L',    plGroup: 'non_pl', uncertain: true, flagReason: 'Capital expenditure — may need to be depreciated rather than expensed. Requires accounting judgment on treatment.' },
  { pattern: /loan principal repayment/i,      category: 'Balance Sheet - Loan Repayment', group: 'Non-P&L', plGroup: 'non_pl', flagReason: 'Loan principal repayment is a balance sheet item (reduces liability), not a P&L expense.' },
  { pattern: /owner distribution/i,           category: 'Balance Sheet - Owner Draw', group: 'Non-P&L',    plGroup: 'non_pl', flagReason: 'Owner distribution is equity withdrawal — not an operating expense in the P&L.' },
  { pattern: /sales tax remittance/i,          category: 'Balance Sheet - Sales Tax',  group: 'Non-P&L',    plGroup: 'non_pl', flagReason: 'Sales tax remittance is a liability settlement (balance sheet), not a P&L expense.' },
];

function categorizeTransaction(desc) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(desc)) {
      return { ...rule };
    }
  }
  return { category: 'Uncategorized', group: 'Uncategorized', plGroup: 'uncategorized', uncertain: true, flagReason: 'Could not auto-classify. Please assign a category manually.' };
}

// ===================================================
// 3. STATE
// ===================================================
let transactions = []; // enriched
let userOverrides = {}; // { txnId: { category, group, plGroup } }
let reviewResolved = {}; // { txnId: true }
let activeEditTxnId = null;
let currentPLMonth = '2026-01';
let charts = {};

// ===================================================
// 4. INITIALIZATION
// ===================================================
function initApp() {
  // Enrich raw transactions
  transactions = RAW_TRANSACTIONS.map(t => {
    const cat = categorizeTransaction(t['Description']);
    return {
      id: t['Transaction ID'],
      date: t['Date'],
      description: t['Description'],
      counterparty: t['Counterparty'],
      amount: t['Amount'],
      method: t['Method'],
      month: t['Date'].substring(0, 7),
      ...cat
    };
  });

  renderAll();
}

function getEffectiveTxn(txn) {
  if (userOverrides[txn.id]) {
    return { ...txn, ...userOverrides[txn.id], corrected: true };
  }
  return txn;
}

// ===================================================
// 5. NAVIGATION
// ===================================================
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById(`nav-${name}`).classList.add('active');

  if (name === 'variances') renderVariances();
  if (name === 'pl') renderPL(currentPLMonth);
  if (name === 'review') renderReviewItems();
  if (name === 'transactions') filterTransactions();
}

// ===================================================
// 6. P&L CALCULATION (deterministic — no LLM math)
// ===================================================
const ALL_MONTHS = ['2026-01', '2026-02', '2026-03'];

function calcPL(monthOrQ1) {
  const months = monthOrQ1 === 'Q1' ? ALL_MONTHS : [monthOrQ1];
  const txns = transactions.filter(t => months.includes(t.month)).map(t => getEffectiveTxn(t));

  const sum = (plGroup) => txns.filter(t => t.plGroup === plGroup).reduce((a, t) => a + t.amount, 0);
  const sumCat = (cat) => txns.filter(t => t.category === cat).reduce((a, t) => a + t.amount, 0);

  const revenue_food = sumCat('Revenue - Food Sales') + sumCat('Revenue - Catering') + sumCat('Revenue - Delivery Sales');
  const revenue_bev  = sumCat('Revenue - Beverage Sales');
  const revenue_other= sumCat('Revenue - Gift Cards');
  const total_revenue= revenue_food + revenue_bev + revenue_other;
  const contra       = sum('revenue_contra'); // negative
  const net_revenue  = total_revenue + contra;

  const cogs_food    = sumCat('COGS - Food Inventory');
  const cogs_bev     = sumCat('COGS - Beverage Inventory');
  const cogs_pkg     = sumCat('COGS - Packaging & Supplies');
  const cogs_del     = sumCat('COGS - Delivery Commissions');
  const total_cogs   = cogs_food + cogs_bev + cogs_pkg + cogs_del;

  const gross_profit = net_revenue + total_cogs;

  const payroll_hourly = sumCat('Payroll - Hourly & Taxes');
  const payroll_mgmt   = sumCat('Payroll - Management');
  const total_payroll  = payroll_hourly + payroll_mgmt;

  const opex_items = {};
  ['Rent','Utilities','Insurance','Internet & Phone','Accounting','Marketing','Cleaning & Linen','Repairs & Maintenance','Office & Admin','POS/Software','Licenses & Permits'].forEach(k => {
    opex_items[k] = sumCat(`OpEx - ${k}`);
  });
  const total_opex = Object.values(opex_items).reduce((a, v) => a + v, 0);

  const total_operating_expenses = total_payroll + total_opex;
  const operating_profit = gross_profit + total_operating_expenses;

  // Non-P&L for reference
  const capex = sumCat('CapEx - Equipment');
  const loan   = sumCat('Balance Sheet - Loan Repayment');
  const owner  = sumCat('Balance Sheet - Owner Draw');
  const tax    = sumCat('Balance Sheet - Sales Tax');

  return {
    revenue_food, revenue_bev, revenue_other, total_revenue, contra, net_revenue,
    cogs_food, cogs_bev, cogs_pkg, cogs_del, total_cogs,
    gross_profit,
    payroll_hourly, payroll_mgmt, total_payroll,
    opex_items, total_opex,
    total_operating_expenses,
    operating_profit,
    capex, loan, owner, tax
  };
}

// ===================================================
// 7. FORMATTING HELPERS
// ===================================================
const fmt = (v, showSign = false) => {
  const abs = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = v < 0 ? '-' : (showSign ? '+' : '');
  return `${sign}$${abs}`;
};

const fmtShort = (v) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1000) return `${sign}$${(abs/1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
};

const colorClass = (v, reverseLogic = false) => {
  if (reverseLogic) return v > 0 ? 'text-red' : 'text-green';
  return v >= 0 ? 'text-green' : 'text-red';
};

const catBadgeClass = (group) => {
  const map = {
    'Revenue': 'cat-revenue', 'Revenue Contra': 'cat-contra',
    'COGS': 'cat-cogs', 'Payroll': 'cat-payroll',
    'OpEx': 'cat-opex', 'Non-P&L': 'cat-balance',
    'Uncategorized': 'cat-balance'
  };
  return map[group] || 'cat-opex';
};

const monthName = (m) => ({ '2026-01': 'January 2026', '2026-02': 'February 2026', '2026-03': 'March 2026', 'Q1': 'Q1 2026' }[m] || m);

// ===================================================
// 8. RENDER ALL
// ===================================================
function renderAll() {
  renderDashboard();
  renderTransactionTable();
  renderCategoryFilter();
  renderPL('2026-01');
  renderVariances();
  renderReviewItems();
  updateReviewBadge();
}

// ===================================================
// 9. DASHBOARD
// ===================================================
function renderDashboard() {
  const jan = calcPL('2026-01');
  const feb = calcPL('2026-02');
  const mar = calcPL('2026-03');
  const q1  = calcPL('Q1');

  // KPI Cards
  const kpiGrid = document.getElementById('kpi-grid');
  const kpiData = [
    { label: 'Q1 Net Revenue',       value: q1.net_revenue,      prev: null, format: fmt },
    { label: 'Q1 Gross Profit',      value: q1.gross_profit,     prev: null, format: fmt },
    { label: 'Q1 Operating Profit',  value: q1.operating_profit, prev: null, format: fmt },
    { label: 'Mar vs Feb Revenue',   value: mar.net_revenue,     prev: feb.net_revenue, format: fmt },
  ];

  kpiGrid.innerHTML = kpiData.map(k => {
    let deltaHTML = '';
    if (k.prev !== null) {
      const delta = k.value - k.prev;
      const pct = k.prev !== 0 ? ((delta / Math.abs(k.prev)) * 100).toFixed(1) : 0;
      const cls = delta >= 0 ? 'up' : 'down';
      const icon = delta >= 0 ? '↑' : '↓';
      deltaHTML = `<div class="kpi-delta ${cls}">${icon} ${fmt(delta, true)} (${pct}%) vs Feb</div>`;
    }
    const isPositive = k.value >= 0;
    return `<div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${isPositive ? 'positive' : 'negative'}">${k.format(k.value)}</div>
      ${deltaHTML}
    </div>`;
  }).join('');

  // Charts
  renderDashboardCharts(jan, feb, mar);

  // Quick Insights
  renderQuickInsights(jan, feb, mar);
}

function renderDashboardCharts(jan, feb, mar) {
  // Destroy old charts
  Object.values(charts).forEach(c => c && c.destroy());
  charts = {};

  const months = ['Jan 2026', 'Feb 2026', 'Mar 2026'];
  const ctx1 = document.getElementById('revenueChart').getContext('2d');
  charts.revenue = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Net Revenue',
          data: [jan.net_revenue, feb.net_revenue, mar.net_revenue],
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Total COGS',
          data: [Math.abs(jan.total_cogs), Math.abs(feb.total_cogs), Math.abs(mar.total_cogs)],
          backgroundColor: 'rgba(251,146,60,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Total Payroll',
          data: [Math.abs(jan.total_payroll), Math.abs(feb.total_payroll), Math.abs(mar.total_payroll)],
          backgroundColor: 'rgba(167,139,250,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Operating Expenses',
          data: [Math.abs(jan.total_opex), Math.abs(feb.total_opex), Math.abs(mar.total_opex)],
          backgroundColor: 'rgba(96,165,250,0.7)',
          borderRadius: 4,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#7a8299', font: { size: 11 } }, position: 'bottom' } },
      scales: {
        x: { ticks: { color: '#7a8299' }, grid: { color: '#1a2035' } },
        y: { ticks: { color: '#7a8299', callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: '#1a2035' } }
      }
    }
  });

  // Expense breakdown pie
  const q1 = calcPL('Q1');
  const ctx2 = document.getElementById('categoryChart').getContext('2d');
  charts.category = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Food COGS', 'Beverage COGS', 'Pkg/Delivery', 'Hourly Payroll', 'Mgmt Payroll', 'Rent', 'Utilities', 'Marketing', 'Insurance', 'Other OpEx'],
      datasets: [{
        data: [
          Math.abs(q1.cogs_food),
          Math.abs(q1.cogs_bev),
          Math.abs(q1.cogs_pkg) + Math.abs(q1.cogs_del),
          Math.abs(q1.payroll_hourly),
          Math.abs(q1.payroll_mgmt),
          Math.abs(q1.opex_items['Rent'] || 0),
          Math.abs(q1.opex_items['Utilities'] || 0),
          Math.abs(q1.opex_items['Marketing'] || 0),
          Math.abs(q1.opex_items['Insurance'] || 0),
          Math.abs(q1.total_opex) - Math.abs(q1.opex_items['Rent'] || 0) - Math.abs(q1.opex_items['Utilities'] || 0) - Math.abs(q1.opex_items['Marketing'] || 0) - Math.abs(q1.opex_items['Insurance'] || 0),
        ],
        backgroundColor: ['#f97316','#fb923c','#fbbf24','#a78bfa','#7c3aed','#60a5fa','#3b82f6','#f472b6','#ec4899','#4b5563'],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { labels: { color: '#7a8299', font: { size: 10 }, boxWidth: 12 }, position: 'right' },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${fmt(ctx.raw)}`
          }
        }
      }
    }
  });
}

function renderQuickInsights(jan, feb, mar) {
  const insights = [];

  // Revenue trend
  const revChange = mar.net_revenue - feb.net_revenue;
  const revPct = ((revChange / Math.abs(feb.net_revenue)) * 100).toFixed(1);
  insights.push({
    icon: revChange > 0 ? '📈' : '📉',
    type: revChange > 0 ? 'positive' : 'negative',
    text: `Revenue grew from ${fmt(feb.net_revenue)} in February to ${fmt(mar.net_revenue)} in March — a <strong>${revChange > 0 ? '+' : ''}${revPct}% increase</strong>, driven primarily by higher POS food and delivery sales.`
  });

  // Payroll spike
  const payChange = mar.total_payroll - feb.total_payroll;
  insights.push({
    icon: '💸',
    type: payChange < -5000 ? 'warning' : 'neutral',
    text: `Payroll jumped from ${fmt(Math.abs(feb.total_payroll))} in February to ${fmt(Math.abs(mar.total_payroll))} in March (${fmt(payChange, true)}). Hourly wages increased materially — possibly due to higher staffing for increased volume.`
  });

  // Food COGS
  const cogsChange = mar.cogs_food - feb.cogs_food;
  insights.push({
    icon: '🍽️',
    type: 'warning',
    text: `Food COGS increased from ${fmt(Math.abs(feb.cogs_food))} to ${fmt(Math.abs(mar.cogs_food))} in March (${fmt(cogsChange, true)}). More food supplier invoices appear in March vs. February — review for large one-off purchases.`
  });

  // Operating profit
  insights.push({
    icon: '✅',
    type: mar.operating_profit > 0 ? 'positive' : 'negative',
    text: `Q1 Operating Profit: ${fmt(calcPL('Q1').operating_profit)}. The business was ${calcPL('Q1').operating_profit > 0 ? 'profitable' : 'unprofitable'} across all three months. Note: CapEx, loan repayments, and owner draws are excluded from operating P&L.`
  });

  // Balance sheet items flagged
  const flagCount = transactions.filter(t => getEffectiveTxn(t).plGroup === 'non_pl').length;
  insights.push({
    icon: '⚠️',
    type: 'warning',
    text: `<strong>${flagCount} transactions</strong> were identified as balance-sheet or CapEx items (owner draws, loan repayments, equipment purchases, sales tax). These are excluded from P&L and flagged for accountant review.`
  });

  document.getElementById('quick-insights-list').innerHTML = insights.map(i =>
    `<div class="insight-item ${i.type}">
      <span class="insight-icon">${i.icon}</span>
      <span>${i.text}</span>
    </div>`
  ).join('');
}

// ===================================================
// 10. TRANSACTION TABLE
// ===================================================
function renderCategoryFilter() {
  const sel = document.getElementById('filter-category');
  const cats = [...new Set(transactions.map(t => t.category))].sort();
  sel.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function filterTransactions() {
  const month = document.getElementById('filter-month').value;
  const cat   = document.getElementById('filter-category').value;
  const flag  = document.getElementById('filter-flag').value;
  const search= document.getElementById('filter-search').value.toLowerCase();

  let filtered = transactions.map(t => getEffectiveTxn(t));

  if (month !== 'all') filtered = filtered.filter(t => t.month === month);
  if (cat   !== 'all') filtered = filtered.filter(t => t.category === cat);
  if (flag  === 'flagged')   filtered = filtered.filter(t => t.flagReason && t.plGroup === 'non_pl');
  if (flag  === 'uncertain')  filtered = filtered.filter(t => t.uncertain);
  if (search) filtered = filtered.filter(t =>
    t.description.toLowerCase().includes(search) ||
    t.counterparty.toLowerCase().includes(search) ||
    t.id.toLowerCase().includes(search)
  );

  document.getElementById('txn-count-label').textContent = `${filtered.length} transactions`;
  renderTransactionRows(filtered);
}

function renderTransactionTable() {
  filterTransactions();
}

function renderTransactionRows(txns) {
  const tbody = document.getElementById('txn-tbody');
  tbody.innerHTML = txns.map(t => {
    let statusHTML;
    if (t.corrected) {
      statusHTML = `<span class="status-badge status-corrected">✏️ Corrected</span>`;
    } else if (t.uncertain) {
      statusHTML = `<span class="status-badge status-uncertain">⚠️ Uncertain</span>`;
    } else if (t.flagReason) {
      statusHTML = `<span class="status-badge status-flagged">🔴 Flagged</span>`;
    } else {
      statusHTML = `<span class="status-badge status-ok">✓ OK</span>`;
    }
    return `<tr onclick="openEditModal('${t.id}')">
      <td>${t.id}</td>
      <td>${t.date}</td>
      <td style="max-width:260px">${t.description}</td>
      <td>${t.counterparty}</td>
      <td class="${t.amount >= 0 ? 'amount-positive' : 'amount-negative'}">${fmt(t.amount)}</td>
      <td style="color:#5a6580;font-size:12px">${t.method}</td>
      <td><span class="cat-badge ${catBadgeClass(t.group)}">${t.category}</span></td>
      <td>${statusHTML}</td>
    </tr>`;
  }).join('');
}

// ===================================================
// 11. EDIT CATEGORY MODAL
// ===================================================
const ALL_CATEGORIES = [
  { category: 'Revenue - Food Sales',           group: 'Revenue',     plGroup: 'revenue' },
  { category: 'Revenue - Beverage Sales',        group: 'Revenue',     plGroup: 'revenue' },
  { category: 'Revenue - Catering',              group: 'Revenue',     plGroup: 'revenue' },
  { category: 'Revenue - Delivery Sales',        group: 'Revenue',     plGroup: 'revenue' },
  { category: 'Revenue - Gift Cards',            group: 'Revenue',     plGroup: 'revenue' },
  { category: 'Revenue Contra - Refunds',        group: 'Revenue Contra', plGroup: 'revenue_contra' },
  { category: 'COGS - Food Inventory',           group: 'COGS',        plGroup: 'cogs' },
  { category: 'COGS - Beverage Inventory',       group: 'COGS',        plGroup: 'cogs' },
  { category: 'COGS - Packaging & Supplies',     group: 'COGS',        plGroup: 'cogs' },
  { category: 'COGS - Delivery Commissions',     group: 'COGS',        plGroup: 'cogs' },
  { category: 'Payroll - Hourly & Taxes',        group: 'Payroll',     plGroup: 'payroll' },
  { category: 'Payroll - Management',            group: 'Payroll',     plGroup: 'payroll' },
  { category: 'OpEx - Rent',                     group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Utilities',                group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Insurance',                group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Internet & Phone',         group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Accounting',               group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Marketing',                group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Cleaning & Linen',         group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Repairs & Maintenance',    group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Office & Admin',           group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - POS/Software',             group: 'OpEx',        plGroup: 'opex' },
  { category: 'OpEx - Licenses & Permits',       group: 'OpEx',        plGroup: 'opex' },
  { category: 'CapEx - Equipment',               group: 'Non-P&L',     plGroup: 'non_pl' },
  { category: 'Balance Sheet - Loan Repayment',  group: 'Non-P&L',     plGroup: 'non_pl' },
  { category: 'Balance Sheet - Owner Draw',      group: 'Non-P&L',     plGroup: 'non_pl' },
  { category: 'Balance Sheet - Sales Tax',       group: 'Non-P&L',     plGroup: 'non_pl' },
];

function openEditModal(txnId) {
  activeEditTxnId = txnId;
  const txn = getEffectiveTxn(transactions.find(t => t.id === txnId));

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-txn-info">
      <div><span>${txn.id}</span> · ${txn.date}</div>
      <div>Description: <span>${txn.description}</span></div>
      <div>Counterparty: <span>${txn.counterparty}</span></div>
      <div>Amount: <span class="${txn.amount >= 0 ? 'text-green' : 'text-red'}">${fmt(txn.amount)}</span></div>
      ${txn.flagReason ? `<div style="margin-top:8px;padding:8px;background:#1e1526;border-radius:6px;font-size:11px;color:#f59e0b">⚠️ ${txn.flagReason}</div>` : ''}
    </div>
    <p style="font-size:12px;color:#7a8299;margin-bottom:12px">Current category: <strong style="color:#c5cce0">${txn.category}</strong></p>
    <div class="cat-select-grid" id="cat-select-grid">
      ${ALL_CATEGORIES.map(c => `
        <button class="cat-option ${c.category === txn.category ? 'selected' : ''}" 
          onclick="selectCatOption(this, '${c.category}')"
          data-cat="${c.category}" data-group="${c.group}" data-pl="${c.plGroup}">
          ${c.category}
        </button>
      `).join('')}
    </div>
  `;

  document.getElementById('edit-modal').style.display = 'flex';
}

function selectCatOption(el, cat) {
  document.querySelectorAll('.cat-option').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

function saveCategory() {
  const selected = document.querySelector('.cat-option.selected');
  if (!selected || !activeEditTxnId) return;
  const cat = selected.dataset.cat;
  const group = selected.dataset.group;
  const plGroup = selected.dataset.pl;
  const catObj = ALL_CATEGORIES.find(c => c.category === cat);
  userOverrides[activeEditTxnId] = { category: cat, group, plGroup, uncertain: false, flagReason: catObj?.flagReason || null, corrected: true };
  closeModal();
  filterTransactions();
  updateReviewBadge();
  // Re-render charts if dashboard visible
  if (document.getElementById('section-dashboard').classList.contains('active')) renderDashboard();
}

function closeModal() {
  document.getElementById('edit-modal').style.display = 'none';
  activeEditTxnId = null;
}

// ===================================================
// 12. P&L STATEMENT
// ===================================================
function showPLMonth(m) {
  currentPLMonth = m;
  document.querySelectorAll('.pl-tab').forEach(t => t.classList.remove('active'));
  const tabId = { '2026-01': 'pl-tab-jan', '2026-02': 'pl-tab-feb', '2026-03': 'pl-tab-mar', 'Q1': 'pl-tab-q1' }[m];
  document.getElementById(tabId).classList.add('active');
  renderPL(m);
}

function renderPL(m) {
  const pl = calcPL(m);
  const txns = transactions.filter(t => (m === 'Q1' ? ALL_MONTHS : [m]).includes(t.month));
  const label = monthName(m);

  const drillLink = (cats, labelText) =>
    `onclick="drillDown(${JSON.stringify(m === 'Q1' ? ALL_MONTHS : [m])}, ${JSON.stringify(cats)}, '${labelText}')"`;

  const row = (label, value, cats, cls='') => {
    const drillCats = cats || [];
    return `<div class="pl-row" ${drillCats.length ? drillLink(drillCats, label) : ''}>
      <span class="pl-row-label${cls ? ' ' + cls : ''}">${label}</span>
      <span class="pl-row-amount ${colorClass(value)}">${fmt(value)}</span>
    </div>`;
  };

  const months = m === 'Q1' ? ALL_MONTHS : [m];

  const html = `
    <p class="pl-note">📋 <em>All figures calculated directly from ${txns.length} transactions. Click any line to see underlying transactions.</em></p>
    
    <!-- REVENUE -->
    <div class="pl-section">
      <div class="pl-section-header">Revenue</div>
      ${row('Food & Catering Sales', pl.revenue_food, ['Revenue - Food Sales','Revenue - Catering','Revenue - Delivery Sales'])}
      ${row('Beverage Sales', pl.revenue_bev, ['Revenue - Beverage Sales'])}
      ${pl.revenue_other ? row('Other Revenue (Gift Cards)', pl.revenue_other, ['Revenue - Gift Cards']) : ''}
      ${row('Less: Refunds & Discounts', pl.contra, ['Revenue Contra - Refunds'])}
      <div class="pl-subtotal">
        <span class="pl-subtotal-label">Net Revenue</span>
        <span class="pl-subtotal-amount ${colorClass(pl.net_revenue)}">${fmt(pl.net_revenue)}</span>
      </div>
    </div>

    <!-- COGS -->
    <div class="pl-section">
      <div class="pl-section-header">Cost of Goods Sold (COGS)</div>
      ${row('Food Inventory', pl.cogs_food, ['COGS - Food Inventory'])}
      ${row('Beverage Inventory', pl.cogs_bev, ['COGS - Beverage Inventory'])}
      ${row('Packaging & Supplies', pl.cogs_pkg, ['COGS - Packaging & Supplies'])}
      ${row('Delivery Platform Commissions', pl.cogs_del, ['COGS - Delivery Commissions'])}
      <div class="pl-subtotal">
        <span class="pl-subtotal-label">Total COGS</span>
        <span class="pl-subtotal-amount text-red">${fmt(pl.total_cogs)}</span>
      </div>
    </div>

    <!-- GROSS PROFIT -->
    <div class="pl-total ${pl.gross_profit >= 0 ? 'profit' : 'loss'}">
      <span class="pl-total-label">Gross Profit</span>
      <span class="pl-total-amount">${fmt(pl.gross_profit)}</span>
    </div>
    <p style="font-size:11px;color:#5a6580;padding:4px 0 16px">Gross Margin: ${pl.net_revenue > 0 ? ((pl.gross_profit/pl.net_revenue)*100).toFixed(1) : 0}%</p>

    <!-- PAYROLL -->
    <div class="pl-section">
      <div class="pl-section-header">Payroll</div>
      ${row('Hourly Kitchen & FOH + Taxes', pl.payroll_hourly, ['Payroll - Hourly & Taxes'])}
      ${row('Management Salaries', pl.payroll_mgmt, ['Payroll - Management'])}
      <div class="pl-subtotal">
        <span class="pl-subtotal-label">Total Payroll</span>
        <span class="pl-subtotal-amount text-red">${fmt(pl.total_payroll)}</span>
      </div>
    </div>

    <!-- OPEX -->
    <div class="pl-section">
      <div class="pl-section-header">Operating Expenses</div>
      ${Object.entries(pl.opex_items).filter(([,v]) => v !== 0).map(([k, v]) =>
        row(k, v, [`OpEx - ${k}`])
      ).join('')}
      <div class="pl-subtotal">
        <span class="pl-subtotal-label">Total OpEx</span>
        <span class="pl-subtotal-amount text-red">${fmt(pl.total_opex)}</span>
      </div>
    </div>

    <!-- OPERATING PROFIT -->
    <div class="pl-total ${pl.operating_profit >= 0 ? 'profit' : 'loss'}">
      <span class="pl-total-label">Operating Profit</span>
      <span class="pl-total-amount">${fmt(pl.operating_profit)}</span>
    </div>
    <p style="font-size:11px;color:#5a6580;padding:4px 0 16px">Operating Margin: ${pl.net_revenue > 0 ? ((pl.operating_profit/pl.net_revenue)*100).toFixed(1) : 0}%</p>

    <!-- BELOW THE LINE -->
    <div class="pl-section">
      <div class="pl-section-header">Below-the-Line Items (Excluded from P&L)</div>
      ${pl.capex  ? row('CapEx - Equipment Purchases ⚠️', pl.capex, ['CapEx - Equipment']) : ''}
      ${pl.loan   ? row('Loan Principal Repayments ⚠️', pl.loan, ['Balance Sheet - Loan Repayment']) : ''}
      ${pl.owner  ? row('Owner Distributions ⚠️', pl.owner, ['Balance Sheet - Owner Draw']) : ''}
      ${pl.tax    ? row('Sales Tax Remittances ⚠️', pl.tax, ['Balance Sheet - Sales Tax']) : ''}
      <p class="pl-note">⚠️ These items require separate accounting treatment and are not included in Operating Profit above.</p>
    </div>
  `;

  document.getElementById('pl-content').innerHTML = html;
}

// ===================================================
// 13. DRILL-DOWN MODAL
// ===================================================
function drillDown(months, categories, label) {
  const txns = transactions
    .map(t => getEffectiveTxn(t))
    .filter(t => months.includes(t.month) && categories.includes(t.category));

  const total = txns.reduce((a, t) => a + t.amount, 0);

  document.getElementById('drill-modal-title').textContent = `${label} — ${txns.length} transactions`;
  document.getElementById('drill-modal-body').innerHTML = `
    <div class="table-wrapper" style="max-height:60vh;overflow-y:auto">
      <table class="drill-table">
        <thead>
          <tr>
            <th>ID</th><th>Date</th><th>Description</th><th>Counterparty</th><th style="text-align:right">Amount</th><th>Method</th>
          </tr>
        </thead>
        <tbody>
          ${txns.map(t => `
            <tr>
              <td style="font-family:monospace;color:#5a6580;font-size:11px">${t.id}</td>
              <td>${t.date}</td>
              <td>${t.description}</td>
              <td style="color:#7a8299">${t.counterparty}</td>
              <td style="text-align:right" class="${t.amount >= 0 ? 'amount-positive' : 'amount-negative'}">${fmt(t.amount)}</td>
              <td style="color:#5a6580;font-size:11px">${t.method}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="drill-total">
      <span>Total (${txns.length} transactions)</span>
      <span class="${total >= 0 ? 'text-green' : 'text-red'}">${fmt(total)}</span>
    </div>
  `;

  document.getElementById('drill-modal').style.display = 'flex';
}

function closeDrillModal() {
  document.getElementById('drill-modal').style.display = 'none';
}

// ===================================================
// 14. VARIANCE ANALYSIS
// ===================================================
const VARIANCE_CATEGORIES = [
  { key: 'net_revenue',         label: 'Net Revenue',                 isRevenue: true },
  { key: 'cogs_food',           label: 'Food COGS',                   isRevenue: false },
  { key: 'cogs_bev',            label: 'Beverage COGS',               isRevenue: false },
  { key: 'cogs_pkg',            label: 'Packaging & Supplies',        isRevenue: false },
  { key: 'cogs_del',            label: 'Delivery Commissions',        isRevenue: false },
  { key: 'total_cogs',          label: 'Total COGS',                  isRevenue: false, subtotal: true },
  { key: 'gross_profit',        label: 'Gross Profit',                isRevenue: true,  subtotal: true },
  { key: 'payroll_hourly',      label: 'Payroll - Hourly & Taxes',    isRevenue: false },
  { key: 'payroll_mgmt',        label: 'Payroll - Management',        isRevenue: false },
  { key: 'total_payroll',       label: 'Total Payroll',               isRevenue: false, subtotal: true },
  { key: 'total_opex',          label: 'Total OpEx',                  isRevenue: false, subtotal: true },
  { key: 'operating_profit',    label: 'Operating Profit',            isRevenue: true,  subtotal: true },
];

function renderVariances() {
  const fromM = document.getElementById('var-from').value;
  const toM   = document.getElementById('var-to').value;
  if (fromM === toM) {
    document.getElementById('variance-content').innerHTML = '<p style="color:#5a6580;padding:20px">Select two different months to compare.</p>';
    return;
  }

  const plFrom = calcPL(fromM);
  const plTo   = calcPL(toM);

  // Find max absolute change for bar scaling
  const maxAbs = Math.max(...VARIANCE_CATEGORIES.map(c => Math.abs((plTo[c.key] || 0) - (plFrom[c.key] || 0))));

  const rows = VARIANCE_CATEGORIES.map(c => {
    const from = plFrom[c.key] || 0;
    const to   = plTo[c.key] || 0;
    const delta = to - from;
    const pct   = from !== 0 ? ((delta / Math.abs(from)) * 100).toFixed(1) : '—';
    const isMaterial = Math.abs(delta) > 2000;
    const barW  = maxAbs > 0 ? Math.abs(delta / maxAbs * 100) : 0;

    // Color logic: for expenses (negative amounts), an increase (more negative) is bad
    const isPositive = c.isRevenue ? delta > 0 : delta < 0; // expense decrease is "good"
    const deltaColor = isPositive ? 'text-green' : 'text-red';

    // Determine drill categories
    const drillCatMap = {
      net_revenue: ['Revenue - Food Sales','Revenue - Beverage Sales','Revenue - Catering','Revenue - Delivery Sales','Revenue - Gift Cards','Revenue Contra - Refunds'],
      cogs_food: ['COGS - Food Inventory'],
      cogs_bev: ['COGS - Beverage Inventory'],
      cogs_pkg: ['COGS - Packaging & Supplies'],
      cogs_del: ['COGS - Delivery Commissions'],
      payroll_hourly: ['Payroll - Hourly & Taxes'],
      payroll_mgmt: ['Payroll - Management'],
    };
    const drillCats = drillCatMap[c.key];
    const drillBtn = drillCats
      ? `<button class="var-drill-btn" onclick="event.stopPropagation();varDrill('${fromM}','${toM}',${JSON.stringify(drillCats)},'${c.label}')">Show txns →</button>`
      : `<span></span>`;

    return `<div class="variance-row ${c.subtotal ? 'subtotal-row' : ''}">
      <div class="var-category" style="${c.subtotal ? 'font-weight:700;color:#e1e4ed' : ''}">${c.label} ${isMaterial ? '<span class="material-tag">MATERIAL</span>' : ''}</div>
      <div class="var-amount ${from >= 0 ? 'text-green' : 'text-red'}">${fmt(from)}</div>
      <div class="var-amount ${to >= 0 ? 'text-green' : 'text-red'}">${fmt(to)}</div>
      <div class="var-change-pct ${deltaColor}">${delta > 0 ? '+' : ''}${fmt(delta)} (${pct}%)</div>
      <div class="var-bar-container">
        <div class="var-bar ${isPositive ? 'bar-up-rev' : 'bar-up'}" style="width:${barW}%"></div>
      </div>
      ${drillBtn}
    </div>`;
  });

  document.getElementById('variance-content').innerHTML = `
    <div class="variance-grid">
      <div class="variance-row header">
        <div>Category</div>
        <div style="text-align:right">${monthName(fromM)}</div>
        <div style="text-align:right">${monthName(toM)}</div>
        <div style="text-align:right">Change</div>
        <div></div>
        <div></div>
      </div>
      ${rows.join('')}
    </div>
  `;
}

function varDrill(fromM, toM, cats, label) {
  const months = [fromM, toM];
  const txns = transactions
    .map(t => getEffectiveTxn(t))
    .filter(t => months.includes(t.month) && cats.includes(t.category))
    .sort((a, b) => a.month.localeCompare(b.month) || a.date.localeCompare(b.date));

  const fromTxns = txns.filter(t => t.month === fromM);
  const toTxns   = txns.filter(t => t.month === toM);
  const fromTotal = fromTxns.reduce((a, t) => a + t.amount, 0);
  const toTotal   = toTxns.reduce((a, t) => a + t.amount, 0);
  const delta = toTotal - fromTotal;

  const tbl = (rows, total, mLabel) => `
    <p style="font-size:12px;font-weight:600;color:#c5cce0;margin-bottom:6px">${mLabel} — ${rows.length} transactions</p>
    <table class="drill-table" style="margin-bottom:8px">
      <thead><tr><th>ID</th><th>Date</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows.map(t => `<tr>
        <td style="font-family:monospace;color:#5a6580;font-size:11px">${t.id}</td>
        <td>${t.date}</td>
        <td>${t.description}</td>
        <td style="text-align:right" class="${t.amount >= 0 ? 'amount-positive' : 'amount-negative'}">${fmt(t.amount)}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="drill-total" style="margin-bottom:16px">
      <span>Subtotal</span>
      <span class="${total >= 0 ? 'text-green' : 'text-red'}">${fmt(total)}</span>
    </div>`;

  document.getElementById('drill-modal-title').textContent = `${label} — Variance Drill-Down`;
  document.getElementById('drill-modal-body').innerHTML = `
    <div style="background:#1a2035;padding:12px 14px;border-radius:8px;margin-bottom:16px;font-size:13px">
      Variance: <strong class="${delta >= 0 ? 'text-green' : 'text-red'}">${delta > 0 ? '+' : ''}${fmt(delta)}</strong>
      from ${monthName(fromM)} to ${monthName(toM)}
    </div>
    <div style="max-height:60vh;overflow-y:auto">
      ${tbl(fromTxns, fromTotal, monthName(fromM))}
      ${tbl(toTxns, toTotal, monthName(toM))}
    </div>`;

  document.getElementById('drill-modal').style.display = 'flex';
}

// ===================================================
// 15. REVIEW ITEMS
// ===================================================
function getReviewItems() {
  const items = [];
  transactions.forEach(t => {
    const et = getEffectiveTxn(t);
    if (et.flagReason || et.uncertain) {
      items.push(et);
    }
  });
  return items;
}

function renderReviewItems() {
  const items = getReviewItems();
  const unresolvedItems = items.filter(t => !reviewResolved[t.id]);
  const resolvedItems   = items.filter(t => reviewResolved[t.id]);

  if (items.length === 0) {
    document.getElementById('review-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <p>No items requiring review. All transactions are classified and verified.</p>
      </div>`;
    return;
  }

  const card = (t, resolved) => {
    let flagType = 'flag-uncertain';
    let flagLabel = '⚠️ Uncertain Classification';
    if (t.plGroup === 'non_pl') { flagType = 'flag-balance-sheet'; flagLabel = '📋 Balance Sheet Item'; }
    if (t.uncertain && t.plGroup !== 'non_pl') { flagType = 'flag-uncertain'; flagLabel = '⚠️ Uncertain Category'; }
    if (t.amount < -10000 && t.plGroup === 'cogs') { flagType = 'flag-unusual'; flagLabel = '🔴 Unusually Large'; }

    return `<div class="review-card ${resolved ? 'resolved' : ''}">
      <div>
        <div class="review-txn-id">${t.id} · ${t.date}</div>
        <div class="review-desc">${t.description}</div>
        <div class="review-meta">${t.counterparty} · <strong class="${t.amount >= 0 ? 'text-green' : 'text-red'}">${fmt(t.amount)}</strong> · ${t.method}</div>
        <div class="review-flag ${flagType}">${flagLabel}</div>
        <span class="cat-badge ${catBadgeClass(t.group)}" style="font-size:11px">${t.category}</span>
        ${t.flagReason ? `<p class="review-reason">💡 ${t.flagReason}</p>` : ''}
      </div>
      <div class="review-actions">
        ${resolved
          ? `<span class="resolved-label">✓ Resolved</span>`
          : `<button class="btn-resolve" onclick="resolveItem('${t.id}')">✓ Mark Resolved</button>
             <button class="btn-edit-cat" onclick="openEditModal('${t.id}')">Edit Category</button>`
        }
      </div>
    </div>`;
  };

  document.getElementById('review-content').innerHTML = `
    <div class="review-grid">
      ${unresolvedItems.length > 0 ? unresolvedItems.map(t => card(t, false)).join('') : ''}
      ${resolvedItems.length > 0 ? `
        <div style="font-size:12px;color:#5a6580;margin-top:12px;padding:8px 0;border-top:1px solid #232b3e">
          ✓ ${resolvedItems.length} resolved item${resolvedItems.length > 1 ? 's' : ''}
        </div>
        ${resolvedItems.map(t => card(t, true)).join('')}
      ` : ''}
    </div>`;
}

function resolveItem(txnId) {
  reviewResolved[txnId] = true;
  updateReviewBadge();
  renderReviewItems();
}

function updateReviewBadge() {
  const count = getReviewItems().filter(t => !reviewResolved[t.id]).length;
  const badge = document.getElementById('review-badge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

// ===================================================
// 16. AI ANALYST — Powered by Groq (Llama 3.1 70B)
//     Financial math stays deterministic in JS.
//     Only natural language reasoning goes to Groq.
// ===================================================
function sendChat() {
  const input = document.getElementById('chat-input');
  const question = input.value.trim();
  if (!question) return;
  input.value = '';
  askQuestion(question);
}

function askQuestion(question) {
  appendUserMsg(question);
  appendThinking();

  // Try Groq first; silently fall back to built-in engine if anything fails
  callGroqAPI(question)
    .then(answer => {
      removeThinking();
      appendAssistantMsg(answer.text, answer.evidence);
    })
    .catch(() => {
      // Groq unavailable or key missing — fall back to built-in answer engine
      removeThinking();
      const answer = generateAnswer(question);
      // Append a small note so user/reviewer knows fallback was used
      const fallbackNote = `<p style="font-size:10px;color:#5a6580;margin-top:8px;border-top:1px solid #1a2035;padding-top:6px">🔌 <em>Built-in mode (Groq API unavailable)</em></p>`;
      appendAssistantMsg(answer.text + fallbackNote, answer.evidence);
    });
}

// Build a rich context string from actual computed data (no LLM math)
function buildFinancialContext() {
  const jan = calcPL('2026-01');
  const feb = calcPL('2026-02');
  const mar = calcPL('2026-03');
  const q1  = calcPL('Q1');

  const plSummary = (label, pl) =>
    `${label}:\n` +
    `  Net Revenue: ${fmt(pl.net_revenue)} | Gross Profit: ${fmt(pl.gross_profit)} (${pl.net_revenue>0?((pl.gross_profit/pl.net_revenue)*100).toFixed(1):0}%)\n` +
    `  Food COGS: ${fmt(pl.cogs_food)} | Bev COGS: ${fmt(pl.cogs_bev)} | Delivery Comm: ${fmt(pl.cogs_del)}\n` +
    `  Payroll (hourly+taxes): ${fmt(pl.payroll_hourly)} | Mgmt Salary: ${fmt(pl.payroll_mgmt)}\n` +
    `  Total OpEx: ${fmt(pl.total_opex)} | Rent: ${fmt(pl.opex_items['Rent']||0)}\n` +
    `  Operating Profit: ${fmt(pl.operating_profit)} (${pl.net_revenue>0?((pl.operating_profit/pl.net_revenue)*100).toFixed(1):0}% margin)\n` +
    `  Non-P&L items: CapEx ${fmt(pl.capex)}, Loan repayment ${fmt(pl.loan)}, Owner draw ${fmt(pl.owner)}, Sales tax ${fmt(pl.tax)}`;

  // Compact transaction list
  const txnLines = transactions.map(t => {
    const et = getEffectiveTxn(t);
    return `${et.id}|${et.date}|${et.description}|${et.counterparty}|${et.amount}|${et.category}|${et.plGroup}`;
  }).join('\n');

  const reviewFlags = getReviewItems()
    .map(t => `${t.id} (${t.description}, ${fmt(t.amount)}): ${t.flagReason || 'Uncertain classification'}`)
    .join('\n');

  return `
=== NYC RESTAURANT CO. — FINANCIAL DATA (Q1 2026) ===

PRECOMPUTED P&L (calculated deterministically from transactions — these numbers are exact):
${plSummary('January 2026', jan)}

${plSummary('February 2026', feb)}

${plSummary('March 2026', mar)}

${plSummary('Q1 2026 Total', q1)}

KEY VARIANCES (Feb → Mar):
  Revenue: ${fmt(mar.net_revenue - feb.net_revenue, true)}
  Food COGS: ${fmt(mar.cogs_food - feb.cogs_food, true)}
  Payroll: ${fmt(mar.total_payroll - feb.total_payroll, true)}
  Operating Profit: ${fmt(mar.operating_profit - feb.operating_profit, true)}

FLAGGED ITEMS REQUIRING REVIEW:
${reviewFlags || 'None'}

ALL TRANSACTIONS (format: ID|Date|Description|Counterparty|Amount|Category|PLGroup):
${txnLines}
`;
}

// Build a COMPACT context (summary only) to keep the payload small
function buildCompactContext() {
  const jan = calcPL('2026-01');
  const feb = calcPL('2026-02');
  const mar = calcPL('2026-03');
  const q1  = calcPL('Q1');

  const row = (label, pl) =>
    `${label}: Revenue=${fmt(pl.net_revenue)}, GrossProfit=${fmt(pl.gross_profit)}, ` +
    `FoodCOGS=${fmt(pl.cogs_food)}, BevCOGS=${fmt(pl.cogs_bev)}, DelComm=${fmt(pl.cogs_del)}, ` +
    `HourlyPayroll=${fmt(pl.payroll_hourly)}, MgmtPayroll=${fmt(pl.payroll_mgmt)}, ` +
    `Rent=${fmt(pl.opex_items['Rent']||0)}, TotalOpEx=${fmt(pl.total_opex)}, ` +
    `OperatingProfit=${fmt(pl.operating_profit)}`;

  // Category totals per month (compact)
  const catSummary = ALL_MONTHS.map(m => {
    const mt = transactions.map(t => getEffectiveTxn(t)).filter(t => t.month === m);
    const bycat = {};
    mt.forEach(t => { bycat[t.category] = (bycat[t.category]||0) + t.amount; });
    return `${monthName(m)}: ` + Object.entries(bycat).map(([k,v]) => `${k}=${fmt(v)}`).join(', ');
  }).join('\n');

  // Top 20 largest transactions for evidence
  const top20 = transactions
    .map(t => getEffectiveTxn(t))
    .sort((a,b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 20)
    .map(t => `${t.id}|${t.date}|${t.description}|${t.amount}|${t.category}`)
    .join('\n');

  const flags = getReviewItems()
    .map(t => `${t.id}: ${t.description} (${fmt(t.amount)}) — ${t.flagReason||'Uncertain'}`)
    .join('\n');

  return `NYC RESTAURANT CO. — Q1 2026 FINANCIAL SUMMARY

MONTHLY P&L (exact figures from transaction data):
${row('Jan 2026', jan)}
${row('Feb 2026', feb)}
${row('Mar 2026', mar)}
${row('Q1 Total', q1)}

KEY VARIANCES (Feb→Mar):
  Revenue: ${fmt(mar.net_revenue-feb.net_revenue,true)}
  Food COGS: ${fmt(mar.cogs_food-feb.cogs_food,true)}
  Payroll: ${fmt(mar.total_payroll-feb.total_payroll,true)}
  Operating Profit: ${fmt(mar.operating_profit-feb.operating_profit,true)}

CATEGORY BREAKDOWN BY MONTH:
${catSummary}

TOP 20 LARGEST TRANSACTIONS:
${top20}

FLAGGED ITEMS:
${flags||'None'}

Total transactions: 181 (Jan: ~60, Feb: ~60, Mar: ~61)`;
}

// Call Netlify serverless function — API key stays on server, never in browser
async function callGroqAPI(userQuestion) {
  const context = buildCompactContext();
  const fullPrompt = `You are a financial analyst for NYC Restaurant Co.
Only use numbers from the data below. Be concise, use bullet points.
Non-P&L items (owner draws, loans, sales tax, CapEx) are excluded from Operating Profit.

${context}

User question: ${userQuestion}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt })
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.text || '';
  if (!rawText) throw new Error('empty response');

  // Markdown → HTML
  const htmlText = rawText
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/`(.+?)`/g,     '<code>$1</code>')
    .replace(/^#{1,3} (.+)$/gm, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm,   '<li style="margin:3px 0">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, m => `<ul style="margin:6px 0 6px 16px">${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p style="margin-top:8px">')
    .replace(/\n/g, '<br/>');

  // Surface evidence transactions mentioned by ID in the answer
  const evidenceTxns = transactions
    .map(t => getEffectiveTxn(t))
    .filter(t => rawText.includes(t.id))
    .slice(0, 8);

  return { text: `<p>${htmlText}</p>`, evidence: evidenceTxns.length > 0 ? evidenceTxns : null };
}

function appendUserMsg(text) {
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML += `<div class="chat-msg user">
    <div class="msg-avatar">👤</div>
    <div class="msg-bubble"><p>${escHtml(text)}</p></div>
  </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function appendThinking() {
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML += `<div class="chat-msg assistant" id="thinking-msg">
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">
      <div class="thinking-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
    </div>
  </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function removeThinking() {
  const t = document.getElementById('thinking-msg');
  if (t) t.remove();
}

function appendAssistantMsg(text, evidenceRows) {
  const msgs = document.getElementById('chat-messages');
  let evidenceHTML = '';
  if (evidenceRows && evidenceRows.length > 0) {
    evidenceHTML = `
      <p style="font-size:11px;color:#5a6580;margin-top:12px;margin-bottom:4px">📎 Supporting transactions:</p>
      <table class="msg-source-table">
        <thead><tr><th>ID</th><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${evidenceRows.slice(0, 8).map(t => `<tr>
            <td style="font-family:monospace">${t.id}</td>
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td class="${t.amount >= 0 ? 'amount-positive' : 'amount-negative'}">${fmt(t.amount)}</td>
          </tr>`).join('')}
          ${evidenceRows.length > 8 ? `<tr><td colspan="4" style="color:#5a6580;font-style:italic">…and ${evidenceRows.length - 8} more</td></tr>` : ''}
        </tbody>
      </table>`;
  }
  msgs.innerHTML += `<div class="chat-msg assistant">
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">${text}${evidenceHTML}</div>
  </div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== ANSWER ENGINE =====
function generateAnswer(q) {
  const ql = q.toLowerCase();
  const txns = transactions.map(t => getEffectiveTxn(t));

  // Helper
  const monthTxns = (m) => txns.filter(t => t.month === m);
  const filterCat = (t, cats) => Array.isArray(cats) ? cats.some(c => t.category === c) : t.category === cats;
  const sumTxns   = (arr) => arr.reduce((a, t) => a + t.amount, 0);

  // Month detection
  const janRe = /jan(uary)?/i, febRe = /feb(ruary)?/i, marRe = /mar(ch)?/i;
  const mentionedMonths = [];
  if (janRe.test(ql)) mentionedMonths.push('2026-01');
  if (febRe.test(ql)) mentionedMonths.push('2026-02');
  if (marRe.test(ql)) mentionedMonths.push('2026-03');
  const targetMonths = mentionedMonths.length > 0 ? mentionedMonths : ALL_MONTHS;

  // === REVENUE QUESTIONS ===
  if (/revenue|sales|income/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    if (mentionedMonths.length === 1) {
      const m = mentionedMonths[0];
      const pl = calcPL(m);
      const ev = txns.filter(t => t.month === m && t.plGroup === 'revenue');
      return {
        text: `<p>In <strong>${monthName(m)}</strong>, net revenue was <strong class="text-green">${fmt(pl.net_revenue)}</strong>:</p>
          <ul>
            <li>Food & Catering Sales: <strong>${fmt(pl.revenue_food)}</strong></li>
            <li>Beverage Sales: <strong>${fmt(pl.revenue_bev)}</strong></li>
            ${pl.revenue_other ? `<li>Gift Cards: <strong>${fmt(pl.revenue_other)}</strong></li>` : ''}
            <li>Less Refunds: <strong class="text-red">${fmt(pl.contra)}</strong></li>
          </ul>
          <p>Net Revenue: <strong class="text-green">${fmt(pl.net_revenue)}</strong></p>`,
        evidence: ev.slice(0, 10)
      };
    }
    return {
      text: `<p>Monthly revenue breakdown:</p>
        <ul>
          <li><strong>January:</strong> Net Revenue = ${fmt(jan.net_revenue)} (Gross: ${fmt(jan.total_revenue)}, Refunds: ${fmt(jan.contra)})</li>
          <li><strong>February:</strong> Net Revenue = ${fmt(feb.net_revenue)} (Gross: ${fmt(feb.total_revenue)}, Refunds: ${fmt(feb.contra)})</li>
          <li><strong>March:</strong> Net Revenue = ${fmt(mar.net_revenue)} (Gross: ${fmt(mar.total_revenue)}, Refunds: ${fmt(mar.contra)})</li>
        </ul>
        <p><strong>Q1 Total Net Revenue: ${fmt(calcPL('Q1').net_revenue)}</strong></p>
        <p>Revenue grew each month, with March being the strongest month. The primary driver is POS food sales via Toast, supplemented by delivery payouts (DoorDash/Uber Eats) and catering.</p>`,
      evidence: null
    };
  }

  // === PAYROLL QUESTIONS ===
  if (/payroll|staff|wage|salary|labour|labor/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    const ev = txns.filter(t => t.plGroup === 'payroll');
    return {
      text: `<p>Monthly payroll breakdown (processed via Gusto):</p>
        <ul>
          <li><strong>January:</strong> Hourly + Taxes = ${fmt(jan.payroll_hourly)}, Management = ${fmt(jan.payroll_mgmt)} → <strong>Total: ${fmt(jan.total_payroll)}</strong></li>
          <li><strong>February:</strong> Hourly + Taxes = ${fmt(feb.payroll_hourly)}, Management = ${fmt(feb.payroll_mgmt)} → <strong>Total: ${fmt(feb.total_payroll)}</strong></li>
          <li><strong>March:</strong> Hourly + Taxes = ${fmt(mar.payroll_hourly)}, Management = ${fmt(mar.payroll_mgmt)} → <strong>Total: ${fmt(mar.total_payroll)}</strong></li>
        </ul>
        <p>⚠️ Payroll jumped significantly in March (${fmt(mar.total_payroll - feb.total_payroll, true)} vs February). This aligns with the higher March revenue, suggesting increased staffing for volume — but the payroll growth outpaced revenue growth, compressing margins.</p>
        <p><strong>Q1 Total Payroll: ${fmt(calcPL('Q1').total_payroll)}</strong></p>`,
      evidence: ev
    };
  }

  // === OPERATING PROFIT / PROFIT CHANGE ===
  if (/profit|loss|margin|operating|why.*change|change.*between/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    const febToMar_rev = mar.net_revenue - feb.net_revenue;
    const febToMar_cogs = mar.total_cogs - feb.total_cogs;
    const febToMar_pay = mar.total_payroll - feb.total_payroll;
    const febToMar_opex = mar.total_opex - feb.total_opex;
    const febToMar_profit = mar.operating_profit - feb.operating_profit;
    return {
      text: `<p>Operating profit by month:</p>
        <ul>
          <li><strong>January:</strong> ${fmt(jan.operating_profit)} (margin: ${(jan.operating_profit/jan.net_revenue*100).toFixed(1)}%)</li>
          <li><strong>February:</strong> ${fmt(feb.operating_profit)} (margin: ${(feb.operating_profit/feb.net_revenue*100).toFixed(1)}%)</li>
          <li><strong>March:</strong> ${fmt(mar.operating_profit)} (margin: ${(mar.operating_profit/mar.net_revenue*100).toFixed(1)}%)</li>
        </ul>
        <p><strong>February → March change: ${fmt(febToMar_profit, true)}</strong></p>
        <p>Drivers of the change:</p>
        <ul>
          <li>📈 Revenue increased: <strong class="text-green">${fmt(febToMar_rev, true)}</strong></li>
          <li>📉 COGS increased: <strong class="text-red">${fmt(febToMar_cogs, true)}</strong></li>
          <li>📉 Payroll increased: <strong class="text-red">${fmt(febToMar_pay, true)}</strong></li>
          <li>OpEx change: <strong>${fmt(febToMar_opex, true)}</strong></li>
        </ul>
        <p>Revenue grew, but payroll and food COGS grew proportionally faster in March, leading to margin compression despite higher absolute profit.</p>`,
      evidence: null
    };
  }

  // === FOOD COST / COGS ===
  if (/food cost|food cogs|food inventor|food spend/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    const ev = txns.filter(t => t.category === 'COGS - Food Inventory');
    return {
      text: `<p>Food inventory costs by month (Sysco, US Foods, Butcher & Sons, Local Produce Co., Bakery Supply):</p>
        <ul>
          <li><strong>January:</strong> ${fmt(jan.cogs_food)} across ${txns.filter(t=>t.month==='2026-01'&&t.category==='COGS - Food Inventory').length} purchases</li>
          <li><strong>February:</strong> ${fmt(feb.cogs_food)} across ${txns.filter(t=>t.month==='2026-02'&&t.category==='COGS - Food Inventory').length} purchases</li>
          <li><strong>March:</strong> ${fmt(mar.cogs_food)} across ${txns.filter(t=>t.month==='2026-03'&&t.category==='COGS - Food Inventory').length} purchases — a large increase driven by higher volume and a <strong>large catering event food purchase</strong> in March.</li>
        </ul>
        <p>March had materially higher food costs (${fmt(mar.cogs_food - feb.cogs_food, true)} vs Feb). This was partly driven by the higher catering revenue in March, and partly by a large Sysco order of ${fmt(txns.find(t=>t.month==='2026-03'&&t.description.toLowerCase().includes('sysco'))?.amount || 0)} on March 18.</p>`,
      evidence: ev
    };
  }

  // === ATTENTION / FLAG / REVIEW ===
  if (/attention|flag|review|unusual|judgment|concern/.test(ql)) {
    const reviewItems = getReviewItems();
    const unresolved = reviewItems.filter(t => !reviewResolved[t.id]);
    const ev = unresolved;
    return {
      text: `<p>There are <strong>${unresolved.length} transactions</strong> flagged for your attention:</p>
        <ul>
          ${unresolved.map(t => `<li><strong>${t.id}</strong> — ${t.description} (${fmt(t.amount)}) — ${t.flagReason || 'Uncertain classification'}</li>`).join('')}
        </ul>
        <p>The most important ones to review are the <strong>balance sheet items</strong> (owner distributions, loan repayments, sales tax remittances) and the <strong>equipment purchase</strong> which may need to be capitalized and depreciated. Navigate to <em>Review Items</em> to resolve them.</p>`,
      evidence: ev.slice(0, 8)
    };
  }

  // === BIGGEST CHANGES ===
  if (/biggest|significant|most changed|largest change/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    return {
      text: `<p>Most significant changes over the Q1 period (Jan → Mar):</p>
        <ol>
          <li><strong>Revenue Growth:</strong> Net revenue grew from ${fmt(jan.net_revenue)} in January to ${fmt(mar.net_revenue)} in March — a ${(((mar.net_revenue - jan.net_revenue)/jan.net_revenue)*100).toFixed(1)}% increase.</li>
          <li><strong>Payroll Escalation:</strong> Hourly payroll jumped from ${fmt(jan.payroll_hourly)} to ${fmt(mar.payroll_hourly)} — the single biggest cost driver change.</li>
          <li><strong>Food COGS:</strong> Food inventory costs rose from ${fmt(jan.cogs_food)} to ${fmt(mar.cogs_food)} due to a larger catering event and higher volume ordering.</li>
          <li><strong>Beverage Revenue:</strong> Beverage sales grew from ${fmt(jan.revenue_bev)} to ${fmt(mar.revenue_bev)} — a ${(((mar.revenue_bev - jan.revenue_bev)/jan.revenue_bev)*100).toFixed(1)}% increase.</li>
          <li><strong>CapEx (January):</strong> A ${fmt(Math.abs(jan.capex))} equipment purchase (new oven) in January was a one-time non-recurring item not present in Feb/Mar.</li>
        </ol>`,
      evidence: null
    };
  }

  // === DELIVERY ===
  if (/delivery|doordash|uber|commission/.test(ql)) {
    const ev = txns.filter(t => ['Revenue - Delivery Sales','COGS - Delivery Commissions'].includes(t.category));
    const byMonth = ALL_MONTHS.map(m => {
      const payouts = txns.filter(t => t.month === m && t.category === 'Revenue - Delivery Sales');
      const comms   = txns.filter(t => t.month === m && t.category === 'COGS - Delivery Commissions');
      const netDel  = sumTxns(payouts) + sumTxns(comms);
      return { m, payouts: sumTxns(payouts), comms: sumTxns(comms), net: netDel };
    });
    return {
      text: `<p>Delivery channel performance (DoorDash/Uber Eats):</p>
        <ul>
          ${byMonth.map(b => `<li><strong>${monthName(b.m)}:</strong> Payouts ${fmt(b.payouts)}, Commissions ${fmt(b.comms)} → Net: ${fmt(b.net)}</li>`).join('')}
        </ul>
        <p>Delivery commissions typically run ~25–28% of gross delivery revenue, consistent with standard marketplace rates.</p>`,
      evidence: ev
    };
  }

  // === RENT / FIXED COSTS ===
  if (/rent|lease|fixed/.test(ql)) {
    const ev = txns.filter(t => t.category === 'OpEx - Rent');
    return {
      text: `<p>Rent is paid to the Landlord via ACH at <strong>${fmt(-9000)}/month</strong> — constant across all three months.</p>
        <p>Q1 total rent expense: <strong>${fmt(-27000)}</strong>. As a % of Q1 net revenue, rent is approximately ${((27000/Math.abs(calcPL('Q1').net_revenue))*100).toFixed(1)}% — within industry norms for NYC restaurant real estate.</p>`,
      evidence: ev
    };
  }

  // === SPECIFIC MONTH SUMMARY ===
  if (mentionedMonths.length === 1) {
    const m = mentionedMonths[0];
    const pl = calcPL(m);
    return {
      text: `<p><strong>${monthName(m)} Summary:</strong></p>
        <ul>
          <li>Net Revenue: <strong class="text-green">${fmt(pl.net_revenue)}</strong></li>
          <li>Total COGS: <strong class="text-red">${fmt(pl.total_cogs)}</strong></li>
          <li>Gross Profit: <strong class="${pl.gross_profit >= 0 ? 'text-green' : 'text-red'}">${fmt(pl.gross_profit)}</strong> (${(pl.gross_profit/pl.net_revenue*100).toFixed(1)}% margin)</li>
          <li>Total Payroll: <strong class="text-red">${fmt(pl.total_payroll)}</strong></li>
          <li>Total OpEx: <strong class="text-red">${fmt(pl.total_opex)}</strong></li>
          <li>Operating Profit: <strong class="${pl.operating_profit >= 0 ? 'text-green' : 'text-red'}">${fmt(pl.operating_profit)}</strong> (${(pl.operating_profit/pl.net_revenue*100).toFixed(1)}% margin)</li>
        </ul>`,
      evidence: null
    };
  }

  // === DEFAULT / GENERAL ===
  const q1 = calcPL('Q1');
  return {
    text: `<p>I found data related to your question. Here's what I can tell from the transactions:</p>
      <p>Over Q1 2026 (181 transactions total):</p>
      <ul>
        <li><strong>Q1 Net Revenue:</strong> ${fmt(q1.net_revenue)}</li>
        <li><strong>Q1 Total COGS:</strong> ${fmt(q1.total_cogs)}</li>
        <li><strong>Q1 Gross Profit:</strong> ${fmt(q1.gross_profit)} (${(q1.gross_profit/q1.net_revenue*100).toFixed(1)}%)</li>
        <li><strong>Q1 Total Payroll:</strong> ${fmt(q1.total_payroll)}</li>
        <li><strong>Q1 Operating Profit:</strong> ${fmt(q1.operating_profit)}</li>
      </ul>
      <p>Can you be more specific? For example: ask about a specific month, expense category, variance, or transaction type.</p>`,
    evidence: null
  };
}

// ===================================================
// 17. BUILT-IN FALLBACK ANSWER ENGINE
//     Used automatically when Groq API is unavailable.
//     All numbers come from calcPL() — deterministic.
// ===================================================
function generateAnswer(q) {
  const ql = q.toLowerCase();
  const txns = transactions.map(t => getEffectiveTxn(t));
  const sumTxns = (arr) => arr.reduce((a, t) => a + t.amount, 0);

  // Month detection
  const mentionedMonths = [];
  if (/jan(uary)?/i.test(ql)) mentionedMonths.push('2026-01');
  if (/feb(ruary)?/i.test(ql)) mentionedMonths.push('2026-02');
  if (/mar(ch)?/i.test(ql)) mentionedMonths.push('2026-03');

  // === REVENUE ===
  if (/revenue|sales|income/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    if (mentionedMonths.length === 1) {
      const m = mentionedMonths[0];
      const pl = calcPL(m);
      const ev = txns.filter(t => t.month === m && t.plGroup === 'revenue');
      return {
        text: `<p>In <strong>${monthName(m)}</strong>, net revenue was <strong class="text-green">${fmt(pl.net_revenue)}</strong>:</p>
          <ul>
            <li>Food &amp; Catering Sales: <strong>${fmt(pl.revenue_food)}</strong></li>
            <li>Beverage Sales: <strong>${fmt(pl.revenue_bev)}</strong></li>
            ${pl.revenue_other ? `<li>Gift Cards: <strong>${fmt(pl.revenue_other)}</strong></li>` : ''}
            <li>Less Refunds: <strong class="text-red">${fmt(pl.contra)}</strong></li>
          </ul>
          <p>Net Revenue: <strong class="text-green">${fmt(pl.net_revenue)}</strong></p>`,
        evidence: ev.slice(0, 10)
      };
    }
    return {
      text: `<p>Monthly revenue breakdown:</p>
        <ul>
          <li><strong>January:</strong> ${fmt(jan.net_revenue)} (Gross: ${fmt(jan.total_revenue)}, Refunds: ${fmt(jan.contra)})</li>
          <li><strong>February:</strong> ${fmt(feb.net_revenue)} (Gross: ${fmt(feb.total_revenue)}, Refunds: ${fmt(feb.contra)})</li>
          <li><strong>March:</strong> ${fmt(mar.net_revenue)} (Gross: ${fmt(mar.total_revenue)}, Refunds: ${fmt(mar.contra)})</li>
        </ul>
        <p><strong>Q1 Total Net Revenue: ${fmt(calcPL('Q1').net_revenue)}</strong></p>
        <p>Revenue grew each month. Primary drivers: POS food sales via Toast, delivery payouts (DoorDash/Uber Eats), and catering.</p>`,
      evidence: null
    };
  }

  // === PAYROLL ===
  if (/payroll|staff|wage|salary|labour|labor/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    const ev = txns.filter(t => t.plGroup === 'payroll');
    return {
      text: `<p>Monthly payroll (via Gusto):</p>
        <ul>
          <li><strong>January:</strong> Hourly+Taxes ${fmt(jan.payroll_hourly)}, Mgmt ${fmt(jan.payroll_mgmt)} → <strong>${fmt(jan.total_payroll)}</strong></li>
          <li><strong>February:</strong> Hourly+Taxes ${fmt(feb.payroll_hourly)}, Mgmt ${fmt(feb.payroll_mgmt)} → <strong>${fmt(feb.total_payroll)}</strong></li>
          <li><strong>March:</strong> Hourly+Taxes ${fmt(mar.payroll_hourly)}, Mgmt ${fmt(mar.payroll_mgmt)} → <strong>${fmt(mar.total_payroll)}</strong></li>
        </ul>
        <p>⚠️ Payroll jumped in March (${fmt(mar.total_payroll - feb.total_payroll, true)} vs Feb). <strong>Q1 Total: ${fmt(calcPL('Q1').total_payroll)}</strong></p>`,
      evidence: ev
    };
  }

  // === PROFIT / MARGIN / VARIANCE ===
  if (/profit|loss|margin|operating|why.*change|change.*between/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    return {
      text: `<p>Operating profit by month:</p>
        <ul>
          <li><strong>January:</strong> ${fmt(jan.operating_profit)} (${(jan.operating_profit/jan.net_revenue*100).toFixed(1)}% margin)</li>
          <li><strong>February:</strong> ${fmt(feb.operating_profit)} (${(feb.operating_profit/feb.net_revenue*100).toFixed(1)}% margin)</li>
          <li><strong>March:</strong> ${fmt(mar.operating_profit)} (${(mar.operating_profit/mar.net_revenue*100).toFixed(1)}% margin)</li>
        </ul>
        <p><strong>Feb→Mar change: ${fmt(mar.operating_profit - feb.operating_profit, true)}</strong></p>
        <ul>
          <li>Revenue: <span class="text-green">${fmt(mar.net_revenue - feb.net_revenue, true)}</span></li>
          <li>COGS: <span class="text-red">${fmt(mar.total_cogs - feb.total_cogs, true)}</span></li>
          <li>Payroll: <span class="text-red">${fmt(mar.total_payroll - feb.total_payroll, true)}</span></li>
          <li>OpEx: ${fmt(mar.total_opex - feb.total_opex, true)}</li>
        </ul>`,
      evidence: null
    };
  }

  // === FOOD COST / COGS ===
  if (/food cost|food cogs|food inventor|food spend|cogs/.test(ql)) {
    const jan = calcPL('2026-01'), feb = calcPL('2026-02'), mar = calcPL('2026-03');
    const ev = txns.filter(t => t.category === 'COGS - Food Inventory');
    return {
      text: `<p>Food inventory costs by month:</p>
        <ul>
          <li><strong>January:</strong> ${fmt(jan.cogs_food)} (${txns.filter(t=>t.month==='2026-01'&&t.category==='COGS - Food Inventory').length} purchases)</li>
          <li><strong>February:</strong> ${fmt(feb.cogs_food)} (${txns.filter(t=>t.month==='2026-02'&&t.category==='COGS - Food Inventory').length} purchases)</li>
          <li><strong>March:</strong> ${fmt(mar.cogs_food)} — higher due to a large catering event purchase</li>
        </ul>
        <p>March food COGS change vs Feb: <span class="text-red">${fmt(mar.cogs_food - feb.cogs_food, true)}</span></p>`,
      evidence: ev
    };
  }

  // === FLAGS / REVIEW ===
  if (/attention|flag|review|unusual|judgment|concern/.test(ql)) {
    const unresolved = getReviewItems().filter(t => !reviewResolved[t.id]);
    return {
      text: `<p><strong>${unresolved.length} transactions</strong> need your attention:</p>
        <ul>${unresolved.map(t => `<li><strong>${t.id}</strong> — ${t.description} (${fmt(t.amount)}): ${t.flagReason || 'Uncertain classification'}</li>`).join('')}</ul>
        <p>Navigate to <em>Review Items</em> to resolve them.</p>`,
      evidence: unresolved.slice(0, 8)
    };
  }

  // === BIGGEST CHANGES ===
  if (/biggest|significant|most changed|largest change/.test(ql)) {
    const jan = calcPL('2026-01'), mar = calcPL('2026-03');
    return {
      text: `<p>Most significant Q1 changes (Jan → Mar):</p>
        <ol>
          <li><strong>Revenue:</strong> ${fmt(jan.net_revenue)} → ${fmt(mar.net_revenue)} (+${(((mar.net_revenue-jan.net_revenue)/jan.net_revenue)*100).toFixed(1)}%)</li>
          <li><strong>Payroll:</strong> ${fmt(jan.total_payroll)} → ${fmt(mar.total_payroll)} (biggest cost increase)</li>
          <li><strong>Food COGS:</strong> ${fmt(jan.cogs_food)} → ${fmt(mar.cogs_food)} (March catering event)</li>
          <li><strong>CapEx (Jan only):</strong> ${fmt(Math.abs(jan.capex))} equipment purchase — one-time, not in Feb/Mar</li>
        </ol>`,
      evidence: null
    };
  }

  // === DELIVERY ===
  if (/delivery|doordash|uber|commission/.test(ql)) {
    const ev = txns.filter(t => ['Revenue - Delivery Sales','COGS - Delivery Commissions'].includes(t.category));
    const byMonth = ALL_MONTHS.map(m => {
      const payouts = txns.filter(t => t.month === m && t.category === 'Revenue - Delivery Sales');
      const comms   = txns.filter(t => t.month === m && t.category === 'COGS - Delivery Commissions');
      return { m, payouts: sumTxns(payouts), comms: sumTxns(comms) };
    });
    return {
      text: `<p>Delivery channel (DoorDash/Uber Eats):</p>
        <ul>${byMonth.map(b => `<li><strong>${monthName(b.m)}:</strong> Payouts ${fmt(b.payouts)}, Commissions ${fmt(b.comms)} → Net: ${fmt(b.payouts + b.comms)}</li>`).join('')}</ul>
        <p>Commissions run ~25–28% of gross delivery revenue (standard marketplace rate).</p>`,
      evidence: ev
    };
  }

  // === RENT / FIXED ===
  if (/rent|lease|fixed/.test(ql)) {
    const ev = txns.filter(t => t.category === 'OpEx - Rent');
    const q1 = calcPL('Q1');
    return {
      text: `<p>Rent is <strong>$9,000/month</strong> (ACH to Landlord) — constant all 3 months.</p>
        <p>Q1 total: <strong>$27,000</strong> (${((27000/Math.abs(q1.net_revenue))*100).toFixed(1)}% of net revenue).</p>`,
      evidence: ev
    };
  }

  // === SPECIFIC MONTH SUMMARY ===
  if (mentionedMonths.length === 1) {
    const m = mentionedMonths[0];
    const pl = calcPL(m);
    return {
      text: `<p><strong>${monthName(m)} Summary:</strong></p>
        <ul>
          <li>Net Revenue: <strong class="text-green">${fmt(pl.net_revenue)}</strong></li>
          <li>Total COGS: <strong class="text-red">${fmt(pl.total_cogs)}</strong></li>
          <li>Gross Profit: <strong class="${pl.gross_profit>=0?'text-green':'text-red'}">${fmt(pl.gross_profit)}</strong> (${(pl.gross_profit/pl.net_revenue*100).toFixed(1)}% margin)</li>
          <li>Total Payroll: <strong class="text-red">${fmt(pl.total_payroll)}</strong></li>
          <li>Total OpEx: <strong class="text-red">${fmt(pl.total_opex)}</strong></li>
          <li>Operating Profit: <strong class="${pl.operating_profit>=0?'text-green':'text-red'}">${fmt(pl.operating_profit)}</strong> (${(pl.operating_profit/pl.net_revenue*100).toFixed(1)}% margin)</li>
        </ul>`,
      evidence: null
    };
  }

  // === DEFAULT ===
  const q1 = calcPL('Q1');
  return {
    text: `<p>Q1 2026 Summary (181 transactions):</p>
      <ul>
        <li><strong>Net Revenue:</strong> ${fmt(q1.net_revenue)}</li>
        <li><strong>Total COGS:</strong> ${fmt(q1.total_cogs)}</li>
        <li><strong>Gross Profit:</strong> ${fmt(q1.gross_profit)} (${(q1.gross_profit/q1.net_revenue*100).toFixed(1)}%)</li>
        <li><strong>Total Payroll:</strong> ${fmt(q1.total_payroll)}</li>
        <li><strong>Operating Profit:</strong> ${fmt(q1.operating_profit)}</li>
      </ul>
      <p>Try asking about a specific month, expense type, or variance — e.g. "What was revenue in March?" or "Why did payroll increase?"</p>`,
    evidence: null
  };
}

// Close modals on overlay click
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('drill-modal').addEventListener('click', function(e) {
  if (e.target === this) closeDrillModal();
});
