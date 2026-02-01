// Order Confirmation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    
    if (orderId) {
        loadOrderConfirmation(orderId);
    } else {
        // Redirect to dashboard if no order ID
        window.location.href = 'dashboard.html';
    }
});

function loadOrderConfirmation(orderId) {
    const orders = JSON.parse(localStorage.getItem('freshHerbalOrders')) || [];
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Display order ID
    document.getElementById('confirmedOrderId').textContent = orderId;
    
    // Display order summary
    const confirmationSummary = document.getElementById('confirmationSummary');
    if (confirmationSummary) {
        const subtotal = calculateOrderTotal(order.items);
        const shipping = subtotal > 200000 ? 0 : 15000;
        const total = subtotal + shipping;
        
        confirmationSummary.innerHTML = `
            <div class="summary-item">
                <span>Tanggal Pesanan:</span>
                <span>${formatDate(order.date)}</span>
            </div>
            <div class="summary-item">
                <span>Metode Pembayaran:</span>
                <span>${getPaymentMethodText(order.payment)}</span>
            </div>
            <div class="summary-item">
                <span>Status:</span>
                <span class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            <div class="summary-item">
                <span>Total Item:</span>
                <span>${order.items.length} produk</span>
            </div>
            <div class="summary-item">
                <span>Subtotal:</span>
                <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div class="summary-item">
                <span>Ongkos Kirim:</span>
                <span>${shipping === 0 ? 'Gratis' : 'Rp 15.000'}</span>
            </div>
            <div class="summary-item total">
                <strong>Total Pembayaran:</strong>
                <strong>Rp ${total.toLocaleString('id-ID')}</strong>
            </div>
        `;
    }
    
    // Update cart count (should be 0 after order)
    updateCartCount();
}

// Add CSS for confirmation page
const confirmationStyles = document.createElement('style');
confirmationStyles.textContent = `
    .confirmation {
        padding: 4rem 0;
        min-height: 70vh;
        display: flex;
        align-items: center;
    }
    
    .confirmation-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .confirmation-header {
        text-align: center;
        padding: 3rem 2rem;
        background: linear-gradient(135deg, #2e7d32, #4caf50);
        color: white;
    }
    
    .success-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: bounce 1s ease;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-20px);
        }
        60% {
            transform: translateY(-10px);
        }
    }
    
    .confirmation-header h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }
    
    .order-id {
        font-size: 1.2rem;
        opacity: 0.9;
    }
    
    .confirmation-body {
        padding: 2rem;
    }
    
    .confirmation-message {
        margin-bottom: 2rem;
    }
    
    .confirmation-message > p {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        color: #555;
    }
    
    .order-summary {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
    }
    
    .order-summary h3 {
        color: #2e7d32;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .next-steps {
        margin-bottom: 2rem;
    }
    
    .next-steps h3 {
        color: #2e7d32;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .step {
        display: flex;
        gap: 1rem;
    }
    
    .step-number {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: #4caf50;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }
    
    .step-content h4 {
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .step-content p {
        color: #666;
        font-size: 0.9rem;
        line-height: 1.5;
    }
    
    .confirmation-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 2rem;
    }
    
    .confirmation-actions .btn {
        flex: 1;
        min-width: 200px;
        text-align: center;
    }
    
    .support-info {
        background: #f0f7ff;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #2196f3;
    }
    
    .support-info h4 {
        color: #2196f3;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .support-info p {
        margin-bottom: 0.5rem;
        color: #555;
    }
    
    @media (max-width: 768px) {
        .confirmation-header {
            padding: 2rem 1rem;
        }
        
        .confirmation-header h1 {
            font-size: 2rem;
        }
        
        .confirmation-actions {
            flex-direction: column;
        }
        
        .confirmation-actions .btn {
            min-width: 100%;
        }
        
        .steps {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(confirmationStyles);