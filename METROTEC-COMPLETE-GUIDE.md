# MetroTec Complete Development Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Setup & Installation](#setup--installation)
3. [VS Code Extensions](#vs-code-extensions)
4. [File Structure](#file-structure)
5. [Mobile Optimization](#mobile-optimization)
6. [Store Integration](#store-integration)
7. [HP PQWS API Integration](#hp-pqws-api-integration)
8. [Code Quality Tools](#code-quality-tools)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**MetroTec** is a professional IT services website for Metro Detroit businesses within a 25-mile radius.

### Key Features
- Responsive design (mobile & desktop)
- 60-30-10 color scheme
- SEO-optimized content
- E-commerce store
- Lead generation system
- CMS integration
- Contact forms

### Service Area
Detroit, Dearborn, Southfield, Troy, Warren, Sterling Heights, Livonia, Westland, Farmington Hills, and surrounding communities.

---

## Setup & Installation

### Prerequisites
- Node.js 14+
- Python 3.6+ (for local server)
- VS Code (recommended)
- Git

### Initial Setup

```bash
cd /mnt/d/KIRO\ PROJECTS/METROTEC

# Install dependencies
npm install

# Install Prettier
npm install --save-dev prettier

# Start local server
python3 -m http.server 8000
```

Visit: `http://localhost:8000`

---

## VS Code Extensions

### Installed Extensions (18 total)

**Code Quality:**
- `sonarsource.sonarlint-vscode` - Code analysis
- `dbaeumer.vscode-eslint` - JavaScript linting
- `stylelint.vscode-stylelint` - CSS linting
- `esbenp.prettier-vscode` - Code formatter
- `streetsidesoftware.code-spell-checker` - Spell check

**Mobile & Accessibility:**
- `ms-vscode.live-server` - Live preview
- `pnp.polacode` - Responsive viewer
- `Tinyfish.vscode-mobile-simulator` - Device emulation
- `axe-devtools.web-accessibility-checker` - A11y testing
- `ecmel.vscode-html-css` - HTML/CSS support
- `pranaygp.vscode-css-peek` - CSS navigation

**E-Commerce & APIs:**
- `rangav.vscode-thunder-client` - API testing
- `humao.rest-client` - REST client
- `postman.postman-for-vscode` - Postman integration
- `stripe.vscode-stripe` - Stripe tools
- `paypal.paypal-tools` - PayPal tools
- `alexcvzz.vscode-sqlite` - SQLite viewer
- `cweijan.vscode-database-client` - Database client

### Install Extensions

**Linux/Mac:**
```bash
bash install-extensions.sh
```

**Windows:**
```cmd
install-extensions.bat
```

---

## File Structure

```
METROTEC/
├── index.html                 # Homepage
├── services.html              # Services overview
├── industries.html            # Industries served
├── about.html                 # Company info
├── contact.html               # Contact page
├── get-quote.html             # Quote request form
│
├── Service Pages/
├── managed-it.html
├── cybersecurity.html
├── cloud-services.html
├── voip-phone.html
│
├── Industry Pages/
├── healthcare.html
├── manufacturing.html
├── professional-services.html
├── retail.html
│
├── Store/
├── store/
│   ├── index.html             # Store homepage
│   ├── cart.html              # Shopping cart
│   ├── checkout.html          # Checkout page
│   ├── confirmation.html      # Order confirmation
│   ├── store.js               # Store logic
│   ├── cart.js                # Cart functionality
│   ├── checkout.js            # Checkout logic
│   ├── hp-pqws-integration.js # HP API integration
│   └── HP-PQWS-SETUP.md       # HP API setup guide
│
├── Styles/
├── universal-ui.css           # Main stylesheet
├── blog-enhanced.css          # Blog styles
├── mobile-optimized.css       # Mobile styles
├── mobile-responsive.css      # Responsive styles
├── mobile-consolidated.css    # Consolidated mobile
│
├── Scripts/
├── js/
│   ├── script.js              # Main script (module)
│   ├── metrotec-forms.js      # Form handling
│   ├── cms-integration.js     # CMS integration
│   ├── mobile-detect.js       # Mobile detection
│   ├── mobile-nav.js          # Mobile navigation
│   └── dynamic-host.js        # Dynamic hosting
│
├── Backend/
├── metrotec-admin-dashboard.php
├── metrotec-lead-engine.php
├── metrotec-contact-handler.php
├── metrotec-security-complete.php
│
├── Configuration/
├── .vscode/
│   ├── extensions.json        # Recommended extensions
│   └── settings.json          # VS Code settings
├── .prettierrc.json           # Prettier config
├── .eslintrc.json             # ESLint config
├── .stylelintrc.json          # Stylelint config
├── .htaccess                  # Apache config
├── robots.txt                 # SEO robots
├── sitemap.xml                # XML sitemap
│
└── Documentation/
    ├── README.md
    ├── PROJECT-SUMMARY.md
    ├── SEO-AUDIT-REPORT.md
    ├── OPTIMIZATION-REPORT.md
    ├── UX-ACCESSIBILITY-ANALYSIS.md
    └── METROTEC-COMPLETE-GUIDE.md (this file)
```

---

## Mobile Optimization

### Mobile CSS Files
- `mobile-optimized.css` - Base mobile styles
- `mobile-responsive.css` - Responsive breakpoints
- `mobile-consolidated.css` - Consolidated styles
- `mobile-iphone.css` - iPhone-specific
- `mobile-android.css` - Android-specific

### Testing Mobile

**Using Live Server:**
1. Right-click HTML file → "Open with Live Server"
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+M` to toggle device toolbar
4. Test on iPhone, Android, tablet sizes

**Using Mobile Simulator Extension:**
1. Open command palette (`Ctrl+Shift+P`)
2. Search "Mobile Simulator"
3. Select device and preview

### Responsive Breakpoints
```css
/* Mobile: 320px - 480px */
@media (max-width: 480px) { }

/* Tablet: 481px - 768px */
@media (max-width: 768px) { }

/* Desktop: 769px+ */
@media (min-width: 769px) { }
```

---

## Store Integration

### Store Structure

**Pages:**
- `store/index.html` - Product listing
- `store/cart.html` - Shopping cart
- `store/checkout.html` - Checkout form
- `store/confirmation.html` - Order confirmation

**JavaScript:**
- `store.js` - Product database & logic
- `cart.js` - Cart management
- `checkout.js` - Payment processing

### Product Format

```javascript
{
  id: 1,
  name: "Product Name",
  category: "computers",
  price: 1299,
  image: "https://...",
  description: "Product description",
  specs: ["Spec 1", "Spec 2"],
  inStock: true,
  stock: 12
}
```

### Add Products Manually

Edit `store/store.js`:

```javascript
const products = [
  {
    id: 1,
    name: "Your Product",
    category: "category",
    price: 999,
    image: "image-url",
    description: "Description",
    specs: ["Spec 1"],
    inStock: true,
    stock: 10
  }
];
```

---

## HP PQWS API Integration

### Overview
Automatically populate store with HP products via PQWS API.

### Setup

**1. Get API Credentials**
- Visit: https://developer.hp.com/
- Sign up for PQWS API access
- Generate API key

**2. Add Environment Variables**

Create `.env` file:
```
HP_PQWS_API_KEY=your_api_key_here
HP_PQWS_ENDPOINT=https://pqws.hp.com/api/v1
```

**3. Initialize Integration**

In `store/store.js`:
```javascript
import HPPQWSIntegration from './hp-pqws-integration.js';

const hpIntegration = new HPPQWSIntegration({
  apiKey: process.env.HP_PQWS_API_KEY,
  endpoint: process.env.HP_PQWS_ENDPOINT,
  categories: ['printers', 'servers', 'workstations']
});
```

### Usage

**Fetch all products:**
```javascript
const products = await hpIntegration.fetchAllProducts();
```

**Fetch specific category:**
```javascript
const printers = await hpIntegration.fetchProducts('printers', 50);
```

**Search products:**
```javascript
const results = await hpIntegration.searchProducts('HP LaserJet');
```

**Get product details:**
```javascript
const details = await hpIntegration.getProductDetails('CE505A');
```

**Cache products:**
```javascript
await hpIntegration.cacheProducts(products);
const cached = hpIntegration.getCachedProducts();
```

### Supported Categories
- `printers`
- `servers`
- `workstations`
- `storage`
- `networking`
- `supplies`

### API Response Format

```javascript
{
  id: "hp-sku-123",
  name: "HP LaserJet Pro M404n",
  category: "printers",
  price: 299.99,
  image: "https://...",
  description: "Monochrome laser printer",
  specs: ["40 ppm", "USB", "Ethernet"],
  inStock: true,
  stock: 15,
  sku: "CE505A",
  manufacturer: "HP",
  url: "https://..."
}
```

### Error Handling

```javascript
try {
  const products = await hpIntegration.fetchProducts('printers');
} catch (error) {
  console.error('Failed to fetch products:', error);
  // Falls back to cached products
}
```

### Caching

Products cached in localStorage for 1 hour by default:

```javascript
// Custom cache duration (30 minutes)
const cached = hpIntegration.getCachedProducts(1800000);
```

---

## Code Quality Tools

### Prettier (Code Formatter)

**Format all files:**
```bash
npx prettier --write "*.{html,css,js}"
```

**Configuration** (`.prettierrc.json`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "htmlWhitespaceSensitivity": "css"
}
```

### ESLint (JavaScript Linting)

**Check JavaScript:**
```bash
npx eslint "**/*.js"
```

**Fix issues:**
```bash
npx eslint "**/*.js" --fix
```

### Stylelint (CSS Linting)

**Check CSS:**
```bash
npx stylelint "**/*.css"
```

**Fix issues:**
```bash
npx stylelint "**/*.css" --fix
```

### SonarLint (Code Analysis)

- Integrated in VS Code
- Real-time code quality analysis
- Security vulnerability detection

---

## Deployment

### Local Testing

```bash
# Start server
python3 -m http.server 8000

# Visit
http://localhost:8000
```

### AWS S3 Deployment

```bash
# Deploy to S3
bash s3-deploy.sh
```

### Manual Deployment

1. Build/minify assets
2. Upload to hosting
3. Update DNS records
4. Test on production

### Pre-Deployment Checklist

- [ ] Run Prettier: `npx prettier --write "*.{html,css,js}"`
- [ ] Run ESLint: `npx eslint "**/*.js" --fix`
- [ ] Run Stylelint: `npx stylelint "**/*.css" --fix`
- [ ] Test on mobile devices
- [ ] Test forms and checkout
- [ ] Verify SEO meta tags
- [ ] Check accessibility (axe DevTools)
- [ ] Test on different browsers

---

## Troubleshooting

### CORS Errors

**Problem:** "Cross origin requests are only supported for protocol schemes..."

**Solution:** Use HTTP server, not `file://` protocol
```bash
python3 -m http.server 8000
```

### jQuery Not Defined

**Problem:** "ReferenceError: jQuery is not defined"

**Solution:** Forms now use vanilla JavaScript. Ensure `script.js` has `type="module"`:
```html
<script type="module" src="js/script.js"></script>
```

### 404 Errors

**favicon.ico:** Optional, add to silence warning
```bash
touch favicon.ico
```

**home.json:** Expected, CMS falls back to static content

### Module Import Errors

**Problem:** "Failed to resolve module specifier"

**Solution:** Ensure scripts are loaded as modules:
```html
<script type="module" src="js/script.js"></script>
```

### Cache Issues

**Hard refresh browser:**
- Windows/Linux: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### HP PQWS API Issues

**401 Unauthorized:**
- Verify API key is correct
- Check API key has PQWS permissions

**404 Not Found:**
- Verify endpoint URL
- Check category name is valid

**Empty Results:**
- Try different category
- Check API key permissions

---

## Quick Commands

```bash
# Install dependencies
npm install

# Format code
npx prettier --write "*.{html,css,js}"

# Lint JavaScript
npx eslint "**/*.js" --fix

# Lint CSS
npx stylelint "**/*.css" --fix

# Start local server
python3 -m http.server 8000

# Install VS Code extensions
bash install-extensions.sh  # Linux/Mac
install-extensions.bat      # Windows

# Deploy to S3
bash s3-deploy.sh
```

---

## Resources

- **HP PQWS API:** https://developer.hp.com/
- **VS Code:** https://code.visualstudio.com/
- **Prettier:** https://prettier.io/
- **ESLint:** https://eslint.org/
- **Stylelint:** https://stylelint.io/
- **MDN Web Docs:** https://developer.mozilla.org/

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Review relevant documentation
3. Check browser console for errors
4. Verify configuration files

---

**Last Updated:** March 24, 2026
**Version:** 1.0
