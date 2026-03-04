const {Schema, model} = require("mongoose")

const productSchema = new Schema({
    name: {type: String},
    category: {type: String},
    brand: {type: String},
    price: {type: Number},
    discount: {type: Number},
    quantity: {type: Number},
    description: {type: String},
    createdAt: {type: Date, default: Date.now()},
    isDeleted: {type: Boolean, default: false},

});

module.exports = model("Products_Schema", productSchema);