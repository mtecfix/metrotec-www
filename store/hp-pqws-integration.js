/**
 * HP PQWS API Integration for MetroTec Store
 * Fetches products from HP's Product Query Web Service
 */

class HPPQWSIntegration {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.HP_PQWS_API_KEY;
    this.endpoint = config.endpoint || 'https://pqws.hp.com/api/v1';
    this.categories = config.categories || [
      'printers',
      'servers',
      'workstations',
      'storage',
    ];
  }

  /**
   * Fetch products from HP PQWS API
   */
  async fetchProducts(category = 'printers', limit = 50) {
    try {
      const url = new URL(`${this.endpoint}/products`);
      url.searchParams.append('category', category);
      url.searchParams.append('limit', limit);
      url.searchParams.append('apiKey', this.apiKey);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HP PQWS API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch HP PQWS products:', error);
      return [];
    }
  }

  /**
   * Transform HP API response to store format
   */
  transformProducts(hpProducts) {
    return hpProducts.map((product, index) => ({
      id: product.sku || `hp-${index}`,
      name: product.name || product.title,
      category: product.category || 'products',
      price: product.price || product.msrp || 0,
      image: product.image || product.imageUrl || 'https://via.placeholder.com/300x200',
      description: product.description || product.shortDescription || '',
      specs: product.specifications || product.specs || [],
      inStock: product.inStock !== false,
      stock: product.stock || product.quantity || 0,
      sku: product.sku,
      manufacturer: product.manufacturer || 'HP',
      url: product.url || product.productUrl,
    }));
  }

  /**
   * Fetch all categories
   */
  async fetchAllProducts() {
    const allProducts = [];

    for (const category of this.categories) {
      const products = await this.fetchProducts(category);
      allProducts.push(...products);
    }

    return allProducts;
  }

  /**
   * Search products by query
   */
  async searchProducts(query) {
    try {
      const url = new URL(`${this.endpoint}/search`);
      url.searchParams.append('q', query);
      url.searchParams.append('apiKey', this.apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      return this.transformProducts(data.results || []);
    } catch (error) {
      console.error('HP PQWS search failed:', error);
      return [];
    }
  }

  /**
   * Get product details
   */
  async getProductDetails(sku) {
    try {
      const url = new URL(`${this.endpoint}/products/${sku}`);
      url.searchParams.append('apiKey', this.apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      return this.transformProducts([data.product])[0];
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      return null;
    }
  }

  /**
   * Cache products locally
   */
  async cacheProducts(products) {
    try {
      localStorage.setItem(
        'hp_pqws_cache',
        JSON.stringify({
          products,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to cache products:', error);
    }
  }

  /**
   * Get cached products
   */
  getCachedProducts(maxAge = 3600000) {
    // 1 hour default
    try {
      const cached = localStorage.getItem('hp_pqws_cache');
      if (!cached) return null;

      const { products, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) return null;

      return products;
    } catch (error) {
      console.error('Failed to retrieve cached products:', error);
      return null;
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HPPQWSIntegration;
}
