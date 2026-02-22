// main.js - Fungsi utama untuk seluruh website

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.main-nav') && !event.target.closest('.mobile-menu-btn')) {
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
});

// Cart Functions
function getCart() {
    return JSON.parse(localStorage.getItem('freshHerbalCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('freshHerbalCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}

function addToCart(product) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: product.quantity || 1
        });
    }
    
    saveCart(cart);
    showNotification(`${product.name} ditambahkan ke keranjang!`, 'success');
    
    // Refresh cart page if open
    if (window.location.pathname.includes('cart.html')) {
        if (typeof loadCartItems === 'function') {
            loadCartItems();
        }
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    showNotification('Produk dihapus dari keranjang', 'info');
    
    // Refresh cart page if open
    if (window.location.pathname.includes('cart.html')) {
        if (typeof loadCartItems === 'function') {
            loadCartItems();
        }
    }
}

function updateCartItemQuantity(productId, newQuantity) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            item.quantity = newQuantity;
        }
        saveCart(cart);
        
        // Refresh cart page if open
        if (window.location.pathname.includes('cart.html')) {
            if (typeof loadCartItems === 'function') {
                loadCartItems();
            }
        }
    }
}

function getCartTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    const shipping = subtotal >= 200000 ? 0 : 15000;
    
    return {
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping
    };
}

function clearCart() {
    localStorage.removeItem('freshHerbalCart');
    updateCartCount();
    showNotification('Keranjang belanja telah dikosongkan', 'info');
    
    if (window.location.pathname.includes('cart.html')) {
        if (typeof loadCartItems === 'function') {
            loadCartItems();
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3',
        warning: '#ff9800'
    };
    
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Form Validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showError(input, 'Field ini wajib diisi');
            isValid = false;
        } else {
            clearError(input);
            
            // Email validation
            if (input.type === 'email' && !isValidEmail(input.value)) {
                showError(input, 'Format email tidak valid');
                isValid = false;
            }
            
            // Phone validation
            if (input.type === 'tel' && !isValidPhone(input.value)) {
                showError(input, 'Format nomor telepon tidak valid');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9+\-\s]{10,15}$/.test(phone);
}

function showError(input, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    let errorElement = formGroup.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    input.classList.add('error');
}

function clearError(input) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    input.classList.remove('error');
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Add global styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error {
        border-color: #f44336 !important;
    }
    
    .error-message {
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        font-weight: 400;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        opacity: 0.8;
        transition: opacity 0.3s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .main-nav.active {
        display: block;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 1rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .main-nav.active ul {
        flex-direction: column;
        gap: 1rem;
    }
`;

document.head.appendChild(style);

// Export functions to global scope
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getCartTotal = getCartTotal;
window.clearCart = clearCart;
window.showNotification = showNotification;
window.validateForm = validateForm;
window.formatCurrency = formatCurrency;
