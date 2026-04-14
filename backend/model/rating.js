const {Schema, model} = require("mongoose")

const ratingSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: "Products_Schema"},
    buyerId: { type: Schema.Types.ObjectId, ref: "User_Schema" },
    rate: {type: Number},
    review: {type: String},
    createdAt: {type: Date, default: Date.now},
})

module.exports = model("ratings", ratingSchema);