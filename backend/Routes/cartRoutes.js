const cartController = require("../controller/cartController");
const checkout = require("../controller/checkout");
const express = require('express');
const router = express.Router();

router.get('/cart-all', cartController.getAllCarts);
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.createCart);
router.put('/cart/:id', cartController.updateCart);
router.delete('/cart/:id', cartController.deleteCart);

// --- ORIGINAL CHECKOUT (Used if cart is 100% paid with points, total = ₹0) ---
router.post('/checkout', checkout.checkout);

// --- NEW RAZORPAY ROUTES ---
router.post('/create-razorpay-order', checkout.createRazorpayOrder);
router.post('/verify-payment-and-checkout', checkout.verifyPaymentAndCheckout);

// orders all
router.get('/orders', checkout.getAllOrders);

// orders by specific user
router.post('/orders-user/:id', checkout.getUserOrders);

// orders update
router.patch('/order-status/:id', checkout.updateOrderStatus);

module.exports = router;