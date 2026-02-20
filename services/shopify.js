const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_URL;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

class ShopifyService {
  /**
   * Get products from Shopify based on skin concerns
   * @param {Array} concerns - Array of skin concern objects
   * @returns {Promise<Array>} - Array of product recommendations
   */
  async getProductsByTags(concerns) {
    console.log('\n🛍️  Fetching products from Shopify...');
    
    if (!SHOPIFY_STORE || !ACCESS_TOKEN) {
      console.warn('⚠️  Shopify credentials not configured');
      return [];
    }

    const allProducts = [];
    const seenProductIds = new Set();

    try {
      // Fetch products for top 3 concerns (prioritized)
      const topConcerns = concerns.slice(0, 3);
      
      for (const concern of topConcerns) {
        console.log(`🔍 Searching for: ${concern.displayName}`);
        
        for (const tag of concern.productTags) {
          const products = await this.searchProductsByTag(tag);
          
          // Add unique products
          for (const product of products) {
            if (!seenProductIds.has(product.id)) {
              seenProductIds.add(product.id);
              allProducts.push({
                ...product,
                matchedConcern: concern.displayName,
                matchedTag: tag,
                concernSeverity: concern.severity
              });
            }
          }

          // Limit to 10 total products
          if (allProducts.length >= 10) break;
        }
        
        if (allProducts.length >= 10) break;
      }

      console.log(`✅ Found ${allProducts.length} product recommendations\n`);
      return allProducts.slice(0, 10);
    } catch (error) {
      console.error('❌ Shopify fetch error:', error.message);
      return [];
    }
  }

  /**
   * Search products by tag using Shopify GraphQL API
   * @param {string} tag - Product tag to search
   * @returns {Promise<Array>} - Array of products
   */
  async searchProductsByTag(tag) {
    try {
      const query = `
        query {
          products(first: 5, query: "tag:${tag}") {
            edges {
              node {
                id
                title
                description
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                tags
              }
            }
          }
        }
      `;

      const response = await axios.post(
        `https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ACCESS_TOKEN
          }
        }
      );

      if (response.data.errors) {
        console.error('Shopify GraphQL errors:', response.data.errors);
        return [];
      }

      const products = response.data.data.products.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        price: parseFloat(edge.node.priceRange.minVariantPrice.amount),
        currency: edge.node.priceRange.minVariantPrice.currencyCode,
        url: `https://${SHOPIFY_STORE}/products/${edge.node.handle}`,
        image: edge.node.images.edges[0]?.node.url || null,
        imageAlt: edge.node.images.edges[0]?.node.altText || edge.node.title,
        tags: edge.node.tags
      }));

      return products;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('❌ Shopify authentication failed - check your access token');
      } else {
        console.error('❌ Shopify API error:', error.message);
      }
      return [];
    }
  }

  /**
   * Alternative method: Search products by tag using REST API
   * @param {string} tag - Product tag to search
   * @returns {Promise<Array>} - Array of products
   */
  async searchProductsByTagREST(tag) {
    try {
      const response = await axios.get(
        `https://${SHOPIFY_STORE}/admin/api/2024-01/products.json`,
        {
          params: {
            limit: 5,
            fields: 'id,title,body_html,handle,variants,images,tags'
          },
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN
          }
        }
      );

      // Filter products by tag
      const products = response.data.products
        .filter(product => product.tags.toLowerCase().includes(tag.toLowerCase()))
        .map(product => ({
          id: product.id.toString(),
          title: product.title,
          description: product.body_html?.replace(/<[^>]*>/g, '') || '',
          price: parseFloat(product.variants[0]?.price || 0),
          currency: 'USD',
          url: `https://${SHOPIFY_STORE}/products/${product.handle}`,
          image: product.images[0]?.src || null,
          imageAlt: product.images[0]?.alt || product.title,
          tags: product.tags.split(', ')
        }));

      return products;
    } catch (error) {
      console.error('❌ Shopify REST API error:', error.message);
      return [];
    }
  }
}

module.exports = new ShopifyService();
