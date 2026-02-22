// Main JavaScript File for Fresh Herbal

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initCart();
    loadFeaturedProducts();
    initForms();
    updateCartCount();
    initScrollEffects();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            nav.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-nav') && !event.target.closest('.mobile-menu-btn')) {
                nav.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking on a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

// Cart Management
function initCart() {
    // Load cart from localStorage
    const savedCart = storage.get('freshHerbalCart', []);
    window.cart = savedCart;
}

function addToCart(product) {
    if (!product || !product.id) {
        showNotification('Produk tidak valid', 'error');
        return;
    }
    
    // Get current cart
    let cart = storage.get('freshHerbalCart', []);
    
    // Check if product already exists
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
        // Batasi maksimal 99
        if (existingItem.quantity > 99) existingItem.quantity = 99;
    } else {
        cart.push({
            id: product.id,
            name: product.name || 'Produk',
            price: product.price || 0,
            image: product.image || 'images/placeholder.jpg',
            quantity: product.quantity || 1
        });
    }
    
    // Save to localStorage
    storage.set('freshHerbalCart', cart);
    window.cart = cart;
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${product.name || 'Produk'} ditambahkan ke keranjang!`, 'success');
    
    // If we're on cart page, refresh cart display
    if (window.location.pathname.includes('cart.html')) {
        if (typeof loadCart === 'function') {
            loadCart();
        } else {
            window.location.reload();
        }
    }
}

function removeFromCart(productId) {
    let cart = storage.get('freshHerbalCart', []);
    cart = cart.filter(item => item.id !== productId);
    storage.set('freshHerbalCart', cart);
    window.cart = cart;
    updateCartCount();
    
    // If we're on cart page, refresh cart display
    if (window.location.pathname.includes('cart.html') && typeof loadCart === 'function') {
        loadCart();
    }
}

function updateCartCount() {
    const cart = storage.get('freshHerbalCart', []);
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}

function getCartTotal() {
    const cart = storage.get('freshHerbalCart', []);
    const subtotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
    const shipping = subtotal >= 200000 ? 0 : 15000;
    return {
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping,
        itemCount: cart.reduce((total, item) => total + (item.quantity || 0), 0)
    };
}

// Product Data
const products = [
    {
        id: 1,
        name: 'Madu Murni',
        price: 85000,
        image: 'BG 100gr .png',
        category: 'Madu',
        description: 'Madu murni dari bunga alami, tanpa bahan pengawet. Kaya akan antioksidan dan baik untuk kesehatan tubuh.',
        featured: true,
        stock: 50
    },
    {
        id: 2,
        name: 'Black Garlic',
        price: 45000,
        image: 'images/products/black-garlic.jpg',
        category: 'Rimpang',
        description: 'Bawang hitam hasil fermentasi alami. Kaya antioksidan, baik untuk kesehatan jantung dan meningkatkan stamina.',
        featured: true,
        stock: 35
    },
    {
        id: 3,
        name: 'Jahe Merah',
        price: 35000,
        image: 'images/products/jahe-merah.jpg',
        category: 'Rimpang',
        description: 'Jahe merah kualitas premium. Menghangatkan tubuh, meredakan masuk angin, dan meningkatkan imunitas.',
        featured: true,
        stock: 40
    },
    {
        id: 4,
        name: 'Kunyit Asam',
        price: 25000,
        image: 'images/products/kunyit-asam.jpg',
        category: 'Bubuk',
        description: 'Serbuk kunyit asam tradisional. Membantu melancarkan haid dan menjaga kesehatan pencernaan.',
        featured: true,
        stock: 60
    },
    {
        id: 5,
        name: 'Temulawak',
        price: 30000,
        image: 'images/products/temulawak.jpg',
        category: 'Rimpang',
        description: 'Temulawak segar untuk menjaga kesehatan hati dan meningkatkan nafsu makan.',
        featured: false,
        stock: 25
    },
    {
        id: 6,
        name: 'Sambiloto',
        price: 28000,
        image: 'images/products/sambiloto.jpg',
        category: 'Herbal',
        description: 'Daun sambiloto kering. Membantu menurunkan panas dan meningkatkan imunitas tubuh.',
        featured: false,
        stock: 30
    },
    {
        id: 7,
        name: 'Minyak Zaitun',
        price: 75000,
        image: 'images/products/minyak-zaitun.jpg',
        category: 'Minyak',
        description: 'Minyak zaitun extra virgin untuk kesehatan kulit dan masakan sehat.',
        featured: false,
        stock: 20
    },
    {
        id: 8,
        name: 'Teh Hijau',
        price: 22000,
        image: 'images/products/teh-hijau.jpg',
        category: 'Minuman',
        description: 'Teh hijau pilihan kaya antioksidan untuk kesehatan dan kesegaran tubuh.',
        featured: false,
        stock: 45
    }
];

// Load Featured Products
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    
    if (!featuredContainer) return;
    
    const featuredProducts = products.filter(product => product.featured);
    
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = '<p class="no-products">Tidak ada produk unggulan</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='images/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn btn-secondary">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button onclick="addToCartFromCard(${product.id})" class="btn btn-primary">
                        <i class="fas fa-cart-plus"></i> Beli
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// View Product Detail
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Add to Cart from Product Card
function addToCartFromCard(productId) {
    const product = products.find(p => p.id === productId);
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

// Form Handling
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                // Handle form submission based on form id
                if (this.id === 'checkoutForm') {
                    if (typeof processCheckout === 'function') {
                        processCheckout();
                    }
                } else {
                    // Default form submission
                    this.submit();
                }
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    inputs.forEach(input => {
        const value = input.value.trim();
        
        if (!value) {
            showFieldError(input, 'Field ini wajib diisi');
            isValid = false;
            return;
        }
        
        // Email validation
        if (input.type === 'email' && !isValidEmail(value)) {
            showFieldError(input, 'Format email tidak valid');
            isValid = false;
        }
        
        // Phone validation
        if (input.id === 'phone' && !isValidPhone(value)) {
            showFieldError(input, 'Nomor telepon harus 10-13 digit dan diawali 08');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    input.classList.add('error');
    
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Scroll effects
function initScrollEffects() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animate elements on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.product-card, .benefit-card, .section-title').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Export functions for use in other files
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.viewProduct = viewProduct;
window.addToCartFromCard = addToCartFromCard;
window.validateForm = validateForm;
window.formatCurrency = formatCurrency;
window.products = products;
