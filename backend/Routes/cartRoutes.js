const cartController = require("../controller/cartController");
const express = require('express');
const router = express.Router();

router.get('/cart-all', cartController.getAllCarts);
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.createCart);
router.put('/cart/:id', cartController.updateCart);
router.delete('/cart/:id', cartController.deleteCart);

module.exports = router;