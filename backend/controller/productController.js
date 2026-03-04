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
        const {name, category, brand, price, discount, quantity, description} = req.body;
        const newProduct = new productSchema({name, category, brand, price, discount, quantity, description});

        await newProduct.save();

        res.status(200).json({
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
        const {name, category, brand, price, discount, quantity, description, isDeleted} = req.body;
        const updated = await productSchema.findByIdAndUpdate(req.params.id, 
            {name, category, brand, price, discount, quantity, description, isDeleted}, 
            {returnDocument: 'after'});

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