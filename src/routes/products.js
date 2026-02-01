/**
 * ============================================
 * PRODUCT ROUTES
 * ============================================
 * 
 * This file defines all product-related API endpoints.
 * 
 * Available Routes:
 * 
 * CATEGORIES:
 * - GET /api/categories - Get all categories
 * 
 * PRODUCTS:
 * - GET /api/products/search - Search products with filters
 * - GET /api/products/:categoryId - Get products by category
 * 
 * ============================================
 */

import { getAllCategories } from "../controllers/product/category.js";
import { getProductsByCategoryId, searchProducts } from "../controllers/product/product.js";

/**
 * CATEGORY ROUTES
 * Base path: /api/categories
 */
export const categoryRoutes = async (fastify, options) => {
  // GET /api/categories - Returns all categories
  fastify.get("/categories", getAllCategories);
};

/**
 * PRODUCT ROUTES
 * Base path: /api/products
 */
export const productRoutes = async (fastify, options) => {
  /**
   * IMPORTANT: Order matters in routes!
   * /search must come BEFORE /:categoryId
   * Otherwise "search" will be treated as a categoryId
   */

  // GET /api/products/search?q=milk&minPrice=10&maxPrice=100
  // Query params: q, category, minPrice, maxPrice, sort, limit, page
  fastify.get("/products/search", searchProducts);

  // GET /api/products/:categoryId - Get products by category
  fastify.get("/products/:categoryId", getProductsByCategoryId);
};
