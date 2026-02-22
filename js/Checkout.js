// Checkout JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Cek apakah keranjang kosong
    const cart = storage.get('freshHerbalCart', []);
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong', 'warning');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 2000);
        return;
    }
    
    loadOrderSummary();
    
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processCheckout();
        });
    }
});

function loadOrderSummary() {
    const cart = storage.get('freshHerbalCart', []);
    const orderItemsContainer = document.getElementById('orderItems');
    const orderTotalContainer = document.getElementById('orderTotal');
    
    if (!orderItemsContainer || !orderTotalContainer) return;
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-cart-message">Keranjang kosong</p>';
        return;
    }
    
    let subtotal = 0;
    let html = '<div class="order-items-list">';
    
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        subtotal += itemTotal;
        
        html += `
            <div class="order-item">
                <div class="order-item-info">
                    <img src="${item.image || 'images/placeholder.jpg'}" 
                         alt="${item.name}" 
                         class="order-item-image"
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="order-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} x ${formatCurrency(item.price)}</p>
                    </div>
                </div>
                <span class="order-item-total">${formatCurrency(itemTotal)}</span>
            </div>
        `;
    });
    
    html += '</div>';
    
    const shipping = subtotal >= 200000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    orderItemsContainer.innerHTML = html;
    orderTotalContainer.innerHTML = `
        <div class="order-total">
            <div class="summary-item">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-item">
                <span>Ongkos Kirim</span>
                <span>${shipping === 0 ? 'Gratis' : 'Rp 15.000'}</span>
            </div>
            <div class="summary-item total">
                <strong>Total</strong>
                <strong>${formatCurrency(total)}</strong>
            </div>
        </div>
    `;
}

function processCheckout() {
    const form = document.getElementById('checkoutForm');
    
    if (!validateForm(form)) {
        return;
    }
    
    // Disable submit button to prevent double submission
    const submitBtn = document.getElementById('checkoutSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }
    
    // Get cart items
    const cartItems = storage.get('freshHerbalCart', []);
    
    if (cartItems.length === 0) {
        showNotification('Keranjang belanja kosong', 'error');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Buat Pesanan';
        }
        return;
    }
    
    // Calculate total
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 200000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    // Create order data
    const orderData = {
        orderId: generateId(),
        customer: {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim()
        },
        payment: document.getElementById('payment').value,
        items: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        notes: ''
    };
    
    // Save order to localStorage
    const orders = storage.get('freshHerbalOrders', []);
    orders.push(orderData);
    storage.set('freshHerbalOrders', orders);
    
    // Clear cart
    storage.remove('freshHerbalCart');
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification('Pesanan berhasil dibuat!', 'success');
    
    // Redirect to order confirmation
    setTimeout(() => {
        window.location.href = `order-confirmation.html?order=${orderData.orderId}`;
    }, 1500);
}

// Tambahkan style untuk checkout
(function addCheckoutStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .checkout-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .checkout-form,
        .order-summary {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .checkout-form h2,
        .order-summary h2 {
            color: #2e7d32;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .form-actions .btn {
            flex: 1;
        }
        
        .order-items-list {
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 1.5rem;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .order-item:last-child {
            border-bottom: none;
        }
        
        .order-item-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .order-item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .order-item-details h4 {
            margin-bottom: 0.25rem;
            color: #333;
        }
        
        .order-item-details p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .order-item-total {
            font-weight: 600;
            color: #2e7d32;
        }
        
        .order-total {
            background: #f9f9f9;
            padding: 1.5rem;
            border-radius: 8px;
        }
        
        .empty-cart-message {
            text-align: center;
            color: #666;
            padding: 2rem;
        }
        
        @media (max-width: 768px) {
            .checkout-grid {
                grid-template-columns: 1fr;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .order-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .order-item-total {
                align-self: flex-end;
            }
        }
    `;
    document.head.appendChild(style);
})();
