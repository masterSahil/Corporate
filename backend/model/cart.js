const {Schema, model} = require("mongoose")

const cartSchema = new Schema({
    buyerId: {type: String},
    productId: {type: String},
    quantity: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
})

module.exports = model("Carts", cartSchema);