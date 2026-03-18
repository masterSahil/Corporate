const {Schema, model} = require("mongoose");

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  subtotal: { type: Number, required: true },
  pointsUsed: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = model("Order", orderSchema);