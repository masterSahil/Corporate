const jwt = require("jsonwebtoken");

module.exports.verifyUser = (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ authenticated: false, message: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        return res.status(200).json({ authenticated: true, user: decoded });
    } catch (error) {
        return res.status(401).json({ authenticated: false, message: error.message });
    }
};

// used in userRoutes.js 