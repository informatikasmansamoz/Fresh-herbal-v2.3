// Order History JavaScript

let currentPage = 1;
const ordersPerPage = 5;
let filteredOrders = [];
let currentFilters = {
    status: '',
    date: 'all',
    search: ''
};

document.addEventListener('DOMContentLoaded', function() {
    loadOrderHistory();
    setupEventListeners();
});

function loadOrderHistory() {
    const allOrders = getOrders();
    filteredOrders = applyFiltersToOrders(allOrders);
    
    displayOrders();
    updateOrderStatistics(allOrders);
    setupPagination();
}

function applyFiltersToOrders(orders) {
    let filtered = [...orders];
    
    // Filter by status
    if (currentFilters.status) {
        filtered = filtered.filter(order => order.status === currentFilters.status);
    }
    
    // Filter by date
    if (currentFilters.date && currentFilters.date !== 'all') {
        const now = new Date();
        let cutoffDate;
        
        switch(currentFilters.date) {
            case '7days':
                cutoffDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                cutoffDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '3months':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '2024':
                cutoffDate = new Date('2024-01-01');
                break;
        }
        
        if (cutoffDate) {
            filtered = filtered.filter(order => new Date(order.date) >= cutoffDate);
        }
    }
    
    // Filter by search term
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(order => 
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.items.some(item => 
                item.name.toLowerCase().includes(searchTerm)
            )
        );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const ordersCount = document.getElementById('ordersCount');
    
    if (!ordersList) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);
    
    ordersCount.textContent = filteredOrders.length;
    
    if (currentOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open fa-3x"></i>
                <h3>Tidak ada pesanan</h3>
                <p>${filteredOrders.length === 0 ? 'Anda belum memiliki pesanan' : 'Tidak ada pesanan yang sesuai dengan filter'}</p>
                ${filteredOrders.length === 0 ? '<a href="catalog.html" class="btn btn-primary">Mulai Belanja</a>' : ''}
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = currentOrders.map(order => `
        <div class="order-card" data-order-id="${order.orderId}">
            <div class="order-card-header">
                <div class="order-id">
                    <strong>${order.orderId}</strong>
                    <small>${formatDate(order.date)}</small>
                </div>
                <div class="order-status-badge status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            
            <div class="order-card-body">
                <div class="order-items-preview">
                    ${order.items.slice(0, 2).map(item => `
                        <div class="preview-item">
                            <img src="${item.image || 'images/default-product.jpg'}" alt="${item.name}">
                            <span>${item.name} x${item.quantity}</span>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `<div class="more-items">+${order.items.length - 2} item lainnya</div>` : ''}
                </div>
                
                <div class="order-total-amount">
                    <span>Total:</span>
                    <strong>Rp ${calculateOrderTotal(order.items).toLocaleString('id-ID')}</strong>
                </div>
            </div>
            
            <div class="order-card-footer">
                <button onclick="viewOrderDetail('${order.orderId}')" class="btn btn-secondary btn-sm">
                    <i class="fas fa-eye"></i> Lihat Detail
                </button>
                
                ${order.status === 'pending' ? `
                    <button onclick="cancelOrder('${order.orderId}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-times"></i> Batalkan
                    </button>
                ` : ''}
                
                ${order.status === 'shipped' ? `
                    <button onclick="confirmReceipt('${order.orderId}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-check"></i> Terima Pesanan
                    </button>
                ` : ''}
                
                ${order.status === 'completed' ? `
                    <button onclick="reorder('${order.orderId}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-redo"></i> Pesan Lagi
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function setupPagination() {
    const pagination = document.getElementById('pagination');
    
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" class="page-btn">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" class="page-btn">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    displayOrders();
    setupPagination();
    
    // Scroll to top of orders list
    const ordersList = document.getElementById('ordersList');
    if (ordersList) {
        ordersList.scrollIntoView({ behavior: 'smooth' });
    }
}

function setupEventListeners() {
    // Apply filters button
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    
    // Reset filters button
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    
    // Enter key in search input
    document.getElementById('searchOrder')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Real-time search (optional)
    document.getElementById('searchOrder')?.addEventListener('input', function() {
        if (this.value.length === 0 || this.value.length > 2) {
            applyFilters();
        }
    });
}

function applyFilters() {
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.date = document.getElementById('dateFilter').value;
    currentFilters.search = document.getElementById('searchOrder').value.trim();
    
    currentPage = 1;
    loadOrderHistory();
}

function resetFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('searchOrder').value = '';
    
    currentFilters = {
        status: '',
        date: 'all',
        search: ''
    };
    
    currentPage = 1;
    loadOrderHistory();
}

function updateOrderStatistics(allOrders) {
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(order => order.status === 'completed');
    
    const totalSpent = completedOrders.reduce((total, order) => {
        return total + calculateOrderTotal(order.items);
    }, 0);
    
    const averageOrder = totalOrders > 0 ? Math.floor(totalSpent / totalOrders) : 0;
    
    document.getElementById('statTotal').textContent = totalOrders;
    document.getElementById('statSpent').textContent = `Rp ${totalSpent.toLocaleString('id-ID')}`;
    document.getElementById('statAverage').textContent = `Rp ${averageOrder.toLocaleString('id-ID')}`;
}

function viewOrderDetail(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
        showNotification('Pesanan tidak ditemukan!', 'error');
        return;
    }
    
    // Fill modal with order details
    document.getElementById('modalOrderId').textContent = order.orderId;
    document.getElementById('detailDate').textContent = formatDate(order.date);
    document.getElementById('detailStatus').innerHTML = `
        <span class="order-status status-${order.status}">
            ${getStatusText(order.status)}
        </span>
    `;
    document.getElementById('detailTotal').textContent = `Rp ${calculateOrderTotal(order.items).toLocaleString('id-ID')}`;
    document.getElementById('detailPayment').textContent = getPaymentMethodText(order.payment);
    
    // Customer info
    document.getElementById('detailCustomerName').textContent = order.customer?.name || 'Tidak tersedia';
    document.getElementById('detailCustomerPhone').textContent = order.customer?.phone || 'Tidak tersedia';
    document.getElementById('detailCustomerAddress').textContent = order.customer?.address || 'Tidak tersedia';
    
    // Order items
    const detailItems = document.getElementById('detailItems');
    detailItems.innerHTML = order.items.map(item => `
        <div class="detail-item-row">
            <img src="${item.image || 'images/default-product.jpg'}" alt="${item.name}" class="detail-item-image">
            <div class="detail-item-info">
                <div class="detail-item-name">${item.name}</div>
                <div class="detail-item-meta">
                    <span>${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
                    <span class="detail-item-total">
                        Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Show modal
    document.getElementById('orderDetailModal').style.display = 'block';
}

function getPaymentMethodText(method) {
    const methods = {
        'transfer': 'Transfer Bank',
        'cod': 'Cash on Delivery (COD)',
        'ewallet': 'E-Wallet'
    };
    
    return methods[method] || method;
}

function cancelOrder(orderId) {
    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
        const orders = getOrders();
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'cancelled';
            localStorage.setItem('freshHerbalOrders', JSON.stringify(orders));
            
            showNotification('Pesanan berhasil dibatalkan!', 'success');
            loadOrderHistory();
        }
    }
}

function confirmReceipt(orderId) {
    if (confirm('Konfirmasi bahwa Anda telah menerima pesanan ini?')) {
        const orders = getOrders();
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'completed';
            localStorage.setItem('freshHerbalOrders', JSON.stringify(orders));
            
            showNotification('Terima kasih! Pesanan telah diselesaikan.', 'success');
            loadOrderHistory();
        }
    }
}

function reorder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        // Add all items to cart
        order.items.forEach(item => {
            addToCart({
                ...item,
                quantity: item.quantity
            });
        });
        
        showNotification('Produk telah ditambahkan ke keranjang!', 'success');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1000);
    }
}

function printOrder() {
    const printContent = document.querySelector('.order-detail-grid').outerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <html>
            <head>
                <title>Invoice ${document.getElementById('modalOrderId').textContent}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { color: #2e7d32; }
                    .detail-item { margin: 10px 0; }
                    .detail-label { font-weight: bold; }
                    .detail-item-row { border-bottom: 1px solid #ddd; padding: 10px 0; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h2>Invoice: ${document.getElementById('modalOrderId').textContent}</h2>
                ${printContent}
                <button onclick="window.close()" class="no-print">Tutup</button>
            </body>
        </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    loadOrderHistory(); // Reload to restore event listeners
}

function trackOrder() {
    alert('Fitur pelacakan pengiriman akan segera tersedia!');
}

// Add CSS for order history
const orderHistoryStyles = document.createElement('style');
orderHistoryStyles.textContent = `
    .filters-section {
        background-color: #f5f5f5;
        padding: 1.5rem 0;
        margin-bottom: 2rem;
    }
    
    .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-end;
    }
    
    .filter-group {
        flex: 1;
        min-width: 200px;
    }
    
    .filter-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #666;
    }
    
    .filter-group select,
    .filter-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: 'Poppins', sans-serif;
    }
    
    .orders-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e0e0e0;
    }
    
    .orders-count {
        color: #666;
        font-size: 0.9rem;
    }
    
    .orders-count span {
        font-weight: 600;
        color: #2e7d32;
    }
    
    .order-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        overflow: hidden;
    }
    
    .order-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background-color: #f9f9f9;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .order-id small {
        display: block;
        color: #666;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
    
    .order-card-body {
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .order-items-preview {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    
    .preview-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .preview-item img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .more-items {
        color: #666;
        font-size: 0.9rem;
    }
    
    .order-total-amount {
        text-align: right;
    }
    
    .order-total-amount span {
        display: block;
        color: #666;
        font-size: 0.9rem;
    }
    
    .order-card-footer {
        padding: 1rem 1.5rem;
        background-color: #f9f9f9;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    
    .btn-danger {
        background-color: #dc3545;
        color: white;
    }
    
    .btn-danger:hover {
        background-color: #c82333;
    }
    
    .empty-orders {
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .empty-orders i {
        color: #e0e0e0;
        margin-bottom: 1rem;
    }
    
    .empty-orders h3 {
        margin-bottom: 0.5rem;
        color: #666;
    }
    
    .empty-orders p {
        color: #999;
        margin-bottom: 1.5rem;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 2rem;
    }
    
    .page-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .page-btn:hover {
        background-color: #f5f5f5;
    }
    
    .page-btn.active {
        background-color: #2e7d32;
        color: white;
        border-color: #2e7d32;
    }
    
    .order-statistics {
        margin-top: 2rem;
    }
    
    .stat-items {
        margin-top: 1rem;
    }
    
    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .stat-item:last-child {
        border-bottom: none;
    }
    
    .stat-label {
        color: #666;
    }
    
    .stat-value {
        font-weight: 600;
        color: #2e7d32;
    }
    
    .modal-lg {
        max-width: 800px;
    }
    
    .order-detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .order-info-section,
    .customer-info-section {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
    }
    
    .order-items-section {
        grid-column: 1 / -1;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
    }
    
    .detail-item:last-child {
        margin-bottom: 0;
    }
    
    .detail-label {
        color: #666;
        font-weight: 500;
    }
    
    .detail-value {
        font-weight: 600;
        color: #333;
    }
    
    .detail-item-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .detail-item-row:last-child {
        border-bottom: none;
    }
    
    .detail-item-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .detail-item-info {
        flex: 1;
    }
    
    .detail-item-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
    }
    
    .detail-item-meta {
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 0.9rem;
    }
    
    .detail-item-total {
        font-weight: 600;
        color: #2e7d32;
    }
    
    .order-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        border-top: 1px solid #e0e0e0;
        padding-top: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .filters {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-group {
            min-width: 100%;
        }
        
        .order-card-body {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }
        
        .order-total-amount {
            text-align: left;
        }
        
        .order-card-footer {
            flex-wrap: wrap;
        }
        
        .order-detail-grid {
            grid-template-columns: 1fr;
        }
        
        .order-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(orderHistoryStyles);