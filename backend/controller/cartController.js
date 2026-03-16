const cartSchema = require("../model/cart")

module.exports.getAllCarts = async (req, res) => {
    try {
        const cart = await cartSchema.find();

        res.status(200).json({
            success: true,
            cart,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.getCart = async (req, res) => {
    try {
        const cart = await cartSchema.findById(req.params.id);

        res.status(200).json({
            success: true,
            cart,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.createCart = async (req, res) => {
    try {
        const {buyerId, productId, quantity} = req.body;
        const cart = new cartSchema({buyerId, productId, quantity});

        await cart.save();
        res.status(201).json({
            success: true,
            cart,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.updateCart = async (req, res) => {
    try {
        const {buyerId, productId, quantity} = req.body;
        const cart = await cartSchema.findByIdAndUpdate(req.params.id, {buyerId, productId, quantity}, {returnDocument: 'after'});

        res.status(200).json({
            success: true,
            cart,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteCart = async (req, res) => {
    try {
        const cart = await cartSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            cart,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}