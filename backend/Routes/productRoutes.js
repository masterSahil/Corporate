const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "corporate_products",
    } 
})

const upload = multer({storage});

router.get("/product", productController.getProduct);
router.get("/product-all", productController.getAllProduct);
router.post("/product", upload.array('gallery', 10), productController.createProduct);
router.put("/product/:id", upload.array('gallery', 10), productController.updateProduct);
router.put("/product-soft-delete/:id", productController.softDeleted);
router.delete("/product-delete/:id", productController.hardDelete);

module.exports = router;