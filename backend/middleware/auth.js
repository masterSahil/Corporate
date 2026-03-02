const jwt = require("jsonwebtoken");
const { findOne } = require("../model/user");

module.exports.verifyUser = (req, res) => {
    const token = req.cookies.corporate_token;

    if (!token) {
        return res.status(401).json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        return res.status(200).json({ authenticated: true, user: decoded });
    } catch (error) {
        return res.status(401).json({ authenticated: false });
    }
};



// used in userRoutes.js 