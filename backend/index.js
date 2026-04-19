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
const cartRoutes = require("./Routes/cartRoutes")
const ratingRoutes = require("./Routes/ratingRoutes")
const loginGoogle = require("./Routes/loginGoogle")

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND, process.env.CUSTOM_DOMAIN],
}));
app.use('/', userRoutes); 
app.use('/', rewardRoutes); 
app.use('/', productRoutes); 
app.use('/', healthRoutes);
app.use('/', cartRoutes);
app.use('/', ratingRoutes);
app.use('/', loginGoogle);


app.listen(process.env.PORT, () => {
    console.log(`Server is Running on https://localhost:${process.env.PORT}`);
});