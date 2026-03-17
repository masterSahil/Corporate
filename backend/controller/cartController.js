const cartSchema = require("../model/cart")
const userSchema = require("../model/user")
const productSchema = require("../model/product")
const mongoose = require("mongoose")

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

module.exports.checkout = async (req, res) => {
    try {
        const { userId, items, pointsUsed } = req.body;
        
        if (!userId || !items || items.length === 0) {
            throw new Error("Cart is empty or user is invalid.");
        }

        // 1. CHECK AND DEDUCT PRODUCT STOCK
        for (let i of items) {
            const product = await productSchema.findById(i.productId);

            if (!product) {
                throw new Error("A product in your cart could not be found.");
            }

            // Verify there is enough stock available
            if (product.quantity < i.quantity) {
                throw new Error(`Not enough stock for ${product.name}. Only ${product.quantity} left.`);
            }

            // Deduct the stock and save
            product.quantity -= i.quantity;
            await product.save();
        }

        // 2. DEDUCT USER POINTS (If they applied a discount)
        if (pointsUsed && pointsUsed > 0) {
            const user = await userSchema.findById(userId);
            
            if (!user) {
                throw new Error("User account not found.");
            }

            // Double check they aren't trying to spend more than they have
            if ((user.points || 0) < pointsUsed) {
                throw new Error(`Insufficient points. You only have ${user.points} available.`);
            }

            // Deduct the points and save
            user.points -= pointsUsed;
            await user.save();
        }

        // 3. CLEAR THE USER'S CART
        await cartSchema.deleteMany({ buyerId: userId });

        res.status(200).json({
            success: true,
            message: "Checkout successful! Stock and points updated.",
        });

    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message,
        });
    }
}