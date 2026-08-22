const token = localStorage.getItem("venyora-token");
const content = document.getElementById("content-area");

let allProducts = [];
let allOrders = [];
let allUsers = [];
let revenueChart = null;
const API = "https://venyora-ecommerce.onrender.com/api";
const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const safe = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

/* ================= ACCESS CONTROL ================= */
if (!token) {
  window.location.href = "../index.html";
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.user.role !== "admin") {
      alert("Access denied");
      window.location.href = "../index.html";
    }
  } catch {
    window.location.href = "../index.html";
  }
}

/* ================= DASHBOARD ================= */
async function loadDashboard() {
  setActiveMenu("Dashboard");
  content.innerHTML = `<div class="admin-loading">Loading your store overview…</div>`;
  try {
    const res = await fetch(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Could not load dashboard");
    const data = await res.json();
    // Keep the dashboard usable while Render is still serving the earlier,
    // smaller dashboard response during a deployment rollout.
    data.dailyRevenue = Array.isArray(data.dailyRevenue) ? data.dailyRevenue : [];
    data.recentOrders = Array.isArray(data.recentOrders) ? data.recentOrders : [];
    data.lowStockItems = Array.isArray(data.lowStockItems) ? data.lowStockItems : [];
    data.topProducts = Array.isArray(data.topProducts) ? data.topProducts : [];
    data.statusBreakdown = data.statusBreakdown || {};
    data.weekRevenue = data.weekRevenue || 0;
    data.averageOrderValue = data.averageOrderValue || 0;
    data.confirmedOrders = data.confirmedOrders || 0;
    content.innerHTML = `
      <section class="dashboard-view">
        <div class="dashboard-title"><div><p class="admin-eyebrow">VENYORA OPERATIONS</p><h1>Store overview</h1><p>What needs your attention today.</p></div><button class="refresh-btn" onclick="loadDashboard()">↻ Refresh</button></div>
        <div class="dashboard-grid premium-stats">
          <article class="stat-card revenue"><span>Lifetime revenue</span><h3>${money(data.totalRevenue)}</h3><p>${money(data.weekRevenue)} in the last 7 days</p></article>
          <article class="stat-card orders"><span>Total orders</span><h3>${data.totalOrders}</h3><p>${data.confirmedOrders} confirmed and being fulfilled</p></article>
          <article class="stat-card users"><span>Customers</span><h3>${data.totalUsers}</h3><p>Average order ${money(data.averageOrderValue)}</p></article>
          <article class="stat-card pending"><span>Needs action</span><h3>${data.pendingOrders}</h3><p>Pending orders to review</p></article>
          <article class="stat-card lowstock"><span>Inventory alert</span><h3>${data.lowStockProducts}</h3><p>Products at 5 units or lower</p></article>
        </div>
        <div class="dashboard-panels">
          <article class="dashboard-panel chart-panel"><div class="panel-heading"><div><p class="admin-eyebrow">REVENUE</p><h2>Last 7 days</h2></div><span class="metric-chip">${money(data.weekRevenue)}</span></div><canvas id="revenueChart"></canvas><div id="revenueFallback" class="revenue-fallback" hidden></div></article>
          <article class="dashboard-panel action-panel"><div class="panel-heading"><div><p class="admin-eyebrow">WORK QUEUE</p><h2>Order status</h2></div></div><div class="status-list"><div><span>Pending</span><strong>${data.statusBreakdown.Pending || 0}</strong></div><div><span>Confirmed</span><strong>${data.statusBreakdown.Confirmed || 0}</strong></div><div><span>Shipped</span><strong>${data.statusBreakdown.Shipped || 0}</strong></div><div><span>Delivered</span><strong>${data.statusBreakdown.Delivered || 0}</strong></div></div><button class="panel-link" onclick="loadOrders()">Manage orders →</button></article>
        </div>
        <div class="dashboard-panels dashboard-lists">
          <article class="dashboard-panel"><div class="panel-heading"><div><p class="admin-eyebrow">FULFILMENT</p><h2>Recent orders</h2></div><button class="text-button" onclick="loadOrders()">View all</button></div><div class="compact-list">${data.recentOrders.length ? data.recentOrders.map(order => `<div class="compact-row"><div><strong>#${safe(order._id.slice(-6).toUpperCase())}</strong><span>${safe(order.user?.name || "Guest customer")}</span></div><div><strong>${money(order.totalAmount)}</strong><span class="order-status status-${safe(order.status).toLowerCase()}">${safe(order.status)}</span></div></div>`).join("") : "<p class='empty-state'>No orders yet.</p>"}</div></article>
          <article class="dashboard-panel"><div class="panel-heading"><div><p class="admin-eyebrow">INVENTORY</p><h2>Low stock</h2></div><button class="text-button" onclick="loadProducts()">Manage</button></div><div class="compact-list">${data.lowStockItems.length ? data.lowStockItems.map(product => `<div class="compact-row inventory-row"><div><img src="${safe(product.imageUrl)}" alt=""><strong>${safe(product.name)}</strong><span>${safe(product.category || "Uncategorised")}</span></div><div><strong class="stock-warning">${product.stock || 0} left</strong></div></div>`).join("") : "<p class='empty-state'>Inventory is healthy.</p>"}</div></article>
          <article class="dashboard-panel"><div class="panel-heading"><div><p class="admin-eyebrow">PRODUCTS</p><h2>Top performers</h2></div></div><div class="compact-list">${data.topProducts.length ? data.topProducts.map((product, index) => `<div class="compact-row performer-row"><div><span class="rank">0${index + 1}</span><strong>${safe(product.name)}</strong></div><div><strong>${money(product.revenue)}</strong><span>${product.units} sold</span></div></div>`).join("") : "<p class='empty-state'>Sales data will appear here.</p>"}</div></article>
        </div>
      </section>`;
    if (window.Chart) {
      if (revenueChart) revenueChart.destroy();
      revenueChart = new Chart(document.getElementById("revenueChart"), { type: "line", data: { labels: data.dailyRevenue.map(day => day.label), datasets: [{ data: data.dailyRevenue.map(day => day.revenue), borderColor: "#d6b288", backgroundColor: "rgba(214,178,136,.14)", fill: true, tension: .38, pointRadius: 3, pointBackgroundColor: "#d6b288" }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: value => `₹${value}` } }, x: { grid: { display: false } } } } });
    } else {
      const chartCanvas = document.getElementById("revenueChart");
      const fallback = document.getElementById("revenueFallback");
      chartCanvas.hidden = true;
      fallback.hidden = false;
      const fallbackDays = data.dailyRevenue.length ? data.dailyRevenue : Array.from({ length: 7 }, (_, index) => ({ label: `Day ${index + 1}`, revenue: 0 }));
      const maxRevenue = Math.max(...fallbackDays.map(day => day.revenue), 1);
      fallback.innerHTML = fallbackDays.map(day => `<div class="revenue-bar"><span class="bar-value">${money(day.revenue)}</span><div class="bar-track"><i style="height:${Math.max(6, Math.round((day.revenue / maxRevenue) * 100))}%"></i></div><span>${safe(day.label)}</span></div>`).join("");
    }
  } catch (error) { content.innerHTML = `<div class="admin-error"><h2>Dashboard unavailable</h2><p>Check the API connection and try again.</p><button onclick="loadDashboard()">Try again</button></div>`; }
}

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  setActiveMenu("Products");

  const res = await fetch("https://venyora-ecommerce.onrender.com/api/admin/products", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const products = await res.json();
  allProducts = products;

  let html = `
    <h1>Products</h1>

    <div class="product-topbar">
      <input 
        type="text" 
        placeholder="Search product..." 
        onkeyup="filterProducts(this.value)"
      >

      <button class="add-btn" onclick="openAddModal()">
        + Add New Product
      </button>
    </div>
  `;

  products.forEach(p => {
    html += `
      <div class="product-card" data-name="${p.name.toLowerCase()}">
        <img src="${p.imageUrl}" width="80" height="80"/>

        <div class="product-info">
          <h4>${p.name}</h4>
          <p>₹${p.price}</p>

          <span class="${(p.stock || 0) <= 5 ? 'badge-low' : 'badge-ok'}">
            Stock: ${p.stock || 0}
          </span>

          <div class="product-actions">
            <button onclick="openEditModal('${p._id}')">Edit</button>
            <button onclick="deleteProduct('${p._id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  });

  content.innerHTML = html;
}

/* ================= FILTER PRODUCTS ================= */
function filterProducts(value) {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach(card => {
    const name = card.dataset.name;
    card.style.display = name.includes(value.toLowerCase()) ? "flex" : "none";
  });
}

/* ================= DELETE PRODUCT ================= */
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`https://venyora-ecommerce.onrender.com/api/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadProducts();
}

/* ================= EDIT PRODUCT ================= */
let editingProductId = null;

function openEditModal(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product) return;

  editingProductId = id;

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  setValue("edit-name", product.name || "");
  setValue("edit-price", product.price || 0);
  setValue("edit-stock", product.stock || 0);
  setValue("edit-imageUrl", product.imageUrl || "");
  setValue("edit-description", product.description || "");
  setValue("edit-category", product.category || "");

  document.getElementById("editModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("editModal").classList.add("hidden");
}

/* ================= UPDATE PRODUCT ================= */
async function updateProduct() {
  const name = document.getElementById("edit-name").value;
  const price = document.getElementById("edit-price").value;
  const stock = document.getElementById("edit-stock").value;
  const imageUrl = document.getElementById("edit-imageUrl").value;
  const description = document.getElementById("edit-description").value;
  const category = document.getElementById("edit-category")?.value;

  await fetch(`https://venyora-ecommerce.onrender.com/api/admin/products/${editingProductId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name,
      price,
      stock,
      imageUrl,
      description,
      category
    })
  });

  closeModal();
  loadProducts();
}

/* ================= ORDERS ================= */
async function loadOrders() {
  setActiveMenu("Orders");
  content.innerHTML = `<div class="admin-loading">Loading orders…</div>`;
  try {
    const res = await fetch(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Could not load orders");
    allOrders = await res.json();
    renderOrders(allOrders);
  } catch { content.innerHTML = `<div class="admin-error"><h2>Orders unavailable</h2><p>Check the API connection and try again.</p><button onclick="loadOrders()">Try again</button></div>`; }
}

function renderOrders(orders) {
  const counts = orders.reduce((result, order) => ({ ...result, [order.status]: (result[order.status] || 0) + 1 }), {});
  content.innerHTML = `<section class="operations-page"><div class="dashboard-title"><div><p class="admin-eyebrow">FULFILMENT CENTRE</p><h1>Orders</h1><p>Review payment, fulfilment and delivery status in one place.</p></div><button class="refresh-btn" onclick="loadOrders()">↻ Refresh</button></div><div class="order-kpis"><div><span>All orders</span><strong>${orders.length}</strong></div><div><span>Pending</span><strong>${counts.Pending || 0}</strong></div><div><span>Confirmed</span><strong>${counts.Confirmed || 0}</strong></div><div><span>Shipped</span><strong>${counts.Shipped || 0}</strong></div></div><div class="admin-table-card"><div class="table-toolbar"><div class="search-box">⌕ <input type="search" placeholder="Search customer or order ID" oninput="filterOrders(this.value)"></div><select onchange="filterOrders(document.querySelector('.search-box input').value, this.value)"><option value="">All statuses</option><option>Pending</option><option>Confirmed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Total</th><th>Created</th><th>Status</th></tr></thead><tbody>${orders.length ? orders.map(o => `<tr><td><strong>#${safe(o._id.slice(-7).toUpperCase())}</strong><small>${o.items?.length || 0} item(s)</small></td><td><strong>${safe(o.user?.name || "Guest customer")}</strong><small>${safe(o.user?.email || "No email")}</small></td><td><span class="payment-label">${safe(o.paymentMethod || "COD")}</span></td><td><strong>${money(o.totalAmount)}</strong></td><td>${new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td><td><select class="status-select status-${safe(o.status).toLowerCase()}" ${o.status === "Cancelled" ? "disabled" : ""} onchange="updateStatus('${o._id}', this.value)"><option ${o.status==='Pending'?'selected':''}>Pending</option><option ${o.status==='Confirmed'?'selected':''}>Confirmed</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option><option ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select></td></tr>`).join("") : `<tr><td colspan="6" class="empty-table">No orders found.</td></tr>`}</tbody></table></div></div></section>`;
}

function filterOrders(query = "", status = "") { const text = query.toLowerCase().trim(); renderOrders(allOrders.filter(order => (!status || order.status === status) && (!text || order._id.toLowerCase().includes(text) || order.user?.name?.toLowerCase().includes(text) || order.user?.email?.toLowerCase().includes(text)))); }

/* ================= UPDATE ORDER STATUS ================= */
async function updateStatus(id, status) {
  await fetch(`https://venyora-ecommerce.onrender.com/api/admin/orders/status/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  loadOrders();
}

/* ================= USERS ================= */
async function loadUsers() {
  setActiveMenu("Users");
  content.innerHTML = `<div class="admin-loading">Loading customers…</div>`;
  try { const res = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error("Could not load customers"); allUsers = await res.json(); renderUsers(allUsers); } catch { content.innerHTML = `<div class="admin-error"><h2>Customers unavailable</h2><p>Check the API connection and try again.</p><button onclick="loadUsers()">Try again</button></div>`; }
}

function renderUsers(users) { content.innerHTML = `<section class="operations-page"><div class="dashboard-title"><div><p class="admin-eyebrow">CUSTOMER DIRECTORY</p><h1>Customers</h1><p>Review registered customers and grow stronger relationships.</p></div><button class="refresh-btn" onclick="loadUsers()">↻ Refresh</button></div><div class="admin-table-card"><div class="table-toolbar"><div class="search-box">⌕ <input type="search" placeholder="Search customers" oninput="filterUsers(this.value)"></div><span class="table-count">${users.length} customers</span></div><div class="customer-grid">${users.length ? users.map(user => `<article class="customer-card"><div class="customer-avatar">${safe((user.name || "U").charAt(0).toUpperCase())}</div><div><h3>${safe(user.name)}</h3><p>${safe(user.email)}</p><span>Joined ${new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span></div><span class="role-tag">${safe(user.role || "user")}</span></article>`).join("") : `<p class="empty-state">No customers found.</p>`}</div></div></section>`; }
function filterUsers(query = "") { const text = query.toLowerCase().trim(); renderUsers(allUsers.filter(user => !text || user.name?.toLowerCase().includes(text) || user.email?.toLowerCase().includes(text))); }

/* ================= SIDEBAR ACTIVE ================= */
function setActiveMenu(section) {
  document.querySelectorAll(".sidebar ul li").forEach(li => {
    li.classList.remove("active");
    if (li.innerText.includes(section)) {
      li.classList.add("active");
    }
  });
}

/* ================= DARK MODE ================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("venyora-token");
  window.location.href = "../index.html";
}

/* ================= ADD PRODUCT ================= */
async function addProduct() {
  const token = localStorage.getItem("venyora-token");

  await fetch("https://venyora-ecommerce.onrender.com/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: document.getElementById("addName").value,

      price: document.getElementById("addPrice").value,

      stock: document.getElementById("addStock").value,

      category: document.getElementById("product-category").value,

      imageUrl: document.getElementById("addImageUrl").value,
      
      description: document.getElementById("addDescription").value,
    })
  });

  closeAddModal();
  loadProducts();
}

function openAddModal() {
  document.getElementById("addModal").classList.remove("hidden");
}

function closeAddModal() {
  document.getElementById("addModal").classList.add("hidden");
}

/* ================= INIT ================= */
loadDashboard();
