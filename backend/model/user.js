const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    profile: {
        imageUrl: { type: String },
        imagePublicId: { type: String }
    },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number },
    isDeleted: { type: Boolean, default: false },
    gender: { type: String },
    department: {type: String},
    employment: {type: String},
    role: { 
        type: String, 
        enum: ["super_admin", "admin", "employee"], 
        default: "employee"
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = model("User_Schema", UserSchema);