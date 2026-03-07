const {Schema, model} = require("mongoose")

const productSchema = new Schema({
    name: { type: String, trim: true },
    category: {type: String},
    brand: {type: String},
    price: {type: Number, min: 0},
    quantity: {type: Number, min: 0},
    discount: {type: Number },
    description: {type: String},
    gallery: [
        {
            fileUrl: { type: String },             // updated to match controller
            filePublicId: { type: String },        // updated
            fileType: { type: String, enum: ['image', 'video'], default: 'image' } // updated
        }
    ],
    createdAt: {type: Date, default: Date.now},
    isDeleted: {type: Boolean, default: false},

});

module.exports = model("Products_Schema", productSchema);