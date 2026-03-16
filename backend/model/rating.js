const {Schema, model} = require("mongoose")

const ratingSchema = new Schema({
    productId: {type: String},
    buyerId: {type: String},
    rate: {type: Number},
    review: {type: String},
    createdAt: {type: Date, default: Date.Now},
})

module.exports = model("ratings", ratingSchema);