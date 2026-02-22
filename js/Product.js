// Products JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on product detail page
    if (window.location.pathname.includes('product-detail.html')) {
        loadProductDetail();
    }
    
    // Check if we're on catalog page
    if (window.location.pathname.includes('catalog.html')) {
        loadCatalogProducts();
        setupCatalogFilters();
    }
});

function loadProductDetail() {
    // Cek apakah products tersedia
    if (typeof products === 'undefined' || !Array.isArray(products)) {
        console.error('Products data tidak ditemukan');
        showNotification('Gagal memuat data produk', 'error');
        
        // Redirect ke catalog setelah 2 detik
        setTimeout(() => {
            window.location.href = 'catalog.html';
        }, 2000);
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Cek apakah ID valid
    if (isNaN(productId)) {
        showNotification('ID produk tidak valid', 'error');
        setTimeout(() => {
            window.location.href = 'catalog.html';
        }, 2000);
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Cek apakah element ada sebelum mengisi
        const nameEl = document.getElementById('productName');
        const priceEl = document.getElementById('productPrice');
        const descEl = document.getElementById('productDescription');
        const catEl = document.getElementById('productCategory');
        const imgEl = document.getElementById('mainImage');
        const stockEl = document.getElementById('productStock');
        
        if (nameEl) nameEl.textContent = product.name;
        if (priceEl) priceEl.textContent = formatCurrency(product.price);
        if (descEl) descEl.textContent = product.description || 'Deskripsi produk tidak tersedia';
        if (catEl) catEl.textContent = product.category || 'Umum';
        if (stockEl) {
            if (product.stock > 0) {
                stockEl.textContent = `Tersedia (${product.stock})`;
                stockEl.style.color = '#2e7d32';
            } else {
                stockEl.textContent = 'Stok Habis';
                stockEl.style.color = '#f44336';
                
                // Disable add to cart button if stock is 0
                const addBtn = document.getElementById('addToCartBtn');
                if (addBtn) {
                    addBtn.disabled = true;
                    addBtn.innerHTML = '<i class="fas fa-times"></i> Stok Habis';
                }
            }
        }
        if (imgEl) {
            imgEl.src = product.image || 'images/placeholder.jpg';
            imgEl.alt = product.name;
            imgEl.onerror = function() {
                this.src = 'images/placeholder.jpg';
            };
        }
        
        // Update page title
        document.title = `${product.name} - Fresh Herbal`;
    } else {
        // Product not found
        showNotification('Produk tidak ditemukan', 'error');
        setTimeout(() => {
            window.location.href = 'catalog.html';
        }, 2000);
    }
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let quantity = parseInt(quantityInput.value) || 1;
    quantity += change;
    
    // Validasi minimal 1, maksimal 99
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    
    quantityInput.value = quantity;
}

function addToCartFromDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
    
    // Cek ketersediaan produk
    if (typeof products === 'undefined') {
        showNotification('Gagal menambahkan ke keranjang', 'error');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Cek stok
        if (product.stock !== undefined && product.stock < quantity) {
            showNotification(`Stok tidak mencukupi. Sisa stok: ${product.stock}`, 'error');
            return;
        }
        
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    } else {
        showNotification('Produk tidak ditemukan', 'error');
    }
}

// Catalog Page Functions
function loadCatalogProducts(filteredProducts = null) {
    const container = document.getElementById('productsContainer');
    
    if (!container) return;
    
    // Gunakan products dari global scope
    let productsToShow = filteredProducts;
    if (productsToShow === null) {
        productsToShow = typeof products !== 'undefined' ? [...products] : [];
    }
    
    if (!productsToShow || productsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-3x"></i>
                <h3>Tidak ada produk</h3>
                <p>Tidak ada produk yang sesuai dengan filter yang dipilih</p>
                <button onclick="resetFilters()" class="btn btn-primary">Reset Filter</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <img src="${product.image || 'images/placeholder.jpg'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='images/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category || 'Umum'}</p>
                <p class="product-price">${formatCurrency(product.price || 0)}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn btn-secondary">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button onclick="addToCartFromCatalog(${product.id})" class="btn btn-primary">
                        <i class="fas fa-cart-plus"></i> Beli
                    </button>
                </div>
                ${product.stock !== undefined && product.stock < 5 ? 
                    `<span class="stock-warning">Sisa ${product.stock}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function addToCartFromCatalog(productId) {
    if (typeof products === 'undefined') return;
    
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

function setupCatalogFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    
    // Debounced filter function untuk performa
    const debouncedFilter = debounce(filterProducts, 300);
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debouncedFilter);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    if (typeof products === 'undefined') return;
    
    const category = document.getElementById('categoryFilter')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'name';
    
    let filtered = [...products];
    
    // Filter by category
    if (category) {
        filtered = filtered.filter(product => product.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(product => 
            (product.name || '').toLowerCase().includes(searchTerm) ||
            (product.description || '').toLowerCase().includes(searchTerm) ||
            (product.category || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort products
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'price-low':
                return (a.price || 0) - (b.price || 0);
            case 'price-high':
                return (b.price || 0) - (a.price || 0);
            default:
                return 0;
        }
    });
    
    loadCatalogProducts(filtered);
    
    // Update product count
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        productsCount.textContent = filtered.length;
    }
}

function resetFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) categoryFilter.value = '';
    if (searchInput) searchInput.value = '';
    if (sortFilter) sortFilter.value = 'name';
    
    filterProducts();
}

// Export functions
window.changeQuantity = changeQuantity;
window.addToCartFromDetail = addToCartFromDetail;
window.addToCartFromCatalog = addToCartFromCatalog;
window.filterProducts = filterProducts;
window.resetFilters = resetFilters;
