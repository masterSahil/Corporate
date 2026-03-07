const productSchema = require("../model/product")

module.exports.getProduct = async(req, res) => {
    try {
        const fetched = await productSchema.find({isDeleted: false});

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

module.exports.getAllProduct = async(req, res) => {
    try {
        const fetchedAll = await productSchema.find();

        res.status(200).json({
            success: true,
            product: fetchedAll,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.createProduct = async(req, res) => {
    try {
        const {name, category, brand, price, discount, quantity, description, gallery} = req.body;
        const productData = {name, category, brand, price, discount, quantity, description, gallery};

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }

        if (discount && (discount < 0 || discount > 100)) {
            return res.status(400).json({
                success: false,
                message: "Discount must be between 0 and 100"
            });
        }

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
        const {name, category, brand, price, discount, quantity, description, isDeleted, gallery} = req.body;
        const productData = {name, category, brand, price, discount, quantity, description, gallery, isDeleted};

        if (price !== undefined && price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }

        if (discount !== undefined && (discount < 0 || discount > 100)) {
            return res.status(400).json({
                success: false,
                message: "Discount must be between 0 and 100"
            });
        }

        if (req.files && req.files.length > 0) {
            productData.gallery = req.files.map(file => ({
                fileUrl: file.path,
                filePublicId: file.filename,
                fileType: file.mimetype.startsWith("video/") ? "video" : "image"
            }));
        }

        const updated = await productSchema.findByIdAndUpdate(req.params.id, productData, 
            {returnDocument: 'after'});

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product: updated,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.softDeleted = async(req, res) => {
    try {
        const softDelete = await productSchema.findByIdAndUpdate(req.params.id, {isDeleted: true}, {returnDocument: 'after'});

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