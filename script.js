// Base data for the dashboard
const baseData = {
    month: "August",
    statement: {
      total: 54500.12,
      categories: [
        { name: "Food", budget: 2500, actual: 2500 },
        { name: "Transport", budget: 1200, actual: 1200 },
        { name: "Shopping", budget: 4200, actual: 4200 },
        { name: "Travel", budget: 3000, actual: 3000 },
        { name: "Other", budget: 1500, actual: 1500 }
      ]
    },
    activity: {
      range: "Month",
      series: {
        Week: [400, 650, 520, 700, 620, 800, 760],
        Month: [1200, 2400, 1800, 3000, 2600, 3200, 2800],
        Year: [18000, 22000, 19500, 25000, 27000, 30000, 28500]
      },
      labels: ["D1","D2","D3","D4","D5","D6","D7"]
    },
    wallets: [
      { type: "Visa", balance: 45500.12, last4: "1234" },
      { type: "MasterCard", balance: 250.5, last4: "5678" },
      { type: "PayPal", balance: 4550.67, email: "you@example.com" }
    ],
    transactions: [
      { id: 1, name: "George Smith", amount: 124.44, date: "2025-08-03" },
      { id: 2, name: "Olivia Johnson", amount: 98.0, date: "2025-08-04" },
      { id: 3, name: "Kanye Knox", amount: 250.0, date: "2025-08-05" },
      { id: 4, name: "James O’Conner", amount: 300.0, date: "2025-08-06" },
      { id: 5, name: "Fiona Smith", amount: 120.0, date: "2025-08-07" }
    ]
  };
  
  const state = {
    page: "statement",
    data: JSON.parse(JSON.stringify(baseData)),
    charts: {}
  };
  
  // Initialize app
  function init() {
    const saved = localStorage.getItem("wallets");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) state.data.wallets = arr;
      } catch (e) {}
    }
  
    document.querySelectorAll(".tabs button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelector(".tabs button.active")?.classList.remove("active");
        btn.classList.add("active");
        state.page = btn.dataset.page;
        render();
      });
    });
  
    render();
  }
  
  // Render selected page
  function render() {
    const app = document.getElementById("app");
    app.innerHTML = "";
  
    Object.values(state.charts).forEach(ch => ch?.destroy());
    state.charts = {};
  
    const pages = {
      statement: renderStatement,
      activity: renderActivity,
      wallet: renderWallet,
      transactions: renderTransactions
    };
  
    app.appendChild(pages[state.page]());
  }
  
  /* ------------------------
     Statement Page
  ------------------------- */
  function renderStatement() {
    const s = state.data.statement;
    const wrap = sectionCard();
    wrap.innerHTML = `
      <h2>Statement — ${state.data.month}
        <span class="kpi">Total: $${s.total.toLocaleString()}</span>
      </h2>
      <div class="grid-2">
        <div class="chart-wrap"><canvas id="pieChart"></canvas></div>
        <div class="chart-wrap"><canvas id="barChart"></canvas></div>
      </div>
    `;
  
    const labels = s.categories.map(c => c.name);
    const actuals = s.categories.map(c => c.actual);
    const budgets = s.categories.map(c => c.budget);
  
    state.charts.pie = new Chart(wrap.querySelector("#pieChart"), {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: actuals,
          backgroundColor: ["#22c55e","#16a34a","#10b981","#4ade80","#86efac"],
          borderColor: "#fff",
          borderWidth: 1
        }]
      },
      options: { plugins: { legend: { position: "bottom" } } }
    });
  
    state.charts.bar = new Chart(wrap.querySelector("#barChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Actual", data: actuals, backgroundColor: "#22c55e" },
          { label: "Budget", data: budgets, backgroundColor: "#a7f3d0" }
        ]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  
    return wrap;
  }
  
  /* ------------------------
     Activity Page
  ------------------------- */
  function renderActivity() {
    const a = state.data.activity;
    const wrap = sectionCard();
    wrap.innerHTML = `
      <h2>Activity</h2>
      <div class="controls">
        <button class="seg ${a.range==='Week'?'active':''}" data-range="Week">Week</button>
        <button class="seg ${a.range==='Month'?'active':''}" data-range="Month">Month</button>
        <button class="seg ${a.range==='Year'?'active':''}" data-range="Year">Year</button>
      </div>
      <div class="chart-wrap"><canvas id="lineChart"></canvas></div>
    `;
  
    const series = a.series[a.range];
    state.charts.line = new Chart(wrap.querySelector("#lineChart"), {
      type: "line",
      data: {
        labels: a.labels,
        datasets: [{
          label: a.range,
          data: series,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          tension: 0.35,
          fill: true
        }]
      }
    });
  
    wrap.querySelectorAll(".seg").forEach(btn => {
      btn.addEventListener("click", () => {
        wrap.querySelector(".seg.active")?.classList.remove("active");
        btn.classList.add("active");
        state.data.activity.range = btn.dataset.range;
        render();
      });
    });
  
    return wrap;
  }
  
  /* ------------------------
     Wallet Page
  ------------------------- */
  function renderWallet() {
    const w = state.data.wallets;
    const wrap = sectionCard();
    wrap.innerHTML = `<h2>Wallets</h2>`;
  
    const list = document.createElement("div");
    list.className = "list";
    w.forEach(wallet => {
      const card = document.createElement("div");
      card.className = "tx-item";
      card.innerHTML = `
        <div>
          <span class="badge">${wallet.type[0]}</span>
          <strong>${wallet.type}</strong>
          <span class="kpi">${wallet.last4 ? "•••• " + wallet.last4 : (wallet.email || "")}</span>
        </div>
        <div><strong>$${wallet.balance.toLocaleString()}</strong></div>
      `;
      list.appendChild(card);
    });
    wrap.appendChild(list);
  
    const form = document.createElement("form");
    form.className = "card";
    form.innerHTML = `
      <h3>Add New Wallet</h3>
      <div class="form-row">
        <div><label>Card Number</label><input name="number" required /></div>
        <div><label>Expiry</label><input name="expiry" required /></div>
        <div><label>CVV</label><input name="cvv" required /></div>
      </div>
      <button class="primary" type="submit">Save</button>
    `;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(form);
      const last4 = String(f.get("number")).slice(-4);
      state.data.wallets.push({ type: "Visa", balance: 0, last4 });
      localStorage.setItem("wallets", JSON.stringify(state.data.wallets));
      alert("Wallet added (prototype).");
      render();
    });
    wrap.appendChild(form);
  
    return wrap;
  }
  
  /* ------------------------
     Transactions Page
  ------------------------- */
  function renderTransactions() {
    const t = state.data.transactions;
    const wrap = sectionCard();
    wrap.innerHTML = `
      <h2>Transactions</h2>
      <div class="controls">
        <input id="search" placeholder="Search by name..." />
        <button class="seg" id="sort">Sort by amount</button>
      </div>
      <div class="list" id="txList"></div>
    `  
    const listEl = wrap.querySelector("#txList");
    let current = [...t];
  
    function renderList(arr) {
      listEl.innerHTML = "";
      arr.forEach(item => {
        const row = document.createElement("div");
        row.className = "tx-item";
        row.innerHTML = `
          <div>
            <span class="badge">${initials(item.name)}</span>
            <strong>${item.name}</strong>
            <span class="kpi">${item.date}</span>
          </div>
          <div><strong>$${item.amount.toFixed(2)}</strong></div>
        `;
        listEl.appendChild(row);
      });
    }
    renderList(current);
  
    // Search filter
    wrap.querySelector("#search").addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      current = t.filter(x => x.name.toLowerCase().includes(q));
      renderList(current);
    });
  
    // Sort by amount
    wrap.querySelector("#sort").addEventListener("click", () => {
      current.sort((a, b) => b.amount - a.amount);
      renderList(current);
    });
  
    return wrap;
  }
  
  /* ------------------------
     Helper Functions
  ------------------------- */
  function sectionCard() {
    const s = document.createElement("section");
    s.className = "card";
    return s;
  }
  
  function initials(name) {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }
  
  /* ------------------------
     Initialize App
  ------------------------- */
  init();