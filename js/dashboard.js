// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setupDashboardEvents();
});

function loadDashboardData() {
    // Load user data
    loadUserData();
    
    // Load order statistics
    loadOrderStatistics();
    
    // Load recent orders
    loadRecentOrders();
}

function loadUserData() {
    const userData = getUserData();
    
    document.getElementById('userName').textContent = userData.name || 'Pelanggan';
    document.getElementById('userFullName').textContent = userData.name || 'Pelanggan Fresh Herbal';
    document.getElementById('userEmail').textContent = userData.email || 'customer@example.com';
    document.getElementById('userPhone').textContent = userData.phone || '081234567890';
    document.getElementById('userAddress').textContent = userData.address || 'Jl. Contoh No. 123, Jakarta';
    document.getElementById('memberSince').textContent = userData.memberSince || 'Januari 2024';
}

function loadOrderStatistics() {
    const orders = getOrders();
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'processing').length;
    
    const totalSpent = orders.reduce((total, order) => {
        if (order.status === 'completed') {
            return total + calculateOrderTotal(order.items);
        }
        return total;
    }, 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalSpent').textContent = `Rp ${totalSpent.toLocaleString('id-ID')}`;
}

function loadRecentOrders() {
    const orders = getOrders();
    const recentOrdersContainer = document.getElementById('recentOrders');
    
    if (!recentOrdersContainer) return;
    
    // Sort orders by date (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get last 5 orders
    const recentOrders = sortedOrders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <div class="empty-state">
                <p>Belum ada pesanan</p>
                <a href="catalog.html" class="btn btn-primary">Mulai Belanja</a>
            </div>
        `;
        return;
    }
    
    recentOrdersContainer.innerHTML = recentOrders.map(order => `
        <li class="recent-order-item">
            <div class="order-info">
                <strong>${order.orderId}</strong>
                <small>${formatDate(order.date)}</small>
            </div>
            <div class="order-status-container">
                <span class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
                <span class="order-total">
                    Rp ${calculateOrderTotal(order.items).toLocaleString('id-ID')}
                </span>
            </div>
        </li>
    `).join('');
}

function calculateOrderTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Menunggu',
        'processing': 'Diproses',
        'shipped': 'Dikirim',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    
    return statusMap[status] || status;
}

function getUserData() {
    const savedData = localStorage.getItem('freshHerbalUser');
    
    if (savedData) {
        return JSON.parse(savedData);
    }
    
    // Default user data
    const defaultData = {
        name: 'Pelanggan Fresh Herbal',
        email: 'customer@example.com',
        phone: '081234567890',
        address: 'Jl. Contoh No. 123, Jakarta',
        memberSince: 'Januari 2024'
    };
    
    localStorage.setItem('freshHerbalUser', JSON.stringify(defaultData));
    return defaultData;
}

function getOrders() {
    return JSON.parse(localStorage.getItem('freshHerbalOrders')) || [];
}

// Modal Functions
function editProfile() {
    const userData = getUserData();
    const modal = document.getElementById('profileModal');
    
    // Fill form with current data
    document.getElementById('editName').value = userData.name;
    document.getElementById('editEmail').value = userData.email;
    document.getElementById('editPhone').value = userData.phone;
    document.getElementById('editAddress').value = userData.address;
    
    // Show modal
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function setupDashboardEvents() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

function saveProfileChanges() {
    const form = document.getElementById('profileForm');
    
    if (!validateProfileForm(form)) {
        return;
    }
    
    const userData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        memberSince: getUserData().memberSince || 'Januari 2024'
    };
    
    // Check if password is being changed
    const newPassword = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword) {
        if (newPassword !== confirmPassword) {
            showNotification('Password tidak cocok!', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showNotification('Password minimal 6 karakter!', 'error');
            return;
        }
        
        userData.password = newPassword; // Note: In real app, encrypt this
    }
    
    // Save to localStorage
    localStorage.setItem('freshHerbalUser', JSON.stringify(userData));
    
    // Update UI
    loadUserData();
    
    // Close modal
    closeModal('profileModal');
    
    // Show success message
    showNotification('Profil berhasil diperbarui!', 'success');
}

function validateProfileForm(form) {
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    
    if (!name || !email || !phone || !address) {
        showNotification('Semua field wajib diisi!', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Format email tidak valid!', 'error');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('Nomor telepon harus 10-13 digit angka!', 'error');
        return false;
    }
    
    return true;
}

function showSupport() {
    alert('Silakan hubungi kami di:\n📞 (021) 1234-5678\n✉️ support@freshherbal.com\n\nJam operasional: Senin-Jumat 08:00-17:00');
}

function showSettings() {
    alert('Fitur pengaturan akan segera tersedia!');
}

// Add CSS for modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal-content {
        background-color: white;
        margin: 50px auto;
        padding: 0;
        width: 90%;
        max-width: 600px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
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
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #2e7d32;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;
    }
    
    .modal-close:hover {
        color: #333;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .form-actions .btn {
        flex: 1;
    }
    
    .empty-state {
        text-align: center;
        padding: 2rem;
    }
    
    .empty-state p {
        color: #666;
        margin-bottom: 1rem;
    }
    
    .order-status-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
    }
    
    .order-total {
        font-weight: 600;
        color: #2e7d32;
    }
    
    .status-pending {
        background-color: #fff3e0;
        color: #f57c00;
    }
    
    .status-processing {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .status-shipped {
        background-color: #e8eaf6;
        color: #3f51b5;
    }
    
    .status-completed {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    
    .status-cancelled {
        background-color: #ffebee;
        color: #c62828;
    }
`;
document.head.appendChild(modalStyles);