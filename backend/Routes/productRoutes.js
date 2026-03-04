const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");

router.get("/product", productController.getProduct);
router.get("/product-all", productController.getAllProduct);
router.post("/product", productController.createProduct);
router.put("/product/:id", productController.updateProduct);
router.put("/product-soft-delete/:id", productController.softDeleted);
router.delete("/product-delete/:id", productController.hardDelete);

module.exports = router;