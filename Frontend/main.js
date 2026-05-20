// ================= GLOBAL CART COUNT =================
const updateCartCount = async () => {
  const cartCountSpan = document.getElementById("cart-count");
  if (!cartCountSpan) return;

  const token = localStorage.getItem("venyora-token");

  if (!token) {
    const guestCart = JSON.parse(localStorage.getItem("venyoraGuestCart")) || [];
    cartCountSpan.textContent = guestCart.length;
    return;
  }

  try {
    const response = await fetch(
      "https://venyora-ecommerce.onrender.com/api/cart/user-cart",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("venyora-token");
      cartCountSpan.textContent = 0;
      return;
    }

    const cart = await response.json();
    cartCountSpan.textContent = cart.items.length;
  } catch {
    cartCountSpan.textContent = 0;
  }
};

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", async () => {
  let selectedSize = null;

  updateCartCount();

  const token = localStorage.getItem("venyora-token");
  const authLinksContainer = document.getElementById("user-auth-links");
  const navCartItem = document.getElementById("nav-cart-item");

  // ================= AUTH UI =================
  if (token) {
    try {
      const response = await fetch(
        "https://venyora-ecommerce.onrender.com/api/auth/user",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const user = await response.json();

        if (authLinksContainer) authLinksContainer.style.display = "none";
        if (navCartItem) navCartItem.style.display = "list-item";

        const navLinks = document.getElementById("nav-links");

        const welcomeLi = document.createElement("li");
        welcomeLi.classList.add("profile-dropdown");

        welcomeLi.innerHTML = `
          <span class="profile-trigger">
            Hi, ${user.name} ▾
          </span>
          <div class="dropdown-menu">
            <a href="profile.html#profile">🔴 My Profile</a>
            <a href="profile.html#orders">📦 Orders</a>
            <a href="profile.html#addresses">🏠 Addresses</a>
          </div>
        `;

        const trigger = welcomeLi.querySelector(".profile-trigger");

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          welcomeLi.classList.toggle("active");
        });

        window.addEventListener("click", e => {
          if (!welcomeLi.contains(e.target)) {
            welcomeLi.classList.remove("active");
          }
        });

        navLinks.insertBefore(welcomeLi, navCartItem);

        const logoutLi = document.createElement("li");
        logoutLi.innerHTML = `
          <a href="#" id="logout-link" class="btn" style="background:#f44336;">
            Logout
          </a>`;
        navLinks.insertBefore(logoutLi, navCartItem);

        document.getElementById("logout-link").onclick = e => {
          e.preventDefault();
          localStorage.removeItem("venyora-token");
          location.reload();
        };
      }
    } catch {
      localStorage.removeItem("venyora-token");
    }
  } else {
    if (navCartItem) navCartItem.style.display = "none";
  }

  // ================= PRODUCT CATALOGUE =================
  const productCatalogueContainer = document.getElementById("product-catalogue");

  if (productCatalogueContainer) {
    try {
      const response = await fetch("https://venyora-ecommerce.onrender.com/api/products");
      const products = await response.json();

      productCatalogueContainer.innerHTML = "";

      products.forEach(product => {
        productCatalogueContainer.innerHTML += `
          <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.name}" />
            <div class="product-card-content">
              <h4>${product.name}</h4>
              <p class="product-price">₹${product.price}</p>
              <a href="product-cora.html?id=${product._id}" class="btn">View</a>
            </div>
          </div>
        `;
      });
    } catch {
      productCatalogueContainer.innerHTML =
        "<p style='text-align:center'>Failed to load products</p>";
    }
  }

  // ================= PRODUCT DETAIL PAGE =================
  const productImage = document.getElementById("product-image");
  const productName  = document.getElementById("product-name");
  const productPrice = document.getElementById("product-price");
  const productDesc  = document.getElementById("product-description");
  const addToBagBtn  = document.getElementById("add-to-bag");

  if (productImage && productName) {
    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
      productName.textContent = "Product not found";
      return;
    }

    try {
      const res = await fetch(
        `https://venyora-ecommerce.onrender.com/api/products/${productId}`
      );
      const product = await res.json();

      productImage.src         = product.imageUrl;
      productName.textContent  = product.name;
      productPrice.textContent = `₹${product.price}`;
      productDesc.textContent  = product.description;
      addToBagBtn.dataset.productId = product._id;

      addToBagBtn.disabled = true;

      document.querySelectorAll(".size-box").forEach(box => {
        if (box.classList.contains("disabled")) return;

        box.onclick = () => {
          document.querySelectorAll(".size-box").forEach(b => b.classList.remove("active"));
          box.classList.add("active");
          selectedSize = box.textContent;
          addToBagBtn.disabled = false;
        };
      });

    } catch {
      productName.textContent = "Failed to load product";
    }
  }

  // ================= ADD TO CART =================
  const addItemToCart = async productId => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    const token = localStorage.getItem("venyora-token");

    if (!token) {
      alert("Please login to add to cart");
      return;
    }

    await fetch("https://venyora-ecommerce.onrender.com/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1, size: selectedSize })
    });

    updateCartCount();
    alert("Added to bag");
  };

  document.body.addEventListener("click", e => {
    const addBtn = e.target.closest(".add-to-bag-btn");
    if (addBtn) addItemToCart(addBtn.dataset.productId);

    const wishlistBtn = e.target.closest(".wishlist-btn");
    if (wishlistBtn) wishlistBtn.classList.toggle("active");
  });

  // ================= SIZE GUIDE =================
  const sizeGuideOverlay = document.getElementById("size-guide-overlay");
  const openSizeGuide    = document.getElementById("open-size-guide");
  const closeSizeGuide   = document.getElementById("close-size-guide");

  if (openSizeGuide && sizeGuideOverlay) {
    openSizeGuide.addEventListener("click", () => {
      sizeGuideOverlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  }

  if (closeSizeGuide && sizeGuideOverlay) {
    closeSizeGuide.addEventListener("click", () => {
      sizeGuideOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    });
  }

  if (sizeGuideOverlay) {
    sizeGuideOverlay.addEventListener("click", (e) => {
      if (e.target === sizeGuideOverlay) {
        sizeGuideOverlay.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  }

  // ================= MOBILE MENU TOGGLE =================
  const menuBtn   = document.getElementById("menu-btn");
  const navLinksEl = document.getElementById("nav-links");

  if (menuBtn && navLinksEl) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinksEl.classList.toggle("open");
      const icon = menuBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("ri-menu-line");
        icon.classList.toggle("ri-close-line");
      }
    });

    navLinksEl.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinksEl.classList.remove("open");
        const icon = menuBtn.querySelector("i");
        if (icon) {
          icon.classList.add("ri-menu-line");
          icon.classList.remove("ri-close-line");
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!navLinksEl.contains(e.target) && !menuBtn.contains(e.target)) {
        navLinksEl.classList.remove("open");
        const icon = menuBtn.querySelector("i");
        if (icon) {
          icon.classList.add("ri-menu-line");
          icon.classList.remove("ri-close-line");
        }
      }
    });
  }

  // ================= SMOOTH SCROLL =================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});