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
    const savedCart = localStorage.getItem('freshHerbalCart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    
    displayCartItems();
    updateCartSummary();
    updateCartCount();
    updateCheckoutButton();
    updateClearCartButton();
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cartItemsContainer');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Keranjang Belanja Kosong</h2>
                <p>Belum ada produk di keranjang belanja Anda. Mulai belanja dan tambahkan produk herbal favorit Anda!</p>
                <a href="catalog.html" class="btn btn-primary">
                    <i class="fas fa-store"></i> Mulai Belanja
                </a>
            </div>
        `;
        
        // Hide cart actions if cart is empty
        document.getElementById('cartActions').style.display = 'none';
        return;
    }
    
    // Show cart actions
    document.getElementById('cartActions').style.display = 'flex';
    
    // Display cart items
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <button class="cart-item-remove" onclick="removeItem(${item.id})" title="Hapus produk">
                <i class="fas fa-times"></i>
            </button>
            
            <img src="${item.image || 'https://via.placeholder.com/100x100?text=Herbal'}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='https://via.placeholder.com/100x100?text=Herbal'">
            
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                
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
                <span class="cart-item-total-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
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
        if (quantity >= 1 && quantity <= 99) {
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
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
            displayCartItems();
            updateCartSummary();
            updateCartCount();
            showNotification('Produk dihapus dari keranjang', 'success');
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
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div class="summary-item ${shipping === 0 ? 'free-shipping' : ''}">
            <span>Ongkos Kirim:</span>
            <span>${shipping === 0 ? 'GRATIS' : 'Rp 15.000'}</span>
        </div>
        <div class="summary-item total">
            <span>Total Pembayaran:</span>
            <span>Rp ${total.toLocaleString('id-ID')}</span>
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
                    <p>Tambah belanja Rp ${needed.toLocaleString('id-ID')} lagi untuk gratis ongkir</p>
                </div>
            `;
        }
    }
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// Update checkout button state
function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Keranjang Kosong';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Lanjut ke Pembayaran';
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
    localStorage.setItem('freshHerbalCart', JSON.stringify(cart));
}

// Load recommended products
function loadRecommendedProducts() {
    // Sample recommended products data
    recommendedProducts = [
        {
            id: 101,
            name: 'Teh Herbal Jahe',
            price: 35000,
            image: 'https://images.unsplash.com/photo-1567336273898-ebbf9eb3c3bf?auto=format&fit=crop&w=500',
            category: 'Minuman'
        },
        {
            id: 102,
            name: 'Kapsul Temulawak',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500',
            category: 'Suplemen'
        },
        {
            id: 103,
            name: 'Minyak Zaitun',
            price: 75000,
            image: 'https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&w=500',
            category: 'Minyak'
        },
        {
            id: 104,
            name: 'Serbuk Kunyit Asam',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1596040033221-a1f4f8a8c2a1?auto=format&fit=crop&w=500',
            category: 'Bubuk'
        }
    ];
    
    displayRecommendedProducts();
}

// Display recommended products
function displayRecommendedProducts() {
    const container = document.getElementById('recommendedProducts');
    
    if (!container) return;
    
    container.innerHTML = recommendedProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <div class="product-actions">
                    <button onclick="viewProductDetail(${product.id})" class="btn btn-secondary">
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
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        saveCart();
        displayCartItems();
        updateCartSummary();
        updateCartCount();
        
        showNotification(`${product.name} ditambahkan ke keranjang!`, 'success');
        
        // Scroll to top of cart items
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        if (cartItemsContainer) {
            cartItemsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// View product detail (simulate)
function viewProductDetail(productId) {
    // In a real app, this would redirect to product detail page
    alert(`Fitur detail produk untuk ID ${productId} akan membuka halaman detail produk.\n\nUntuk demo ini, Anda bisa menggunakan fitur "Tambah" untuk menambahkan ke keranjang.`);
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
            const value = e.target.value;
            if (value === '' || parseInt(value) < 1) {
                e.target.value = 1;
            }
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
    modal.querySelector('h3').textContent = title;
    modalMessage.textContent = message;
    
    // Set up confirm button
    modalConfirmBtn.onclick = function() {
        confirmCallback();
        closeModal('cartModal');
    };
    
    // Show modal
    modal.style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('cartModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal('cartModal');
    }
});

// Add to cart function (for external use)
window.addToCartFromCartPage = function(productId, quantity = 1) {
    // This function can be called from other pages
    updateQuantity(productId, 0, quantity);
};

// Export functions for use in other files
window.cartUtils = {
    getCart: () => cart,
    getCartTotal: () => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal >= 200000 ? 0 : 15000;
        return subtotal + shipping;
    },
    getCartItemCount: () => cart.reduce((total, item) => total + item.quantity, 0),
    clearCart: () => {
        cart = [];
        saveCart();
        displayCartItems();
        updateCartSummary();
        updateCartCount();
    }
};

// Add CSS for modal
const cartModalStyles = document.createElement('style');
cartModalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background-color: white;
        margin: 100px auto;
        padding: 0;
        width: 90%;
        max-width: 500px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        overflow: hidden;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #2e7d32, #4caf50);
        color: white;
    }
    
    .modal-header h3 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        padding: 5px;
        border-radius: 4px;
        transition: background-color 0.3s;
    }
    
    .modal-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    
    .modal-body {
        padding: 2rem;
    }
    
    .modal-body p {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #555;
        margin-bottom: 2rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .modal-actions .btn {
        min-width: 100px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    /* Responsive cart layout */
    .cart-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin: 2rem 0;
    }
    
    @media (max-width: 992px) {
        .cart-container {
            grid-template-columns: 1fr;
        }
        
        .cart-summary {
            position: static;
        }
    }
    
    /* Animation for cart updates */
    .cart-item {
        transition: all 0.3s ease;
    }
    
    .cart-item.removing {
        opacity: 0;
        transform: translateX(-100px);
    }
    
    .cart-item.updating {
        background-color: #f0f7f0;
    }
    
    /* Loading animation */
    .loading-cart {
        text-align: center;
        padding: 2rem;
    }
    
    .loading-cart .spinner {
        margin: 0 auto 1rem;
    }
`;
document.head.appendChild(cartModalStyles);