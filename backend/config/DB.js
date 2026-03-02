const mongoose = require("mongoose")
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURI);

        console.log("MongoDB Connected successfully");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;