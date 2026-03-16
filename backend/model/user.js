const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    profile: {
        imageUrl: { type: String },
        imagePublicId: { type: String }
    },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    isDeleted: { type: Boolean, default: false },
    gender: { type: String },
    department: {type: String},
    employment: {type: String}, // part-time, full-time, contract etc 
    role: { 
        type: String, 
        enum: ["super_admin", "admin", "employee"], 
        default: "employee"
    },
    points: {type: Number, default: 0},
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

module.exports = model("User_Schema", UserSchema);