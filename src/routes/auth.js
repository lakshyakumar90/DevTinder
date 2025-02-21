const express = require("express");
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();
const { welcomeEmail } = require("../utils/sendEmail");
const passport = require("passport");

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignupData(req);
        const { firstName, lastName, email, password, age, experienceLevel, location, gender, education, profileSummary } = req.body;
        // Hashing password
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
            education,
            profileSummary
        });
        await user.save();
        // Sign JWT and log the user in immediately after signup
        const emailSubject = "Welcome to the community!";

        const emailContentText = `
        Welcome to Tinder for Devs, ${firstName}! 🚀
        
        Thank you for signing up! We’re thrilled to have you in our developer community.
        
        Connect with like-minded devs, share projects, and find your perfect coding match.
        
        Start Exploring: https://tinderfordevs.shop
        
        Need help? Contact Support: support@tinderfordevs.shop
        
        © 2025 Tinder for Devs | All rights reserved.
        `;

        const emailResponse = await welcomeEmail(user.email, emailSubject, emailContentText);
        const token = await user.signJWT();
        res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        res.json({
            message: "Signed up successfully",
            data: user,
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                message: "Invalid Credentials"
            })
        }
        const isValidPassword = await user.validatePassword(password);

        if (isValidPassword) {
            const token = await user.signJWT();
            res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            res.json({
                message: "Logged in successfully",
                data: user,
            })
        } else {
            throw new Error("Invalid Credentials");
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
})

authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.clearCookie("session");
    res.json({
        message: "Logged out successfully",
    })
})

authRouter.get("/googlelogin", passport.authenticate("google", {
    scope: ["profile", "email"],
}))

authRouter.get("/auth/google/callback", passport.authenticate("google",
    {
        scope: ["profile", "email"],
        failureRedirect: "/login",
    }),
    async (req, res) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized access: Please Login with valid credentials",
            });
        }
        try {
            const user = req.user;
            const token = await user.signJWT();
            res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            res.json({
                message: "Logged in successfully",
                data: user,
            })
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
);

module.exports = authRouter;