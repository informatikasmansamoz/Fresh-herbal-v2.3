// Product Detail JavaScript

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
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productPrice').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productCategory').textContent = product.category;
        document.getElementById('mainImage').src = product.image;
        document.getElementById('mainImage').alt = product.name;
    } else {
        // Product not found
        window.location.href = 'catalog.html';
    }
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let quantity = parseInt(quantityInput.value);
    quantity += change;
    
    if (quantity < 1) quantity = 1;
    quantityInput.value = quantity;
}

function addToCartFromDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const quantity = parseInt(document.getElementById('quantity').value);
    
    const product = products.find(p => p.id === productId);
    
    if (product) {
        addToCart({
            ...product,
            quantity: quantity
        });
    }
}

// Catalog Page Functions
function loadCatalogProducts(filteredProducts = products) {
    const container = document.getElementById('productsContainer');
    
    if (!container) return;
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn btn-secondary">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button onclick="addToCart(${product.id})" class="btn btn-primary">
                        <i class="fas fa-cart-plus"></i> Beli
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupCatalogFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'name';
    
    let filtered = products;
    
    // Filter by category
    if (category) {
        filtered = filtered.filter(product => product.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort products
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            default:
                return 0;
        }
    });
    
    loadCatalogProducts(filtered);
}