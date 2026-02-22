// products.js - Data produk dan fungsi terkait produk

// Data Produk Fresh Herbal
const products = [
    {
        id: 1,
        name: "Black Garlic Premium",
        price: 85000,
        category: "Suplemen",
        categorySlug: "suplemen",
        image: "images/products/black-garlic.jpg",
        description: "Bawang hitam fermentasi kaya antioksidan untuk menjaga kesehatan jantung dan imunitas tubuh. Diproses melalui fermentasi alami selama 60 hari tanpa bahan pengawet.",
        benefits: [
            "Meningkatkan sistem imun",
            "Menjaga kesehatan jantung",
            "Kaya antioksidan",
            "Menurunkan kolesterol"
        ],
        stock: 50,
        weight: 250, // gram
        rating: 4.8,
        sold: 1250
    },
    {
        id: 2,
        name: "Jahe Merah Instan",
        price: 45000,
        category: "Minuman Herbal",
        categorySlug: "minuman",
        image: "images/products/jahe-merah.jpg",
        description: "Minuman jahe merah alami untuk menghangatkan tubuh dan meningkatkan daya tahan tubuh. Dibuat dari jahe merah pilihan tanpa campuran gula buatan.",
        benefits: [
            "Menghangatkan tubuh",
            "Meredakan masuk angin",
            "Meningkatkan metabolisme",
            "Anti-inflamasi"
        ],
        stock: 100,
        weight: 200,
        rating: 4.7,
        sold: 850
    },
    {
        id: 3,
        name: "Madu Hitam Pahit",
        price: 95000,
        category: "Madu Herbal",
        categorySlug: "madu",
        image: "images/products/madu-hitam.jpg",
        description: "Madu hitam dengan khasiat untuk mengatasi asam urat, diabetes, dan kolesterol. Kombinasi madu hutan dengan ekstrak herbal pilihan.",
        benefits: [
            "Mengatasi asam urat",
            "Membantu diabetes",
            "Menurunkan kolesterol",
            "Meningkatkan stamina"
        ],
        stock: 75,
        weight: 350,
        rating: 4.9,
        sold: 2100
    },
    {
        id: 4,
        name: "Kunyit Putih Kapsul",
        price: 65000,
        category: "Herbal Kapsul",
        categorySlug: "kapsul",
        image: "images/products/kunyit-putih.jpg",
        description: "Ekstrak kunyit putih dalam kemasan kapsul untuk kesehatan pencernaan dan anti-inflamasi. Mudah dikonsumsi dan sudah teruji secara klinis.",
        benefits: [
            "Menjaga pencernaan",
            "Anti-inflamasi",
            "Detoksifikasi",
            "Meningkatkan nafsu makan"
        ],
        stock: 60,
        weight: 100,
        rating: 4.6,
        sold: 450
    },
    {
        id: 5,
        name: "Sambiloto Extract",
        price: 55000,
        category: "Herbal Kapsul",
        categorySlug: "kapsul",
        image: "images/products/sambiloto.jpg",
        description: "Ekstrak sambiloto untuk membantu mengatasi diabetes dan meningkatkan imunitas. Tanaman herbal dengan kandungan andrografolida yang tinggi.",
        benefits: [
            "Membantu diabetes",
            "Meningkatkan imunitas",
            "Anti-bakteri",
            "Menurunkan demam"
        ],
        stock: 85,
        weight: 100,
        rating: 4.7,
        sold: 680
    },
    {
        id: 6,
        name: "Teh Rosella",
        price: 35000,
        category: "Teh Herbal",
        categorySlug: "teh",
        image: "images/products/rosella.jpg",
        description: "Teh bunga rosella kaya vitamin C dan antioksidan untuk kesehatan. Bunga rosella merah pilihan yang dikeringkan secara alami.",
        benefits: [
            "Kaya vitamin C",
            "Antioksidan tinggi",
            "Menurunkan tekanan darah",
            "Menjaga kesehatan kulit"
        ],
        stock: 120,
        weight: 100,
        rating: 4.5,
        sold: 920
    },
    {
        id: 7,
        name: "Minyak Herba Tawon",
        price: 75000,
        category: "Minyak Herbal",
        categorySlug: "minyak",
        image: "images/products/minyak-tawon.jpg",
        description: "Minyak herbal untuk meredakan nyeri sendi, pegal linu, dan masuk angin. Formula tradisional dengan tambahan minyak tawon asli.",
        benefits: [
            "Meredakan nyeri sendi",
            "Menghangatkan tubuh",
            "Mengatasi pegal linu",
            "Meredakan masuk angin"
        ],
        stock: 90,
        weight: 60,
        rating: 4.8,
        sold: 1500
    },
    {
        id: 8,
        name: "Sirih Merah Kapsul",
        price: 60000,
        category: "Herbal Kapsul",
        categorySlug: "kapsul",
        image: "images/products/sirih-merah.jpg",
        description: "Ekstrak daun sirih merah untuk kesehatan kewanitaan dan antioksidan. Membantu mengatasi berbagai masalah kewanitaan secara alami.",
        benefits: [
            "Kesehatan kewanitaan",
            "Antioksidan",
            "Anti-bakteri",
            "Mengatasi keputihan"
        ],
        stock: 55,
        weight: 100,
        rating: 4.7,
        sold: 430
    }
];

// Fungsi untuk mendapatkan semua produk
function getAllProducts() {
    return products;
}

// Fungsi untuk mendapatkan produk berdasarkan ID
function getProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

// Fungsi untuk mendapatkan produk berdasarkan kategori
function getProductsByCategory(category) {
    return products.filter(p => p.categorySlug === category);
}

// Fungsi untuk mendapatkan produk unggulan
function getFeaturedProducts(limit = 3) {
    // Urutkan berdasarkan produk terlaris
    return [...products]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, limit);
}

// Fungsi untuk mencari produk
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
}

// Fungsi untuk mendapatkan semua kategori unik
function getCategories() {
    const categories = products.map(p => ({
        name: p.category,
        slug: p.categorySlug
    }));
    
    // Hapus duplikat
    return categories.filter((cat, index, self) => 
        index === self.findIndex(c => c.slug === cat.slug)
    );
}

// Load produk di halaman utama
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    const featuredProducts = getFeaturedProducts(3);
    
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card" data-aos="fade-up">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image"
                     onerror="this.src='images/placeholder.jpg'">
                <span class="product-badge">Terlaris</span>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <span>${product.rating}</span>
                    <span class="product-sold">| Terjual ${product.sold}</span>
                </div>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn btn-secondary btn-sm">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button onclick="addToCartFromProduct(${product.id})" class="btn btn-primary btn-sm">
                        <i class="fas fa-cart-plus"></i> Beli
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load produk di halaman katalog
function loadCatalogProducts(filteredProducts = products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>Produk tidak ditemukan</h3>
                <p>Maaf, tidak ada produk yang sesuai dengan pencarian Anda.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image"
                     onerror="this.src='images/placeholder.jpg'">
                ${product.stock < 10 ? '<span class="product-badge product-badge-warning">Stok Terbatas</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <span>${product.rating}</span>
                    <span class="product-sold">| Terjual ${product.sold}</span>
                </div>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn btn-secondary">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button onclick="addToCartFromProduct(${product.id})" class="btn btn-primary">
                        <i class="fas fa-cart-plus"></i> Beli
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup filter katalog
function setupCatalogFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        // Load categories
        const categories = getCategories();
        categoryFilter.innerHTML = '<option value="">Semua Kategori</option>' +
            categories.map(cat => `<option value="${cat.slug}">${cat.name}</option>`).join('');
        
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 500));
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }
}

// Filter produk di katalog
function filterProducts() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'popular';
    
    let filtered = products;
    
    if (category) {
        filtered = filtered.filter(p => p.categorySlug === category);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sorting
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'popular':
                return b.sold - a.sold;
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });
    
    loadCatalogProducts(filtered);
    
    // Update hasil count
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = `${filtered.length} produk ditemukan`;
    }
}

// Load detail produk
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    const product = getProductById(productId);
    
    if (!product) {
        window.location.href = 'catalog.html';
        return;
    }
    
    // Set product details
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('mainImage').src = product.image;
    document.getElementById('mainImage').alt = product.name;
    
    // Set product meta
    document.getElementById('productRating').innerHTML = `
        <i class="fas fa-star"></i> ${product.rating} | Terjual ${product.sold}
    `;
    
    document.getElementById('productStock').innerHTML = `
        <i class="fas fa-box"></i> Stok: ${product.stock}
    `;
    
    document.getElementById('productWeight').innerHTML = `
        <i class="fas fa-weight-hanging"></i> Berat: ${product.weight} gr
    `;
    
    // Load benefits
    const benefitsList = document.getElementById('productBenefits');
    if (benefitsList) {
        benefitsList.innerHTML = product.benefits.map(benefit => `
            <li><i class="fas fa-check-circle"></i> ${benefit}</li>
        `).join('');
    }
}

// Helper functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function addToCartFromProduct(productId) {
    const product = getProductById(productId);
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

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    let quantity = parseInt(quantityInput.value) || 1;
    quantity += change;
    
    if (quantity < 1) quantity = 1;
    
    const maxStock = parseInt(quantityInput.max);
    if (maxStock && quantity > maxStock) quantity = maxStock;
    
    quantityInput.value = quantity;
}

function addToCartFromDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
    
    const product = getProductById(productId);
    
    if (product) {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load featured products on home page
    loadFeaturedProducts();
    
    // Load catalog products if on catalog page
    if (window.location.pathname.includes('catalog.html')) {
        loadCatalogProducts();
        setupCatalogFilters();
    }
    
    // Load product detail if on product detail page
    if (window.location.pathname.includes('product-detail.html')) {
        loadProductDetail();
    }
});

// Export functions to global scope
window.getAllProducts = getAllProducts;
window.getProductById = getProductById;
window.getProductsByCategory = getProductsByCategory;
window.getFeaturedProducts = getFeaturedProducts;
window.searchProducts = searchProducts;
window.getCategories = getCategories;
window.loadFeaturedProducts = loadFeaturedProducts;
window.loadCatalogProducts = loadCatalogProducts;
window.loadProductDetail = loadProductDetail;
window.addToCartFromProduct = addToCartFromProduct;
window.addToCartFromDetail = addToCartFromDetail;
window.viewProduct = viewProduct;
window.changeQuantity = changeQuantity;
window.filterProducts = filterProducts;
window.setupCatalogFilters = setupCatalogFilters;
window.debounce = debounce;
