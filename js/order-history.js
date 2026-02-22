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

function getOrders() {
    return storage.get('freshHerbalOrders', []);
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
            (order.orderId || '').toLowerCase().includes(searchTerm) ||
            (order.customer?.name || '').toLowerCase().includes(searchTerm) ||
            order.items.some(item => 
                (item.name || '').toLowerCase().includes(searchTerm)
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
    
    if (ordersCount) {
        ordersCount.textContent = filteredOrders.length;
    }
    
    if (currentOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open fa-4x"></i>
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
                            <img src="${item.image || 'images/placeholder.jpg'}" 
                                 alt="${item.name}"
                                 onerror="this.src='images/placeholder.jpg'">
                            <span>${item.name} x${item.quantity}</span>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `<div class="more-items">+${order.items.length - 2} item lainnya</div>` : ''}
                </div>
                
                <div class="order-total-amount">
                    <span>Total:</span>
                    <strong>${formatCurrency(order.total || calculateOrderTotal(order.items))}</strong>
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
    
    let paginationHTML = '<div class="pagination-wrapper">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" class="page-btn prev-btn">
                <i class="fas fa-chevron-left"></i> Sebelumnya
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
            <button onclick="changePage(${currentPage + 1})" class="page-btn next-btn">
                Selanjutnya <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationHTML += '</div>';
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
    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }
    
    // Reset filters button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Enter key in search input
    const searchInput = document.getElementById('searchOrder');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // Real-time search (debounced)
    const debouncedSearch = debounce(applyFilters, 500);
    if (searchInput) {
        searchInput.addEventListener('input', debouncedSearch);
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchOrder');
    
    currentFilters.status = statusFilter ? statusFilter.value : '';
    currentFilters.date = dateFilter ? dateFilter.value : 'all';
    currentFilters.search = searchInput ? searchInput.value.trim() : '';
    
    currentPage = 1;
    loadOrderHistory();
}

function resetFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchOrder');
    
    if (statusFilter) statusFilter.value = '';
    if (dateFilter) dateFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    
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
        return total + (order.total || calculateOrderTotal(order.items));
    }, 0);
    
    const averageOrder = totalOrders > 0 ? Math.floor(totalSpent / totalOrders) : 0;
    
    const statTotal = document.getElementById('statTotal');
    const statSpent = document.getElementById('statSpent');
    const statAverage = document.getElementById('statAverage');
    
    if (statTotal) statTotal.textContent = totalOrders;
    if (statSpent) statSpent.textContent = formatCurrency(totalSpent);
    if (statAverage) statAverage.textContent = formatCurrency(averageOrder);
}

function viewOrderDetail(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
        showNotification('Pesanan tidak ditemukan!', 'error');
        return;
    }
    
    // Fill modal with order details
    const modalOrderId = document.getElementById('modalOrderId');
    const detailDate = document.getElementById('detailDate');
    const detailStatus = document.getElementById('detailStatus');
    const detailTotal = document.getElementById('detailTotal');
    const detailPayment = document.getElementById('detailPayment');
    const detailCustomerName = document.getElementById('detailCustomerName');
    const detailCustomerPhone = document.getElementById('detailCustomerPhone');
    const detailCustomerAddress = document.getElementById('detailCustomerAddress');
    const detailItems = document.getElementById('detailItems');
    
    if (modalOrderId) modalOrderId.textContent = order.orderId;
    if (detailDate) detailDate.textContent = formatDate(order.date);
    if (detailStatus) {
        detailStatus.innerHTML = `
            <span class="order-status status-${order.status}">
                ${getStatusText(order.status)}
            </span>
        `;
    }
    if (detailTotal) detailTotal.textContent = formatCurrency(order.total || calculateOrderTotal(order.items));
    if (detailPayment) detailPayment.textContent = getPaymentMethodText(order.payment);
    
    // Customer info
    if (detailCustomerName) detailCustomerName.textContent = order.customer?.name || 'Tidak tersedia';
    if (detailCustomerPhone) detailCustomerPhone.textContent = order.customer?.phone || 'Tidak tersedia';
    if (detailCustomerAddress) detailCustomerAddress.textContent = order.customer?.address || 'Tidak tersedia';
    
    // Order items
    if (detailItems) {
        detailItems.innerHTML = order.items.map(item => `
            <div class="detail-item-row">
                <img src="${item.image || 'images/placeholder.jpg'}" 
                     alt="${item.name}" 
                     class="detail-item-image"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="detail-item-info">
                    <div class="detail-item-name">${item.name}</div>
                    <div class="detail-item-meta">
                        <span>${item.quantity} x ${formatCurrency(item.price)}</span>
                        <span class="detail-item-total">
                            ${formatCurrency(item.price * item.quantity)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Show modal
    openModal('orderDetailModal');
}

function cancelOrder(orderId) {
    showConfirmModal(
        'Batalkan Pesanan',
        'Apakah Anda yakin ingin membatalkan pesanan ini?',
        function() {
            const orders = getOrders();
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = 'cancelled';
                storage.set('freshHerbalOrders', orders);
                
                showNotification('Pesanan berhasil dibatalkan!', 'success');
                loadOrderHistory();
            }
        }
    );
}

function confirmReceipt(orderId) {
    showConfirmModal(
        'Konfirmasi Penerimaan',
        'Konfirmasi bahwa Anda telah menerima pesanan ini?',
        function() {
            const orders = getOrders();
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = 'completed';
                storage.set('freshHerbalOrders', orders);
                
                showNotification('Terima kasih! Pesanan telah diselesaikan.', 'success');
                loadOrderHistory();
            }
        }
    );
}

function reorder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        // Add all items to cart
        order.items.forEach(item => {
            addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity
            });
        });
        
        showNotification('Produk telah ditambahkan ke keranjang!', 'success');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1500);
    }
}

function printOrder() {
    const orderId = document.getElementById('modalOrderId')?.textContent;
    if (!orderId) return;
    
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) return;
    
    // Create printable content
    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2e7d32; text-align: center;">Fresh Herbal</h1>
            <p style="text-align: center;">Invoice Pesanan</p>
            
            <hr>
            
            <h2>Order ID: ${order.orderId}</h2>
            <p><strong>Tanggal:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> ${getStatusText(order.status)}</p>
            
            <h3>Informasi Pelanggan:</h3>
            <p><strong>Nama:</strong> ${order.customer?.name || '-'}</p>
            <p><strong>Telepon:</strong> ${order.customer?.phone || '-'}</p>
            <p><strong>Alamat:</strong> ${order.customer?.address || '-'}</p>
            
            <h3>Item Pesanan:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="padding: 10px; text-align: left;">Produk</th>
                        <th style="padding: 10px; text-align: center;">Jumlah</th>
                        <th style="padding: 10px; text-align: right;">Harga</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td style="padding: 10px;">${item.name}</td>
                            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                            <td style="padding: 10px; text-align: right;">${formatCurrency(item.price)}</td>
                            <td style="padding: 10px; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                        <td style="padding: 10px; text-align: right;">${formatCurrency(order.subtotal || calculateOrderTotal(order.items))}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right;"><strong>Ongkos Kirim:</strong></td>
                        <td style="padding: 10px; text-align: right;">${order.shipping === 0 ? 'Gratis' : 'Rp 15.000'}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                        <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(order.total || (order.subtotal + order.shipping))}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <hr>
            
            <p style="text-align: center;">Terima kasih telah berbelanja di Fresh Herbal</p>
            <p style="text-align: center;">www.freshherbal.com</p>
        </div>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice ${order.orderId}</title>
                <style>
                    @media print {
                        body { font-family: Arial, sans-serif; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function trackOrder() {
    showNotification('Fitur pelacakan pengiriman akan segera tersedia!', 'info');
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

// Add CSS for order history
(function addOrderHistoryStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 1.5rem;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .order-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .order-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background-color: #f9f9f9;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .order-id strong {
            font-size: 1.1rem;
            color: #2e7d32;
        }
        
        .order-id small {
            display: block;
            color: #666;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        }
        
        .order-status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .order-status-badge.status-pending {
            background-color: #fff3e0;
            color: #e65100;
        }
        
        .order-status-badge.status-processing {
            background-color: #e3f2fd;
            color: #1565c0;
        }
        
        .order-status-badge.status-shipped {
            background-color: #e8f5e8;
            color: #2e7d32;
        }
        
        .order-status-badge.status-completed {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        
        .order-status-badge.status-cancelled {
            background-color: #ffebee;
            color: #c62828;
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
            flex-wrap: wrap;
        }
        
        .preview-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #f5f5f5;
            padding: 0.5rem 1rem;
            border-radius: 50px;
        }
        
        .preview-item img {
            width: 30px;
            height: 30px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .more-items {
            color: #666;
            font-size: 0.9rem;
            background: #f5f5f5;
            padding: 0.5rem 1rem;
            border-radius: 50px;
        }
        
        .order-total-amount {
            text-align: right;
        }
        
        .order-total-amount span {
            display: block;
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }
        
        .order-card-footer {
            padding: 1rem 1.5rem;
            background-color: #f9f9f9;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
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
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
        
        .pagination-wrapper {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .page-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.9rem;
        }
        
        .page-btn:hover {
            background-color: #f5f5f5;
            border-color: #4caf50;
        }
        
        .page-btn.active {
            background-color: #2e7d32;
            color: white;
            border-color: #2e7d32;
        }
        
        .page-btn.prev-btn,
        .page-btn.next-btn {
            background-color: #f0f0f0;
        }
        
        .order-statistics {
            margin-top: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stat-card h4 {
            color: #2e7d32;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
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
            border-radius: 8px;
        }
        
        .detail-item-info {
            flex: 1;
        }
        
        .detail-item-name {
            font-weight: 500;
            margin-bottom: 0.25rem;
            color: #333;
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
                justify-content: center;
            }
            
            .order-detail-grid {
                grid-template-columns: 1fr;
            }
            
            .order-actions {
                flex-direction: column;
            }
            
            .detail-item-row {
                flex-direction: column;
                text-align: center;
            }
            
            .detail-item-meta {
                flex-direction: column;
                gap: 0.5rem;
                align-items: center;
            }
        }
    `;
    document.head.appendChild(style);
})();

// Export functions
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.changePage = changePage;
window.viewOrderDetail = viewOrderDetail;
window.cancelOrder = cancelOrder;
window.confirmReceipt = confirmReceipt;
window.reorder = reorder;
window.printOrder = printOrder;
window.trackOrder = trackOrder;
window.showConfirmModal = showConfirmModal;
