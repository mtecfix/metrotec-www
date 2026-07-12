// Store Products Database
const products = [
  // Computers
  {
    id: 1,
    name: "Dell OptiPlex 7090 Desktop",
    category: "computers",
    price: 1299,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Dell+Desktop",
    description: "Intel i7, 16GB RAM, 512GB SSD",
    specs: ["Intel Core i7-11700", "16GB DDR4", "512GB NVMe SSD", "Windows 11 Pro"],
    inStock: true,
    stock: 12
  },
  {
    id: 2,
    name: "HP EliteBook 850 G8 Laptop",
    category: "computers",
    price: 1599,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=HP+Laptop",
    description: "15.6\" Business Laptop, i7, 16GB RAM",
    specs: ["Intel Core i7-1185G7", "16GB RAM", "512GB SSD", "15.6\" FHD Display"],
    inStock: true,
    stock: 8
  },
  {
    id: 3,
    name: "Lenovo ThinkCentre M90q Tiny",
    category: "computers",
    price: 899,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Lenovo+Tiny",
    description: "Ultra-compact desktop, i5, 8GB RAM",
    specs: ["Intel Core i5-10500T", "8GB RAM", "256GB SSD", "Ultra-compact form"],
    inStock: true,
    stock: 15
  },
  
  // Servers
  {
    id: 4,
    name: "Dell PowerEdge T340 Server",
    category: "servers",
    price: 2499,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Dell+Server",
    description: "Tower server, Xeon E-2234, 16GB RAM",
    specs: ["Intel Xeon E-2234", "16GB ECC RAM", "2x 1TB HDD", "RAID controller"],
    inStock: true,
    stock: 5
  },
  {
    id: 5,
    name: "HPE ProLiant ML110 Gen10",
    category: "servers",
    price: 1899,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=HPE+Server",
    description: "Entry-level tower server",
    specs: ["Intel Xeon Silver 4208", "16GB RAM", "1TB HDD", "Hot-plug drives"],
    inStock: false,
    stock: 0
  },
  
  // Networking
  {
    id: 6,
    name: "Cisco Catalyst 1000 Switch",
    category: "networking",
    price: 599,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Cisco+Switch",
    description: "24-port Gigabit managed switch",
    specs: ["24x 1GbE ports", "4x 1G SFP uplinks", "Layer 2 switching", "Fanless"],
    inStock: true,
    stock: 20
  },
  {
    id: 7,
    name: "Ubiquiti UniFi Dream Machine Pro",
    category: "networking",
    price: 379,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=UniFi+UDM",
    description: "All-in-one network security gateway",
    specs: ["8-port PoE switch", "IDS/IPS", "VPN server", "Cloud management"],
    inStock: true,
    stock: 10
  },
  {
    id: 8,
    name: "Fortinet FortiGate 60F Firewall",
    category: "networking",
    price: 1299,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=FortiGate",
    description: "Next-gen firewall with SD-WAN",
    specs: ["10 Gbps firewall", "SD-WAN", "VPN", "Threat protection"],
    inStock: true,
    stock: 7
  },
  
  // Software
  {
    id: 9,
    name: "Microsoft 365 Business Premium",
    category: "software",
    price: 22,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=M365",
    description: "Per user/month - Annual commitment",
    specs: ["Office apps", "1TB OneDrive", "Teams", "Advanced security"],
    inStock: true,
    stock: 999,
    recurring: true
  },
  {
    id: 10,
    name: "Windows 11 Pro License",
    category: "software",
    price: 199,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Windows+11",
    description: "OEM license for business PCs",
    specs: ["Full Windows 11 Pro", "BitLocker", "Remote Desktop", "Domain join"],
    inStock: true,
    stock: 50
  },
  {
    id: 11,
    name: "Adobe Creative Cloud Business",
    category: "software",
    price: 79.99,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Adobe+CC",
    description: "Per user/month - All Adobe apps",
    specs: ["Photoshop", "Illustrator", "Premiere Pro", "100GB storage"],
    inStock: true,
    stock: 999,
    recurring: true
  },
  {
    id: 12,
    name: "Veeam Backup & Replication",
    category: "software",
    price: 899,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Veeam",
    description: "Enterprise backup solution",
    specs: ["VM backup", "Cloud backup", "Instant recovery", "10 workloads"],
    inStock: true,
    stock: 25
  },
  
  // Accessories
  {
    id: 13,
    name: "Dell UltraSharp U2722DE Monitor",
    category: "accessories",
    price: 449,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Dell+Monitor",
    description: "27\" QHD USB-C monitor",
    specs: ["27\" 2560x1440", "USB-C hub", "IPS panel", "Height adjustable"],
    inStock: true,
    stock: 18
  },
  {
    id: 14,
    name: "Logitech MX Keys Business",
    category: "accessories",
    price: 119,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=Keyboard",
    description: "Wireless keyboard for business",
    specs: ["Backlit keys", "Multi-device", "USB-C charging", "Quiet typing"],
    inStock: true,
    stock: 30
  },
  {
    id: 15,
    name: "APC Back-UPS Pro 1500VA",
    category: "accessories",
    price: 279,
    image: "https://via.placeholder.com/300x200/7c3aed/ffffff?text=UPS",
    description: "Battery backup and surge protection",
    specs: ["1500VA/900W", "10 outlets", "LCD display", "USB monitoring"],
    inStock: true,
    stock: 12
  }
];

// Cart management
let cart = JSON.parse(localStorage.getItem('metrotec_cart')) || [];
let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

// Initialize store
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartCount();
  setupCategoryFilters();
  setupSearch();
  setupSort();
});

// Render products
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  
  let filtered = currentCategory === 'all' ? [...products] : products.filter(p => p.category === currentCategory);
  
  // Apply search
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply sort
  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  if (filtered.length === 0) {
    noResults.style.display = 'block';
    grid.style.display = 'none';
    return;
  }
  
  noResults.style.display = 'none';
  grid.style.display = 'grid';
  
  grid.innerHTML = filtered.map(product => `
    <div class="card product-card" style="display: flex; flex-direction: column; position: relative;">
      ${!product.inStock ? '<div style="position: absolute; top: 1rem; right: 1rem; background: var(--error-600); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">Out of Stock</div>' : ''}
      ${product.stock < 10 && product.stock > 0 ? `<div style="position: absolute; top: 1rem; right: 1rem; background: var(--warning-600); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">Only ${product.stock} left</div>` : ''}
      <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1rem;">
      <div style="flex: 1; display: flex; flex-direction: column;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.5rem;">${product.name}</h3>
        <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 1rem;">${product.description}</p>
        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--gray-600);">
          ${product.specs.map(spec => `<li style="padding: 0.25rem 0;"><i class="bi bi-check2" style="color: var(--primary-600); margin-right: 0.5rem;"></i>${spec}</li>`).join('')}
        </ul>
        <div style="margin-top: auto;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <span style="font-size: 1.75rem; font-weight: 700; color: var(--primary-600);">$${product.price.toFixed(2)}</span>
            ${product.recurring ? '<span style="font-size: 0.85rem; color: var(--gray-500);">/month</span>' : ''}
          </div>
          <button onclick="addToCart(${product.id})" class="btn btn-primary" style="width: 100%;" ${!product.inStock ? 'disabled' : ''}>
            <i class="bi bi-cart-plus"></i> ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Search
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });
}

// Sort
function setupSort() {
  const sortSelect = document.getElementById('sortSelect');
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });
}

// Category filters
function setupCategoryFilters() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => {
        b.style.background = 'white';
        b.style.color = 'var(--gray-700)';
        b.classList.remove('active');
      });
      btn.style.background = 'var(--primary-600)';
      btn.style.color = 'white';
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  localStorage.setItem('metrotec_cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`${product.name} added to cart!`);
}

// Update cart count
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
  const mobileCount = document.getElementById('cartCountMobile');
  if (mobileCount) mobileCount.textContent = count;
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toast.style.display = 'flex';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
