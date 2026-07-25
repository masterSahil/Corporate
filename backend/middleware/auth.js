const jwt = require("jsonwebtoken");

module.exports.verifyUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ authenticated: false, message: "Token not found" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        if (!decoded) {
            return res.status(401).json({ authenticated: false, message: "Token is not valid" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ authenticated: false, message: error.message });
    }
};