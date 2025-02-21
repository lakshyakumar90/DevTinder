require('dotenv').config();

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Unauthorized access: Please Login with valid credentials");
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(403).json({
                message: 'User not found'
            })
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).send("Error: " + err.message);
    }
}

module.exports = { userAuth };