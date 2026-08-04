const cartSchema = require("../model/cart");
const userSchema = require("../model/user");
const productSchema = require("../model/product");
const Order = require("../model/order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay Instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. ORIGINAL CHECKOUT (Bypasses Razorpay if order total is ₹0 after points)
module.exports.checkout = async (req, res) => {
    try {
        const { userId, items, pointsUsed } = req.body;
        if (!userId || !items || items.length === 0) {
            throw new Error("Cart is empty or user is invalid.");
        }

        let orderSubtotal = 0;
        const orderItemsSnapshot = [];
        const productsToDeduct = []; // Keep track of products to deduct later

        // STEP 1: VALIDATE STOCK (Do not deduct yet)
        for (let i of items) {
            const product = await productSchema.findById(i.productId);
            if (!product) throw new Error(`Product ${i.productId} not found.`);
            if (product.quantity < i.quantity) throw new Error(`Not enough stock for ${product.name}.`);

            const itemTotal = product.price * i.quantity;
            orderSubtotal += itemTotal;

            orderItemsSnapshot.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: i.quantity
            });

            productsToDeduct.push({ product, quantity: i.quantity });
        }

        // STEP 2: VALIDATE POINTS (Do not deduct yet)
        let user;
        if (pointsUsed > 0) {
            user = await userSchema.findById(userId);
            if (!user || (user.points || 0) < pointsUsed) {
                throw new Error("Insufficient points.");
            }
        }

        // STEP 3: CREATE & SAVE THE ORDER FIRST
        const finalTotal = orderSubtotal - (pointsUsed || 0);
        const newOrder = new Order({
            userId,
            items: orderItemsSnapshot,
            subtotal: orderSubtotal,
            pointsUsed: pointsUsed || 0,
            finalTotal: finalTotal < 0 ? 0 : finalTotal,
            status: 'Pending' // Reverted to valid Enum from your schema
        });
        
        // If this save fails (like a database validation error), it crashes here.
        // The catch block triggers, and NOTHING gets deducted!
        await newOrder.save();

        // STEP 4: IF ORDER SAVES SUCCESSFULLY, PROCESS DEDUCTIONS
        for (let item of productsToDeduct) {
            item.product.quantity -= item.quantity;
            await item.product.save();
        }

        if (pointsUsed > 0 && user) {
            user.points -= pointsUsed;
            await user.save();
        }

        // STEP 5: CLEAR CART
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
};

// 2. NEW: CREATE RAZORPAY ORDER (Called first from frontend before popup opens)
module.exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Razorpay expects amount in paise (multiply by 100)
        const options = {
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        };
        
        const order = await razorpayInstance.orders.create(options);
        
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
    }
};

// 3. NEW: VERIFY PAYMENT AND EXECUTE DB LOGIC (Called after user pays in popup)
module.exports.verifyPaymentAndCheckout = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            userId, 
            items, 
            pointsUsed 
        } = req.body;

        // VERIFY SIGNATURE
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature. Payment not verified." });
        }

        // PAYMENT IS LEGIT -> EXECUTE DATABASE LOGIC
        if (!userId || !items || items.length === 0) {
            throw new Error("Cart is empty or user is invalid.");
        }

        let orderSubtotal = 0;
        const orderItemsSnapshot = [];
        const productsToDeduct = [];

        // STEP 1: VALIDATE STOCK (Do not deduct yet)
        for (let i of items) {
            const product = await productSchema.findById(i.productId);
            if (!product) throw new Error(`Product ${i.productId} not found.`);
            if (product.quantity < i.quantity) throw new Error(`Not enough stock for ${product.name}.`);

            const itemTotal = product.price * i.quantity;
            orderSubtotal += itemTotal;

            orderItemsSnapshot.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: i.quantity
            });

            productsToDeduct.push({ product, quantity: i.quantity });
        }

        // STEP 2: VALIDATE POINTS (Do not deduct yet)
        let user;
        if (pointsUsed > 0) {
            user = await userSchema.findById(userId);
            if (!user || (user.points || 0) < pointsUsed) {
                throw new Error("Insufficient points.");
            }
        }

        // STEP 3: CREATE & SAVE THE ORDER FIRST
        const finalTotal = orderSubtotal - (pointsUsed || 0);
        const newOrder = new Order({
            userId,
            items: orderItemsSnapshot,
            subtotal: orderSubtotal,
            pointsUsed: pointsUsed || 0,
            finalTotal: finalTotal < 0 ? 0 : finalTotal,
            status: 'Pending', // Reverted to valid Enum from your schema
            paymentId: razorpay_payment_id 
        });
        
        await newOrder.save(); // Will throw an error and skip the rest if invalid

        // STEP 4: DEDUCT AFTER SUCCESSFUL SAVE
        for (let item of productsToDeduct) {
            item.product.quantity -= item.quantity;
            await item.product.save();
        }

        if (pointsUsed > 0 && user) {
            user.points -= pointsUsed;
            await user.save();
        }

        // STEP 5: CLEAR CART
        await cartSchema.deleteMany({ buyerId: userId });
        
        res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully!",
            orderId: newOrder._id
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. FETCH ALL ORDERS
module.exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const [orders, totalItems] = await Promise.all([
            Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. FETCH ORDERS FOR SPECIFIC USER
module.exports.getUserOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const [orders, totalItems] = await Promise.all([
            Order.find({ userId: id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments({ userId: id })
        ]);

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. UPDATE ORDER STATUS (Handles Cancelled Refunds and Re-Deductions)
module.exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: newStatus } = req.body;

        // Get the current state of the order
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

        // Finally, save the new status
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