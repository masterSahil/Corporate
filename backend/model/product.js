const {Schema, model} = require("mongoose")

const productSchema = new Schema({
    name: { type: String, trim: true },
    category: {type: String},
    brand: {type: String},
    price: {type: Number, min: 0},
    quantity: {type: Number, min: 0},
    discount: {type: Number },
    description: {type: String},
    gallery: {
        imageUrl: { type: String },
        imagePublicId: { type: String }
    },
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false},

});

module.exports = model("Products_Schema", productSchema);