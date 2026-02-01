import { createPaymentOrder, verifyPayment } from "../controllers/payment/payment.js";
import { verifyToken } from "../middleware/auth.js";

export const paymentRoutes = async (fastify, options) => {
    // Create Razorpay order
    fastify.post("/payment/create-order", {
        preHandler: [verifyToken],
        handler: createPaymentOrder,
    });

    // Verify payment after completion
    fastify.post("/payment/verify", {
        preHandler: [verifyToken],
        handler: verifyPayment,
    });
};
