require('dotenv').config();

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async(req, res, next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("No token provided");
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if(!user){
            throw new Error("User not found");
        }
        req.user = user;
        next();
    }catch(err){
        res.status(401).send("Error: " + err.message);
    }
}

module.exports = { userAuth };