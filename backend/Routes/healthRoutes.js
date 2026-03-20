const express = require("express")
const router = express.Router();

router.get('/health', (req, res) => {
    res.send("Health Route");
    // res.status(200).json({
    //     success: true,
    //     message: "Backend is Running",
    // })
})

module.exports = router;