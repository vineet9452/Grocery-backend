/**
 * ============================================
 * PRODUCT CONTROLLER
 * ============================================
 * 
 * This file handles all product-related API logic.
 * 
 * APIs in this file:
 * 1. getProductsByCategoryId - Get products by category
 * 2. searchProducts - Search products with filters (NEW!)
 * 
 * ============================================
 */

import Product from "../../models/products.js";

/**
 * GET PRODUCTS BY CATEGORY ID
 * 
 * Purpose: Fetch all products belonging to a specific category
 * Route: GET /api/products/:categoryId
 * 
 * @param {Object} req - Request object with categoryId in params
 * @param {Object} reply - Fastify reply object
 */
export const getProductsByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId })
      .select("-category")  // Exclude category field from response
      .exec();

    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

/**
 * ============================================
 * SEARCH PRODUCTS API (NEW!)
 * ============================================
 * 
 * Purpose: Search products with multiple filters
 * Route: GET /api/products/search
 * 
 * Query Parameters:
 * - q: Search query (searches in name)
 * - category: Filter by category ID
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - sort: Sorting option (price_asc, price_desc, name_asc, name_desc)
 * - limit: Number of results (default 20)
 * - page: Pagination (default 1)
 * 
 * Example: /api/products/search?q=milk&minPrice=10&maxPrice=100&sort=price_asc
 * 
 * @param {Object} req - Request with query parameters
 * @param {Object} reply - Fastify reply object
 */
export const searchProducts = async (req, reply) => {
  try {
    // ========== STEP 1: Extract query parameters ==========
    const {
      q,           // Search query text
      category,    // Category ID filter
      minPrice,    // Minimum price
      maxPrice,    // Maximum price
      sort,        // Sorting option
      limit = 20,  // Results per page (default 20)
      page = 1     // Current page (default 1)
    } = req.query;

    // ========== STEP 2: Build the query object ==========
    // Start with an empty query object
    let query = {};

    // If search query 'q' is provided, search in product name
    // Using regex for partial matching (like SQL's LIKE %query%)
    if (q && q.trim() !== '') {
      query.name = {
        $regex: q.trim(),  // Match products containing this text
        $options: 'i'      // 'i' = case-insensitive search
      };
    }

    // If category filter is provided
    if (category) {
      query.category = category;
    }

    // If price range is provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);  // Greater than or equal
      if (maxPrice) query.price.$lte = Number(maxPrice);  // Less than or equal
    }

    // ========== STEP 3: Build sort options ==========
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };      // Low to High
        break;
      case 'price_desc':
        sortOption = { price: -1 };     // High to Low
        break;
      case 'name_asc':
        sortOption = { name: 1 };       // A to Z
        break;
      case 'name_desc':
        sortOption = { name: -1 };      // Z to A
        break;
      default:
        sortOption = { createdAt: -1 }; // Newest first (default)
    }

    // ========== STEP 4: Calculate pagination ==========
    const skip = (Number(page) - 1) * Number(limit);

    // ========== STEP 5: Execute the query ==========
    const products = await Product.find(query)
      .populate('category', 'name image')  // Include category info
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    // ========== STEP 6: Get total count for pagination ==========
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / Number(limit));

    // ========== STEP 7: Send response ==========
    return reply.send({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    });

  } catch (error) {
    console.error("Search Error:", error);
    return reply.status(500).send({
      success: false,
      message: "Search failed",
      error: error.message
    });
  }
};
