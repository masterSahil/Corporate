const cartSchema = require("../model/cart")
const userSchema = require("../model/user")
const productSchema = require("../model/product")
const Order = require("../model/order")

module.exports.checkout = async (req, res) => {
    try {
        const { userId, items, pointsUsed } = req.body;
        if (!userId || !items || items.length === 0) {
            throw new Error("Cart is empty or user is invalid.");
        }

        let orderSubtotal = 0;
        const orderItemsSnapshot = [];

        // 1. VALIDATE STOCK AND PREPARE ORDER DATA
        for (let i of items) {
            const product = await productSchema.findById(i.productId);
            if (!product) {
                throw new Error(`Product ${i.productId} not found.`);
            }
            if (product.quantity < i.quantity) {
                throw new Error(`Not enough stock for ${product.name}.`);
            }

            // Calculate subtotal
            const itemTotal = product.price * i.quantity;
            orderSubtotal += itemTotal;

            // Push to snapshot array
            orderItemsSnapshot.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: i.quantity
            });

            // Deduct stock
            product.quantity -= i.quantity;
            await product.save();
        }

        // 2. DEDUCT USER POINTS
        if (pointsUsed > 0) {
            const user = await userSchema.findById(userId);
            if (!user || (user.points || 0) < pointsUsed) {
                throw new Error("Insufficient points.");
            }
            user.points -= pointsUsed;
            await user.save();
        }

        // 3. CREATE THE ORDER RECORD
        const finalTotal = orderSubtotal - (pointsUsed || 0);
        const newOrder = new Order({
            userId,
            items: orderItemsSnapshot,
            subtotal: orderSubtotal,
            pointsUsed: pointsUsed || 0,
            finalTotal: finalTotal < 0 ? 0 : finalTotal,
            status: 'Pending'
        });
        await newOrder.save();

        // 4. CLEAR THE USER'S CART
        await cartSchema.deleteMany({ buyerId: userId });
        res.status(200).json({
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder._id
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message,
        });
    }
}

// Fetch orders for a specific user
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch orders for a specific user
module.exports.getUserOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch orders for a specific user
module.exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: newStatus } = req.body;

        // 1. Get the current state of the order
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const oldStatus = order.status;

        // If no change, just return
        if (oldStatus === newStatus) {
            return res.status(200).json({ success: true, order });
        }

        // --- SCENARIO 1: MOVING TO 'CANCELLED' (REFUND) ---
        if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
            const refundPromises = [];

            // Restore Product Stock
            for (const item of order.items) {
                refundPromises.push(
                    productSchema.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } })
                );
            }

            // Restore User Points
            if (order.pointsUsed > 0) {
                refundPromises.push(
                    userSchema.findByIdAndUpdate(order.userId, { $inc: { points: order.pointsUsed } })
                );
            }
            await Promise.all(refundPromises);
        }

        // --- SCENARIO 2: REVERTING FROM 'CANCELLED' (RE-DEDUCT) ---
        if (oldStatus === "Cancelled" && newStatus !== "Cancelled") {
            // Check if user has the points to re-purchase
            const user = await userSchema.findById(order.userId);
            if (order.pointsUsed > 0 && (user?.points || 0) < order.pointsUsed) {
                return res.status(400).json({ success: false, message: "User has insufficient points to re-open this order." });
            }

            // Check if stock is still available to re-deduct
            for (const item of order.items) {
                const product = await productSchema.findById(item.productId);
                if (!product || product.quantity < item.quantity) {
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
                }
            }

            // Perform re-deduction
            const deductPromises = [];
            for (const item of order.items) {
                deductPromises.push(
                    productSchema.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } })
                );
            }
            if (order.pointsUsed > 0) {
                deductPromises.push(
                    userSchema.findByIdAndUpdate(order.userId, { $inc: { points: -order.pointsUsed } })
                );
            }
            await Promise.all(deductPromises);
        }

        // 2. Finally, save the new status
        order.status = newStatus;
        const updatedOrder = await order.save();

        res.status(200).json({ 
            success: true, 
            message: `Status changed to ${newStatus}`, 
            order: updatedOrder 
        });

    } catch (error) {
        console.error("Order Update Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};