// Cart page functionality
let cart = JSON.parse(localStorage.getItem('metrotec_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartContent = document.getElementById('cartContent');
  
  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartContent.style.display = 'none';
    return;
  }
  
  emptyCart.style.display = 'none';
  cartContent.style.display = 'grid';
  
  cartItems.innerHTML = cart.map(item => `
    <div class="card" style="display: flex; gap: 1.5rem; margin-bottom: 1rem; align-items: center;">
      <img src="${item.image}" alt="${item.name}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 0.5rem;">
      <div style="flex: 1;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">${item.name}</h3>
        <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 0.5rem;">${item.description}</p>
        <p style="font-weight: 700; color: var(--primary-600);">$${item.price.toFixed(2)} ${item.recurring ? '/month' : ''}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <button onclick="updateQuantity(${item.id}, -1)" style="width: 32px; height: 32px; border: 2px solid var(--gray-300); background: white; border-radius: 0.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <i class="bi bi-dash"></i>
        </button>
        <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)" style="width: 32px; height: 32px; border: 2px solid var(--primary-600); background: var(--primary-600); color: white; border-radius: 0.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <i class="bi bi-plus"></i>
        </button>
      </div>
      <button onclick="removeItem(${item.id})" style="padding: 0.5rem; border: none; background: var(--error-50); color: var(--error-600); border-radius: 0.25rem; cursor: pointer;">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `).join('');
  
  updateTotals();
}

function updateQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(productId);
      return;
    }
    localStorage.setItem('metrotec_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function removeItem(productId) {
  cart = cart.filter(i => i.id !== productId);
  localStorage.setItem('metrotec_cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;
  
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
}
