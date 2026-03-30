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

const upload = multer({storage, limits: {fileSize: 1 * 1024 * 1024 }}); // 1 mb max

router.get("/product", productController.getProduct);
router.get("/product-single/:id", productController.getSingleProduct);
router.get("/product-all", productController.getAllProduct);
router.post("/product", upload.array('gallery', 10), productController.createProduct);
router.put("/product/:id", upload.array('gallery', 10), productController.updateProduct);
router.delete("/product-delete/:id", productController.hardDelete);

// for doing soft delete
router.put("/product-soft-delete/:id", productController.softDeleted);

// soft deleted
router.get("/product-soft-delete-view", productController.softDeletedView);

// hard deleted
router.post("/hard-delete-product/:id", productController.permanentDelete);

// restore
router.put("/product-restore/:id", productController.restoreProduct);

module.exports = router;