const express = require("express")
const router = express.Router();

router.get('/health', (req, res) => {
    res.send("Health Report: Backend is Running");
})

module.exports = router;