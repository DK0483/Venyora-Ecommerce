const token = localStorage.getItem("venyora-token");
const content = document.getElementById("content-area");

let allProducts = [];

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

  const res = await fetch("https://venyora-ecommerce.onrender.com/api/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  content.innerHTML = `
    <h1>Dashboard</h1>

    <div class="dashboard-grid">
      <div class="stat-card revenue">
        <h3>₹${data.totalRevenue || 0}</h3>
        <p>Total Revenue</p>
      </div>

      <div class="stat-card orders">
        <h3>${data.totalOrders || 0}</h3>
        <p>Total Orders</p>
      </div>

      <div class="stat-card users">
        <h3>${data.totalUsers || 0}</h3>
        <p>Total Users</p>
      </div>

      <div class="stat-card pending">
        <h3>${data.pendingOrders || 0}</h3>
        <p>Pending Orders</p>
      </div>

      <div class="stat-card lowstock">
        <h3>${data.lowStockProducts || 0}</h3>
        <p>Low Stock Products</p>
      </div>
    </div>
  `;
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

  const res = await fetch("https://venyora-ecommerce.onrender.com/api/admin/orders", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const orders = await res.json();

  let html = `<h1>Orders</h1>`;

  orders.forEach(o => {
    html += `
      <div class="order-card">
        <strong>Order ID:</strong> ${o._id}<br>
        <strong>User:</strong> ${o.user?.name || "N/A"}<br>
        
        <strong>Total:</strong> ₹${o.totalAmount}<br>
        <strong>Status:</strong> 
        <span class="${o.status === 'Cancelled' ? 'status-cancelled' : ''}">
          ${o.status}
        </span><br><br>

        <label>Status:</label><br>
        <select 
          ${o.status === "Cancelled" ? "disabled" : ""} 
          onchange="updateStatus('${o._id}', this.value)"
        >
          <option ${o.status==='Pending'?'selected':''}>Pending</option>
          <option ${o.status==='Confirmed'?'selected':''}>Confirmed</option>
          <option ${o.status==='Shipped'?'selected':''}>Shipped</option>
          <option ${o.status==='Delivered'?'selected':''}>Delivered</option>
          <option ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
        </select>
      </div>
    `;
  });

  content.innerHTML = html;
}

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

  const res = await fetch("https://venyora-ecommerce.onrender.com/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const users = await res.json();

  let html = `<h1>Users</h1>`;

  users.forEach(u => {
    html += `
      <div class="user-card">
        <h4>${u.name}</h4>
        <p>Email: ${u.email}</p>
        <p>Joined: ${new Date(u.createdAt).toLocaleDateString()}</p>
      </div>
    `;
  });

  content.innerHTML = html;
}

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