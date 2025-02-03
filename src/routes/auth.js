const express = require("express");
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignupData(req);
        const { firstName, lastName, email, password, age, experienceLevel, location, gender } = req.body;
        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            age,
            experienceLevel,
            location,
            gender,
            password: hashedPassword,
        });
        console.log(user);

        await user.save();
        res.send("User created successfully");
    } catch (err) {
        res.status(500).send("ERROR: " + err.message);
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isValidPassword = await user.validatePassword(password);

        if (isValidPassword) {
            const token = await user.signJWT();
            res.cookie("token", token, {expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)});
            res.send("Login successful");
        } else {
            throw new Error("Invalid Credentials");
        }

    } catch (err) {
        res.status(500).send("ERROR: " + err.message);
    }
})

module.exports = authRouter;