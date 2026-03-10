const {Schema, model} = require("mongoose")

const rewardSchema = new Schema({
    title: {type: String},
    category: {type: String},
    description: {type: String},
    email: {type: String},
    status: {
        type: String,
        enum: ["Issued", "Redeemed", "Unassigned"],
        default: "Unassigned"
    },
    isDeleted: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    deletedAt: {type: Date, default: null},
});

module.exports = model("Reward_Schema", rewardSchema);