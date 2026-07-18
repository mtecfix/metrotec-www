# HP PQWS API Integration Setup

## Overview
This integration fetches products from HP's Product Query Web Service (PQWS) API to populate your MetroTec store.

## Prerequisites

1. **HP PQWS API Credentials**
   - API Key from HP Developer Portal
   - API Endpoint URL

2. **Get Credentials**
   - Visit: https://developer.hp.com/
   - Sign up for HP PQWS API access
   - Generate API key

## Setup

### 1. Add Environment Variables

Create a `.env` file in the project root:

```
HP_PQWS_API_KEY=your_api_key_here
HP_PQWS_ENDPOINT=https://pqws.hp.com/api/v1
```

### 2. Initialize in Your Store

```javascript
// In store/store.js or store/index.html
const hpIntegration = new HPPQWSIntegration({
  apiKey: process.env.HP_PQWS_API_KEY,
  endpoint: process.env.HP_PQWS_ENDPOINT,
  categories: ['printers', 'servers', 'workstations'],
});

// Fetch products
const products = await hpIntegration.fetchAllProducts();
```

### 3. Usage Examples

**Fetch all products:**
```javascript
const allProducts = await hpIntegration.fetchAllProducts();
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

**Cache products locally:**
```javascript
await hpIntegration.cacheProducts(products);
const cached = hpIntegration.getCachedProducts();
```

## API Response Format

The integration transforms HP API responses to this format:

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
  sku: "W1A52A",
  manufacturer: "HP",
  url: "https://..."
}
```

## Supported Categories

- `printers`
- `servers`
- `workstations`
- `storage`
- `networking`
- `supplies`

## Error Handling

The integration includes built-in error handling:

```javascript
try {
  const products = await hpIntegration.fetchProducts('printers');
} catch (error) {
  console.error('Failed to fetch products:', error);
  // Falls back to cached products or empty array
}
```

## Caching Strategy

Products are cached in localStorage for 1 hour by default:

```javascript
// Custom cache duration (30 minutes)
const cached = hpIntegration.getCachedProducts(1800000);
```

## Rate Limiting

HP PQWS API has rate limits. Implement caching to avoid excessive requests.

## Troubleshooting

**401 Unauthorized:**
- Check API key is correct
- Verify API key has PQWS permissions

**404 Not Found:**
- Verify endpoint URL
- Check category name is valid

**Empty Results:**
- Category may not have products
- Try different category
- Check API key permissions

## Next Steps

1. Get HP PQWS API credentials
2. Add to `.env` file
3. Update `store.js` to use integration
4. Test with `fetchAllProducts()`
5. Deploy to production
