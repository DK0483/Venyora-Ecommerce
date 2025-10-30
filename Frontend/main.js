// --- Global Cart Count Helper ---
// FIX: Define this function in the global scope so it can be called from cart.html's script block.
const updateCartCount = async () => {
    // Note: Since this is global, we must grab the token and DOM elements inside here.
    const token = localStorage.getItem('venyora-token');
    const cartCountSpan = document.getElementById('cart-count');
    if (!cartCountSpan) return;

    let count = 0;
    if (token) {
        // AUTHENTICATED USER: Fetch count from API 
        try {
            const response = await fetch('https://venyora-api-service.onrender.com/api/cart/user-cart', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const cart = await response.json();
                count = cart.items.length; 
            } else {
                console.warn('Failed to fetch user cart count:', response.status);
                count = 0;
            }
        } catch (error) {
            console.error('Error fetching user cart count:', error);
            count = 0;
        }
    } else {
        // GUEST USER: Count from local storage
        const guestCart = JSON.parse(localStorage.getItem("venyoraGuestCart")) || [];
        count = guestCart.length;
    }
    cartCountSpan.textContent = count; 
};
// --- End Global Cart Count Helper ---


document.addEventListener("DOMContentLoaded", async () => {
    // State variables for color/size selection
    let selectedColor = null;
    let selectedSize = null;
    
    const token = localStorage.getItem('venyora-token');
    const authLinksContainer = document.getElementById('user-auth-links');
    const navCartItem = document.getElementById('nav-cart-item');

    
    // --- Initial setup on page load ---
    if (token) { 
        if (navCartItem) {
            navCartItem.style.display = 'list-item'; // Make cart visible immediately if token exists
        }
        updateCartCount(); // Call the global function
    } else {
        if (navCartItem) {
            navCartItem.style.display = 'none'; // Ensure cart is hidden if no token
        }
    }


    if (token && authLinksContainer) {
        try {
            // FIX: Corrected API URL for user status check
            const response = await fetch('https://venyora-api-service.onrender.com/api/auth/user', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                
                authLinksContainer.style.display = 'none'; // Hide the original signup link container

                const navLinks = document.getElementById("nav-links");
                
                const welcomeLi = document.createElement('li');
                welcomeLi.innerHTML = `<a style="white-space: nowrap;">Welcome, ${user.name}</a>`;
                navLinks.insertBefore(welcomeLi, navCartItem);

                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = `<a href="#" id="logout-link" class="btn" style="cursor:pointer; background-color: #f44336; white-space: nowrap;">Logout</a>`;
                navLinks.insertBefore(logoutLi, navCartItem);
                
                if (navCartItem) {
                    navCartItem.style.display = 'list-item'; 
                }

                document.getElementById('logout-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('venyora-token');
                    alert('You have been logged out.');
                    if (navCartItem) { 
                        navCartItem.style.display = 'none'; 
                    }
                    window.location.reload();
                });
            } else {
                localStorage.removeItem('venyora-token');
                if (navCartItem) {
                    navCartItem.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error verifying user:', error);
            localStorage.removeItem('venyora-token'); 
            if (navCartItem) {
                navCartItem.style.display = 'none';
            }
        }
    }
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");

    if (menuBtn && navLinks) {
        const menuBtnIcon = menuBtn.querySelector("i");
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
            const isOpen = navLinks.classList.contains("open");
            menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
        });
        navLinks.addEventListener("click", (e) => {
            if (!e.target.matches('#logout-link')) {
                navLinks.classList.remove("open");
                menuBtnIcon.setAttribute("class", "ri-menu-line");
            }
        });
    }
    const productCatalogueContainer = document.getElementById('product-catalogue');

    if (productCatalogueContainer) {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://venyora-api-service.onrender.com/api/products');
                if (!response.ok) throw new Error('Network response was not ok');
                
                const products = await response.json();
                productCatalogueContainer.innerHTML = ''; 

                if (products.length === 0) {
                    productCatalogueContainer.innerHTML = '<p>No products found.</p>';
                    return;
                }

                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${product.imageUrl}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p>₹${product.price.toFixed(2)}</p>
                            <a href="product-cora.html?id=${product._id}" class="btn">View Details</a>
                        </div>
                    `;
                    productCatalogueContainer.appendChild(productCard);
                });

            } catch (error) {
                console.error('Failed to fetch products:', error);
                productCatalogueContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
            }
        };
        fetchProducts();
    }
    const productDetailContainer = document.getElementById('product-detail-content');

    if (productDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        if (productId) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`https://venyora-api-service.onrender.com/api/products/${productId}`);
                    if (!response.ok) throw new Error('Product not found');

                    const product = await response.json();
                    document.title = `${product.name} | VENYORA`;
                    productDetailContainer.innerHTML = `
                        <div class="product-image">
                            <img src="${product.imageUrl}" alt="${product.name}" id="product-image">
                        </div>
                        <div class="product-details">
                            <h1 id="product-name">${product.name}</h1>
                            <p class="price" id="product-price">₹${product.price.toFixed(2)}</p>
                            <p class="description" id="product-description">${product.description}</p>
                            
                            <div class="options-container">
                                <div class="option-group">
                                    <h4>Color:</h4>
                                    <div class="colors">
                                        <span class="color-swatch" style="background-color: lavender;"></span>
                                        <span class="color-swatch" style="background-color: #f0e68c;"></span>
                                        <span class="color-swatch" style="background-color: #ffcccb;"></span>
                                    </div>
                                </div>
                                <div class="option-group">
                                    <h4>Size:</h4>
                                    <div class="sizes">
                                        <span class="size-box">4</span>
                                        <span class="size-box">6</span>
                                        <span class="size-box">8</span>
                                        <span class="size-box">10</span>
                                        <span class="size-box">12</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn add-to-bag-btn" data-product-id="${product._id}">ADD TO BAG</button>
                            
                            <div class="accordion">
                                <div class="accordion-item">
                                    <div class="accordion-header">
                                        <h4>DESIGNER NOTES</h4>
                                        <i class="ri-add-line"></i>
                                    </div>
                                    <div class="accordion-content">
                                        <p>${product.designerNotes}</p>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <div class="accordion-header">
                                        <h4>SHIPPING AND RETURNS</h4>
                                        <i class="ri-add-line"></i>
                                    </div>
                                    <div class="accordion-content">
                                        <p>Free Expressway delivery within India. We offer easy 7-day returns and exchanges.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    console.error('Failed to fetch product:', error);
                    productDetailContainer.innerHTML = '<p>Product could not be found.</p>';
                }
            };
            fetchProduct();
        } else {
            productDetailContainer.innerHTML = '<p>No product ID provided.</p>';
        }
    }
    const addItemToCart = async (productId, quantity = 1) => {
        const token = localStorage.getItem('venyora-token');
        if (token) {
            try {
                // FIX: Corrected API URL for adding to cart
                const response = await fetch('https://venyora-api-service.onrender.com/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId, quantity })
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || 'Failed to add item to cart');
                }

                alert('Item added to your cart!');
                updateCartCount(); // Update cart count after adding item

            } catch (error) {
                console.error('Error adding item to cart:', error);
                alert(`Error: ${error.message}`);
            }
        } 
        else {
            const productName = document.getElementById('product-name')?.textContent;
            const productPrice = parseFloat(document.getElementById('product-price')?.textContent.replace('₹', ''));
            const productImage = document.getElementById('product-image')?.src;
            const productID = document.querySelector('.add-to-bag-btn').dataset.productId; // Get ID for guest cart lookup

            if (!productName) {
                alert("Could not find product details to add to guest cart.");
                return;
            }

            let guestCart = JSON.parse(localStorage.getItem("venyoraGuestCart")) || [];
            // Use productID for checking existing item in guest cart
            const existingItem = guestCart.find(item => item.id === productID);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                // For guest cart, we store enough info to render the item later
                guestCart.push({ id: productID, name: productName, price: productPrice, image: productImage, quantity });
            }
            
            localStorage.setItem("venyoraGuestCart", JSON.stringify(guestCart));
            alert(productName + " added to your guest cart!");
            updateCartCount(); // Update cart count after adding item
        }
    };
    
    // START: Color, Size Selection & Add to Bag Validation
    document.body.addEventListener("click", e => {
        // 1. Handle Color Selection
        if (e.target.matches('.color-swatch')) {
            document.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('active'));
            e.target.classList.add('active');
            selectedColor = e.target.style.backgroundColor;
        }

        // 2. Handle Size Selection
        if (e.target.matches('.size-box')) {
            document.querySelectorAll('.size-box').forEach(box => box.classList.remove('active'));
            e.target.classList.add('active');
            selectedSize = e.target.textContent;
        }

        // 3. Handle ADD TO BAG with Validation
        if (e.target.matches(".add-to-bag-btn")) {
            const productId = e.target.dataset.productId;

            // Validation Check
            if (!selectedColor) {
                alert('Please select a color before adding to bag.');
                return;
            }

            if (!selectedSize) {
                alert('Please select a size before adding to bag.');
                return;
            }
            // End Validation Check
            
            if (productId) {
                addItemToCart(productId); 
            }
        }
    });
    // END: Color, Size Selection & Add to Bag Validation

    // START: Accordion functionality for product details
    document.body.addEventListener('click', e => {
        if (e.target.closest('.accordion-header')) {
            const header = e.target.closest('.accordion-header');
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const icon = header.querySelector('i');

            // Toggle max-height to open/close content
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.setAttribute("class", "ri-add-line");
            } else {
                // Open the clicked accordion
                content.style.maxHeight = content.scrollHeight + "px";
                icon.setAttribute("class", "ri-subtract-line");
            }
        }
    });
});