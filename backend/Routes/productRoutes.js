const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudinary");
const {verifyUser} = require("../middleware/auth");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "corporate_products", 
    } 
})

const upload = multer({storage, limits: {fileSize: 1 * 1024 * 1024 }}); // 1 mb max

router.get("/product", verifyUser, productController.getProduct);
router.get("/product-single/:id", verifyUser, productController.getSingleProduct);
router.get("/product-all", verifyUser, productController.getAllProduct);
router.post("/product", verifyUser, upload.array('gallery', 10), productController.createProduct);
router.put("/product/:id", verifyUser, upload.array('gallery', 10), productController.updateProduct);
router.delete("/product-delete/:id", verifyUser, productController.hardDelete);

// for doing soft delete
router.put("/product-soft-delete/:id", verifyUser, productController.softDeleted);

// soft deleted
router.get("/product-soft-delete-view", verifyUser, productController.softDeletedView);

// hard deleted
router.post("/hard-delete-product/:id", verifyUser, productController.permanentDelete);

// restore
router.put("/product-restore/:id", verifyUser, productController.restoreProduct);

module.exports = router;