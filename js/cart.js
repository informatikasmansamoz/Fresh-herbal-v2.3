// Cart JavaScript File

// Global variables
let cart = [];
let recommendedProducts = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    loadRecommendedProducts();
    setupEventListeners();
});

// Load cart from localStorage
function loadCart() {
    cart = storage.get('freshHerbalCart', []);
    
    displayCartItems();
    updateCartSummary();
    updateCartCount();
    updateCheckoutButton();
    updateClearCartButton();
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const cartActions = document.getElementById('cartActions');
    const recommendedSection = document.getElementById('recommendedSection');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart fa-4x"></i>
                <h2>Keranjang Belanja Kosong</h2>
                <p>Belum ada produk di keranjang belanja Anda. Mulai belanja dan tambahkan produk herbal favorit Anda!</p>
                <a href="catalog.html" class="btn btn-primary">
                    <i class="fas fa-store"></i> Mulai Belanja
                </a>
            </div>
        `;
        
        // Hide cart actions and recommended section if cart is empty
        if (cartActions) cartActions.style.display = 'none';
        if (recommendedSection) recommendedSection.style.display = 'none';
        return;
    }
    
    // Show cart actions and recommended section
    if (cartActions) cartActions.style.display = 'flex';
    if (recommendedSection) recommendedSection.style.display = 'block';
    
    // Display cart items
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <button class="cart-item-remove" onclick="removeItem(${item.id})" title="Hapus produk">
                <i class="fas fa-times"></i>
            </button>
            
            <img src="${item.image || 'images/placeholder.jpg'}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='images/placeholder.jpg'">
            
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">${formatCurrency(item.price)}</p>
                
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" title="Kurangi jumlah">
                        <i class="fas fa-minus"></i>
                    </button>
                    
                    <input type="number" 
                           class="quantity-input" 
                           value="${item.quantity}" 
                           min="1" 
                           max="99"
                           onchange="updateQuantity(${item.id}, 0, this.value)"
                           onblur="validateQuantity(${item.id}, this.value)">
                    
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" title="Tambah jumlah">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            
            <div class="cart-item-total">
                <span class="cart-item-total-label">Subtotal:</span>
                <span class="cart-item-total-price">${formatCurrency(item.price * item.quantity)}</span>
            </div>
        </div>
    `).join('');
}

// Update quantity of cart item
function updateQuantity(itemId, change, newQuantity = null) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    if (newQuantity !== null) {
        const quantity = parseInt(newQuantity);
        if (!isNaN(quantity) && quantity >= 1 && quantity <= 99) {
            cart[itemIndex].quantity = quantity;
        }
    } else {
        cart[itemIndex].quantity += change;
        
        // Ensure quantity is between 1 and 99
        if (cart[itemIndex].quantity < 1) cart[itemIndex].quantity = 1;
        if (cart[itemIndex].quantity > 99) cart[itemIndex].quantity = 99;
    }
    
    saveCart();
    displayCartItems();
    updateCartSummary();
    updateCartCount();
    
    // Highlight updated item
    const itemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
    if (itemElement) {
        itemElement.classList.add('updating');
        setTimeout(() => itemElement.classList.remove('updating'), 300);
    }
}

// Validate quantity input
function validateQuantity(itemId, value) {
    const quantity = parseInt(value);
    
    if (isNaN(quantity) || quantity < 1) {
        updateQuantity(itemId, 0, 1);
    } else if (quantity > 99) {
        updateQuantity(itemId, 0, 99);
    }
}

// Remove item from cart
function removeItem(itemId) {
    showConfirmModal(
        'Hapus Produk',
        'Apakah Anda yakin ingin menghapus produk ini dari keranjang?',
        function() {
            // Animate removal
            const itemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
            if (itemElement) {
                itemElement.classList.add('removing');
                setTimeout(() => {
                    cart = cart.filter(item => item.id !== itemId);
                    saveCart();
                    displayCartItems();
                    updateCartSummary();
                    updateCartCount();
                    showNotification('Produk dihapus dari keranjang', 'success');
                }, 300);
            } else {
                cart = cart.filter(item => item.id !== itemId);
                saveCart();
                displayCartItems();
                updateCartSummary();
                updateCartCount();
                showNotification('Produk dihapus dari keranjang', 'success');
            }
        }
    );
}

// Clear entire cart
function clearCart() {
    if (cart.length === 0) return;
    
    showConfirmModal(
        'Kosongkan Keranjang',
        'Apakah Anda yakin ingin mengosongkan seluruh keranjang belanja?',
        function() {
            cart = [];
            saveCart();
            displayCartItems();
            updateCartSummary();
            updateCartCount();
            showNotification('Keranjang berhasil dikosongkan', 'success');
        }
    );
}

// Update cart summary
function updateCartSummary() {
    const container = document.getElementById('cartSummary');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="summary-item">
                <span>Total Item:</span>
                <span>0 produk</span>
            </div>
            <div class="summary-item">
                <span>Subtotal:</span>
                <span>Rp 0</span>
            </div>
            <div class="summary-item">
                <span>Ongkos Kirim:</span>
                <span>Rp 0</span>
            </div>
            <div class="summary-item total">
                <span>Total:</span>
                <span>Rp 0</span>
            </div>
        `;
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 200000 ? 0 : 15000;
    const total = subtotal + shipping;
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    container.innerHTML = `
        <div class="summary-item">
            <span>Total Item:</span>
            <span>${totalItems} produk</span>
        </div>
        <div class="summary-item">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-item ${shipping === 0 ? 'free-shipping' : ''}">
            <span>Ongkos Kirim:</span>
            <span>${shipping === 0 ? 'GRATIS' : 'Rp 15.000'}</span>
        </div>
        <div class="summary-item total">
            <span>Total Pembayaran:</span>
            <span>${formatCurrency(total)}</span>
        </div>
    `;
    
    // Update shipping notice
    const shippingNotice = document.querySelector('.shipping-notice');
    if (shippingNotice) {
        if (subtotal >= 200000) {
            shippingNotice.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Selamat! Anda mendapatkan gratis ongkir</strong>
                    <p>Pembelian Anda sudah mencapai Rp 200.000</p>
                </div>
            `;
        } else {
            const needed = 200000 - subtotal;
            shippingNotice.innerHTML = `
                <i class="fas fa-shipping-fast"></i>
                <div>
                    <strong>Gratis Ongkos Kirim!</strong>
                    <p>Tambah belanja ${formatCurrency(needed)} lagi untuk gratis ongkir</p>
                </div>
            `;
        }
    }
}

// Update checkout button state
function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (cart.length === 0) {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.style.pointerEvents = 'none';
            checkoutBtn.style.opacity = '0.5';
        } else {
            checkoutBtn.classList.remove('disabled');
            checkoutBtn.style.pointerEvents = 'auto';
            checkoutBtn.style.opacity = '1';
        }
    }
}

// Update clear cart button state
function updateClearCartButton() {
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.disabled = cart.length === 0;
    }
}

// Save cart to localStorage
function saveCart() {
    storage.set('freshHerbalCart', cart);
}

// Check cart before checkout
function checkCartBeforeCheckout() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja masih kosong', 'warning');
        return false;
    }
    return true;
}

// Load recommended products
function loadRecommendedProducts() {
    // Gunakan produk dari main.js jika tersedia
    if (typeof products !== 'undefined') {
        // Ambil 4 produk random sebagai rekomendasi
        recommendedProducts = [...products]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
    } else {
        // Fallback data
        recommendedProducts = [
            {
                id: 101,
                name: 'Teh Herbal Jahe',
                price: 35000,
                image: 'images/products/teh-jahe.jpg',
                category: 'Minuman'
            },
            {
                id: 102,
                name: 'Kapsul Temulawak',
                price: 55000,
                image: 'images/products/kapsul-temulawak.jpg',
                category: 'Suplemen'
            },
            {
                id: 103,
                name: 'Minyak Zaitun',
                price: 75000,
                image: 'images/products/minyak-zaitun.jpg',
                category: 'Minyak'
            },
            {
                id: 104,
                name: 'Serbuk Kunyit Asam',
                price: 25000,
                image: 'images/products/kunyit-asam.jpg',
                category: 'Bubuk'
            }
        ];
    }
    
    displayRecommendedProducts();
}

// Display recommended products
function displayRecommendedProducts() {
    const container = document.getElementById('recommendedProducts');
    
    if (!container) return;
    
    if (recommendedProducts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = recommendedProducts.map(product => `
        <div class="product-card">
            <img src="${product.image || 'images/placeholder.jpg'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='images/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category || 'Produk'}</p>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn btn-secondary">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button onclick="addToCartFromRecommendation(${product.id})" class="btn btn-primary">
                        <i class="fas fa-cart-plus"></i> Tambah
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to cart from recommendation
function addToCartFromRecommendation(productId) {
    const product = recommendedProducts.find(p => p.id === productId);
    
    if (product) {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
}

// View product detail (simulate)
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Setup event listeners
function setupEventListeners() {
    // Prevent form submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    });
    
    // Quantity input validation
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            let value = e.target.value;
            if (value === '' || parseInt(value) < 1) {
                e.target.value = 1;
            }
            if (parseInt(value) > 99) {
                e.target.value = 99;
            }
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('cartModal');
        if (e.target === modal) {
            closeModal('cartModal');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('cartModal');
        }
    });
}

// Show confirmation modal
function showConfirmModal(title, message, confirmCallback) {
    const modal = document.getElementById('cartModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    
    if (!modal || !modalMessage || !modalConfirmBtn) return;
    
    // Update modal content
    const modalTitle = modal.querySelector('h3');
    if (modalTitle) modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Set up confirm button
    modalConfirmBtn.onclick = function() {
        confirmCallback();
        closeModal('cartModal');
    };
    
    // Show modal
    modal.style.display = 'block';
}

// Export functions
window.loadCart = loadCart;
window.updateQuantity = updateQuantity;
window.validateQuantity = validateQuantity;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.addToCartFromRecommendation = addToCartFromRecommendation;
window.viewProduct = viewProduct;
window.checkCartBeforeCheckout = checkCartBeforeCheckout;
window.showConfirmModal = showConfirmModal;
