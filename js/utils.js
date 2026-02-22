// Utility Functions for Fresh Herbal

// Format currency
function formatCurrency(amount) {
    if (isNaN(amount)) return 'Rp 0';
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Calculate order total
function calculateOrderTotal(items) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('id-ID', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Menunggu Pembayaran',
        'processing': 'Sedang Diproses',
        'shipped': 'Dalam Pengiriman',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    
    return statusMap[status] || status || '-';
}

// Get payment method text
function getPaymentMethodText(method) {
    const methodMap = {
        'transfer': 'Transfer Bank',
        'cod': 'Cash on Delivery (COD)',
        'ewallet': 'E-Wallet'
    };
    
    return methodMap[method] || method || '-';
}

// Validate email
function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indonesia format)
function isValidPhone(phone) {
    if (!phone) return false;
    // Hapus karakter non-digit
    const cleaned = phone.replace(/\D/g, '');
    // Cek panjang 10-13 digit dan diawali 08
    return /^08[0-9]{8,11}$/.test(cleaned);
}

// Debounce function for performance
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

// Generate unique ID
function generateId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// LocalStorage helper
const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        animation: slideInRight 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    
    // Add button styles
    const button = notification.querySelector('button');
    if (button) {
        button.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            margin-left: auto;
            padding: 0 5px;
            opacity: 0.8;
            transition: opacity 0.3s;
        `;
        button.addEventListener('mouseenter', () => button.style.opacity = '1');
        button.addEventListener('mouseleave', () => button.style.opacity = '0.8');
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    const timeout = setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
    
    // Store timeout to clear if needed
    notification.dataset.timeout = timeout;
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Add global CSS for animations
(function addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .loading-spinner {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
        
        .spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4caf50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .required {
            color: #f44336;
            margin-left: 2px;
        }
        
        .error {
            border-color: #f44336 !important;
        }
        
        .error-message {
            color: #f44336;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        }
        
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
            overflow-y: auto;
        }
        
        .modal-content {
            background-color: white;
            margin: 50px auto;
            padding: 0;
            width: 90%;
            max-width: 600px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            overflow: hidden;
        }
        
        .modal-lg {
            max-width: 800px;
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
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
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
        
        .order-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .status-pending {
            background-color: #fff3e0;
            color: #e65100;
        }
        
        .status-processing {
            background-color: #e3f2fd;
            color: #1565c0;
        }
        
        .status-shipped {
            background-color: #e8f5e8;
            color: #2e7d32;
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
    document.head.appendChild(style);
})();

// Export utility functions
window.utils = {
    formatCurrency,
    calculateOrderTotal,
    formatDate,
    getStatusText,
    getPaymentMethodText,
    isValidEmail,
    isValidPhone,
    debounce,
    generateId,
    storage,
    showNotification,
    closeModal,
    openModal
};
