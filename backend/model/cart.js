const {Schema, model} = require("mongoose")

const cartSchema = new Schema({
    buyerId: {type: String},
    productId: {type: String},
    quantity: {type: Number},
    createdAt: {type: Date, default: Date.now},
})

module.exports = model("Carts", cartSchema);