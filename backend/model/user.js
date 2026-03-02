const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    gender: { type: String },
    role: { 
        type: String, 
        enum: ["super_admin", "admin", "employee"], 
        default: "employee"
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = model("User_Schema", UserSchema);