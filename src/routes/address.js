/**
 * ============================================
 * ADDRESS ROUTES
 * ============================================
 * 
 * API endpoints for address management.
 * All routes require authentication.
 * 
 * Routes:
 * GET    /api/address           - Get all addresses
 * POST   /api/address           - Add new address
 * PUT    /api/address/:id       - Update address
 * DELETE /api/address/:id       - Delete address
 * PUT    /api/address/:id/default - Set as default
 * 
 * ============================================
 */

import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/address/address.js";

export const addressRoutes = async (fastify, options) => {
    // GET /api/address - Get all addresses for logged-in user
    fastify.get("/address", { preHandler: [fastify.authenticate] }, getAddresses);

    // POST /api/address - Add new address
    fastify.post("/address", { preHandler: [fastify.authenticate] }, addAddress);

    // PUT /api/address/:addressId - Update existing address
    fastify.put("/address/:addressId", { preHandler: [fastify.authenticate] }, updateAddress);

    // DELETE /api/address/:addressId - Delete address
    fastify.delete("/address/:addressId", { preHandler: [fastify.authenticate] }, deleteAddress);

    // PUT /api/address/:addressId/default - Set address as default
    fastify.put("/address/:addressId/default", { preHandler: [fastify.authenticate] }, setDefaultAddress);
};
