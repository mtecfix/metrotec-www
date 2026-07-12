// Checkout page functionality
let cart = JSON.parse(localStorage.getItem('metrotec_cart')) || [];
let installationFee = 0;
let supportFee = 0;

document.addEventListener('DOMContentLoaded', () => {
  if (cart.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  
  renderOrderSummary();
  setupFormHandlers();
});

function renderOrderSummary() {
  const orderItems = document.getElementById('orderItems');
  
  orderItems.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--gray-200);">
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
        <div style="font-size: 0.8rem; color: var(--gray-600);">Qty: ${item.quantity}</div>
      </div>
      <div style="font-weight: 600; color: var(--primary-600);">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');
  
  updateTotals();
}

function setupFormHandlers() {
  const form = document.getElementById('checkoutForm');
  const installationCheckbox = document.querySelector('input[name="installation"]');
  const supportCheckbox = document.querySelector('input[name="support"]');
  
  installationCheckbox.addEventListener('change', (e) => {
    installationFee = e.target.checked ? 299 : 0;
    updateTotals();
  });
  
  supportCheckbox.addEventListener('change', (e) => {
    supportFee = e.target.checked ? 149 : 0;
    updateTotals();
  });
  
  form.addEventListener('submit', handleSubmit);
}

function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const servicesTotal = installationFee + supportFee;
  const tax = (subtotal + servicesTotal) * 0.06;
  const total = subtotal + servicesTotal + tax;
  
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('installation').textContent = installationFee > 0 ? `$${installationFee.toFixed(2)}` : '$0.00';
  document.getElementById('support').textContent = supportFee > 0 ? `$${supportFee.toFixed(2)}` : '$0.00';
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function handleSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const orderData = {
    customer: {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip')
    },
    items: cart,
    services: {
      installation: formData.get('installation') === 'on',
      support: formData.get('support') === 'on'
    },
    notes: formData.get('notes'),
    totals: {
      subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      installation: installationFee,
      support: supportFee,
      tax: (cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + installationFee + supportFee) * 0.06,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + installationFee + supportFee + ((cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + installationFee + supportFee) * 0.06)
    },
    timestamp: new Date().toISOString()
  };
  
  // Store order for confirmation page
  localStorage.setItem('metrotec_last_order', JSON.stringify(orderData));
  
  // Clear cart
  localStorage.removeItem('metrotec_cart');
  
  // Redirect to confirmation
  window.location.href = 'confirmation.html';
}
