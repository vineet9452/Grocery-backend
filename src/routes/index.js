/**
 * ============================================
 * ROUTES INDEX
 * ============================================
 * 
 * Central file that registers all API routes.
 * 
 * Available Route Groups:
 * - /api/auth - Authentication routes
 * - /api/products - Product routes
 * - /api/categories - Category routes
 * - /api/orders - Order routes
 * - /api/address - Address routes
 * - /api/payment - Payment routes (Razorpay)
 * 
 * ============================================
 */

import { authRoutes } from "./auth.js";
import { orderRoutes } from "./order.js";
import { categoryRoutes, productRoutes } from "./products.js";
import { addressRoutes } from "./address.js";
import { paymentRoutes } from "./payment.js";  // Razorpay

const prefix = "/api";

export const registerRoutes = async (fastify) => {
  fastify.register(authRoutes, { prefix: prefix });
  fastify.register(productRoutes, { prefix: prefix });
  fastify.register(categoryRoutes, { prefix: prefix });
  fastify.register(orderRoutes, { prefix: prefix });
  fastify.register(addressRoutes, { prefix: prefix });
  fastify.register(paymentRoutes, { prefix: prefix });  // Razorpay
};
