const cartController = require("../controller/cartController");
const checkout = require("../controller/checkout");
const express = require('express');
const router = express.Router();
const {verifyUser} = require("../middleware/auth");

router.get('/cart-all', verifyUser, cartController.getAllCarts);
router.get('/cart', verifyUser, cartController.getCart);
router.post('/cart', verifyUser, cartController.createCart);
router.put('/cart/:id', verifyUser, cartController.updateCart);
router.delete('/cart/:id', verifyUser, cartController.deleteCart);

// --- ORIGINAL CHECKOUT (Used if cart is 100% paid with points, total = ₹0) ---
router.post('/checkout', verifyUser, checkout.checkout);

// --- NEW RAZORPAY ROUTES ---
router.post('/create-razorpay-order', verifyUser, checkout.createRazorpayOrder);
router.post('/verify-payment-and-checkout', verifyUser, checkout.verifyPaymentAndCheckout);

// orders all
router.get('/orders', verifyUser, checkout.getAllOrders);

// orders by specific user
router.post('/orders-user/:id', verifyUser, checkout.getUserOrders);

// orders update
router.patch('/order-status/:id', verifyUser, checkout.updateOrderStatus);

module.exports = router;