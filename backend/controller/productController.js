const cloudinary = require("../config/Cloudinary");
const productSchema = require("../model/product")
const UserSchema = require("../model/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

// Only Show Soft Deleted Products
module.exports.softDeletedView = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const skip = (page - 1) * limit;

        const [fetched, totalItems] = await Promise.all([
            productSchema.find({isDeleted: true}).sort({createdAt: -1}).skip(skip).limit(limit),
            productSchema.countDocuments({isDeleted: true})
        ]);

        res.status(200).json({
            success: true,
            product: fetched,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Hard Delete Products who are Soft Deleted
module.exports.permanentDelete = async (req, res) => {
    try {
        const { password } = req.body;
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found",
            });
        }

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token Not Found",
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        const loggedInUser = await UserSchema.findOne({ email: decoded.email });
        if (!loggedInUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isTruePassword = await bcrypt.compare(password, loggedInUser.password);
        if (!isTruePassword) {
            return res.status(409).json({
                success: false,
                message: "Password is Invalid",
            });
        }

        if (product.gallery?.length > 0) {
            for (const image of product.gallery) {
                if (image.filePublicId) {
                    await cloudinary.uploader.destroy(image.filePublicId);
                }
            }
        }
        const removed = await productSchema.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            product: removed,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Restore Product
module.exports.restoreProduct = async(req, res) => {
    try {
        const restored = await productSchema.findByIdAndUpdate(req.params.id, {isDeleted: false}, {returnDocument: 'after'} );

        res.status(200).json({
            success: true,
            product: restored,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getSingleProduct = async(req, res) => {
    try {
        const fetched = await productSchema.findById(req.params.id);

        res.status(200).json({
            success: true,
            product: fetched,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getProduct = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const skip = (page - 1) * limit;

        const [fetched, totalItems] = await Promise.all([
            productSchema.find({isDeleted: false}).sort({createdAt: -1}).skip(skip).limit(limit),
            productSchema.countDocuments({isDeleted: false})
        ]);

        res.status(200).json({
            success: true,
            product: fetched,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getAllProduct = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const skip = (page - 1) * limit;

        const [fetchedAll, totalItems] = await Promise.all([
            productSchema.find().sort({createdAt: -1}).skip(skip).limit(limit),
            productSchema.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            product: fetchedAll,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.createProduct = async (req, res) => {
    try {
        let {name, category, brand, price, discount, discountType, quantity, description } = req.body;

        const priceNum = Number(price);
        const discountNum = Number(discount);
        const quantityNum = Number(quantity);

        if (isNaN(priceNum) || isNaN(discountNum) || isNaN(quantityNum)) {
            return res.status(400).json({
                success: false,
                message: "Invalid numeric values"
            });
        }

        if (priceNum < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }

        if (discountNum < 0) {
            return res.status(400).json({
                success: false,
                message: "Discount cannot be negative"
            });
        }

        if (discountType === "percentage" && discountNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Percentage discount cannot exceed 100%"
            });
        }

        if (discountType === "flat" && discountNum > priceNum) {
            return res.status(400).json({
                success: false,
                message: "Flat discount cannot exceed product price"
            });
        }

        let finalPrice = priceNum;

        if (discountType === "percentage") {
            finalPrice = priceNum - (priceNum * discountNum) / 100;
        } else {
            finalPrice = priceNum - discountNum;
        }

        const productData = { 
            name, category, brand, price: priceNum, discount: discountNum, discountType, 
            quantity: quantityNum, description, finalPrice
        };

        if (req.files && req.files.length > 0) {
            productData.gallery = req.files.map(file => ({
                fileUrl: file.path,
                filePublicId: file.filename,
                fileType: file.mimetype.startsWith("video/") ? "video" : "image"
            }));
        }

        const newProduct = new productSchema(productData);
        await newProduct.save();

        res.status(201).json({
            success: true,
            product: newProduct,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.updateProduct = async(req, res) => {
    try {
        const {name, category, brand, price, discount, discountType, quantity, description, isDeleted, existingGallery} = req.body;
        
        // 1. Parse the images the user decided to KEEP
        let keptImages = existingGallery ? JSON.parse(existingGallery) : [];

        // 2. Safely delete removed images from Cloudinary to save storage
        const oldProduct = await productSchema.findById(req.params.id);
        if (oldProduct) {
            const keptPublicIds = keptImages.map(img => img.filePublicId);
            const imagesToDelete = oldProduct.gallery.filter(img => !keptPublicIds.includes(img.filePublicId));
            
            for (const img of imagesToDelete) {
                if (img.filePublicId) {
                    await cloudinary.uploader.destroy(img.filePublicId);
                }
            }
        }

        // 3. Format any brand new images uploaded
        let newUploadedImages = [];
        if (req.files && req.files.length > 0) {
            newUploadedImages = req.files.map(file => ({
                fileUrl: file.path,
                filePublicId: file.filename,
                fileType: file.mimetype.startsWith("video/") ? "video" : "image"
            }));
        }

        // 4. Combine kept images with new images
        const productData = {
            name, category, brand, price, discount, discountType, quantity, description, isDeleted, 
            gallery: [...keptImages, ...newUploadedImages] // Merges both arrays
        };

        const updated = await productSchema.findByIdAndUpdate(req.params.id, productData, {returnDocument: 'after'});

        res.status(200).json({
            success: true,
            product: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.softDeleted = async(req, res) => {
    try {
        const softDelete = await productSchema.findByIdAndUpdate(req.params.id, {isDeleted: true, deletedAt: Date.now()}, {returnDocument: 'after'});

        res.status(200).json({
            success: true,
            product: softDelete,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.hardDelete = async(req, res) => {
    try {
        const removed = await productSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            product: removed,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}