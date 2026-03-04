const express = require('express');
const app = express();
const connectDB = require("./config/DB");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// health route
const healthRoutes = require("./Routes/healthRoutes")

// routes
const userRoutes = require("./Routes/userRoutes")
const rewardRoutes = require("./Routes/rewardRoutes")
const productRoutes = require("./Routes/productRoutes")

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is Running on https://localhost:${process.env.PORT}`);
});

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: `${process.env.FRONTEND}`,
}));
app.use(cookieParser());
app.use('/', userRoutes); 
app.use('/', rewardRoutes); 
app.use('/', productRoutes); 
app.use('/', healthRoutes); 