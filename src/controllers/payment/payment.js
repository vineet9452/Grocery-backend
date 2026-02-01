import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../../models/order.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 */
export const createPaymentOrder = async (req, reply) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return reply.status(400).send({ message: "Invalid amount" });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return reply.send({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.log("Create Payment Order Error:", error);
        return reply.status(500).send({
            message: "Failed to create payment order",
            error: error.message
        });
    }
};

/**
 * Verify Payment Signature
 * POST /api/payment/verify
 */
export const verifyPayment = async (req, reply) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Our app's order ID
        } = req.body;

        // Generate signature for verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            // Update order with payment details
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: "paid",
                    paymentMethod: "ONLINE",
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                });
            }

            return reply.send({
                success: true,
                message: "Payment verified successfully",
                payment_id: razorpay_payment_id,
            });
        } else {
            return reply.status(400).send({
                success: false,
                message: "Payment verification failed",
            });
        }
    } catch (error) {
        console.log("Verify Payment Error:", error);
        return reply.status(500).send({
            message: "Payment verification failed",
            error: error.message
        });
    }
};
