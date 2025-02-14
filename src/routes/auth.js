const express = require("express");
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();
const { welcomeEmail } = require("../utils/sendEmail");

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
        const emailContent = `
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
                    <div style="max-width: 600px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0,0,0,0.1); margin: auto;">
                    <h1 style="color: #ff4757;">Welcome to Tinder for Devs, ${firstName}! 🚀</h1>
                    <p style="font-size: 16px; color: #333;">
                        Thank you for signing up! We’re thrilled to have you in our developer community.  
                    </p>
                    <p style="font-size: 16px; color: #333;">
                        Connect with like-minded devs, share projects, and find your perfect coding match.
                    </p>
                    <a href="https://tinderfordevs.shop" target="_blank" style="
                        background-color: #ff4757;
                        color: white;
                        text-decoration: none;
                        padding: 12px 20px;
                        border-radius: 5px;
                        display: inline-block;
                        font-size: 16px;
                        margin-top: 10px;
                    ">Start Exploring</a>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                        Need help? <a href="mailto:support@tinderfordevs.shop" style="color: #ff4757; text-decoration: none;">Contact Support</a>
                    </p>
                    <p style="font-size: 12px; color: #999; margin-top: 10px;">
                        © 2025 Tinder for Devs | All rights reserved.
                    </p>
                    </div>
                </body>
            </html>
        `;
        const emailResponse = await welcomeEmail(user.email, emailSubject, emailContent);
        console.log("Email sent:", emailResponse);

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
    res.json({
        message: "Logged out successfully",
    })
})

module.exports = authRouter;