// js/checkout.js
document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    
    document.getElementById('checkoutForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        processCheckout();
    });
});

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('freshHerbalCart')) || [];
    const orderItemsContainer = document.getElementById('orderItems');
    const orderTotalContainer = document.getElementById('orderTotal');
    
    if (!orderItemsContainer || !orderTotalContainer) return;
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>Keranjang kosong</p>';
        window.location.href = 'cart.html';
        return;
    }
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>Rp ${itemTotal.toLocaleString('id-ID')}</span>
            </div>
        `;
    });
    
    const shipping = subtotal > 200000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    orderItemsContainer.innerHTML = html;
    orderTotalContainer.innerHTML = `
        <div class="order-total">
            <div class="summary-item">
                <span>Subtotal</span>
                <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div class="summary-item">
                <span>Ongkos Kirim</span>
                <span>${shipping === 0 ? 'Gratis' : 'Rp 15.000'}</span>
            </div>
            <div class="summary-item total">
                <strong>Total</strong>
                <strong>Rp ${total.toLocaleString('id-ID')}</strong>
            </div>
        </div>
    `;
}

function processCheckout() {
    const form = document.getElementById('checkoutForm');
    
    if (!validateForm(form)) {
        return;
    }
    
    const orderData = {
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        },
        payment: document.getElementById('payment').value,
        items: JSON.parse(localStorage.getItem('freshHerbalCart')) || [],
        date: new Date().toISOString(),
        orderId: 'ORD-' + Date.now()
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('freshHerbalOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('freshHerbalOrders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('freshHerbalCart');
    
    // Show success message
    showNotification('Pesanan berhasil dibuat! Order ID: ' + orderData.orderId, 'success');
    
    // Redirect to order confirmation
    setTimeout(() => {
        window.location.href = `order-confirmation.html?order=${orderData.orderId}`;
    }, 2000);
}