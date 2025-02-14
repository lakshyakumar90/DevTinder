const express = require('express');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetPasswordEmail } = require("../utils/sendEmail");
const sesSendEmail = require("../utils/sesSendEmail");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        validateEditProfileData(req);
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });
        await loggedInUser.save();
        res.json({
            message: loggedInUser.firstName + " your profile has been updated successfully",
            data: loggedInUser,
        })
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { oldPassword, newPassword } = req.body;
        const isValidPassword = await loggedInUser.validatePassword(oldPassword);
        if (isValidPassword) {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            loggedInUser.password = newHashedPassword;
            await loggedInUser.save();
            res.json({
                message: "Password updated successfully",
                data: loggedInUser,
            })
        } else {
            throw new Error("Invalid old password");
        }
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
});

profileRouter.post("/forgot-password", async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash and update the new password
        const isValidPassword = await user.validatePassword(oldPassword);
        if (isValidPassword) {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = newHashedPassword;
            await user.save();
            res.json({
                message: "Password updated successfully",
                data: user,
            })
        } else {
            res.status(400).json({ message: "Invalid old password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Something went wrong: " + err.message });
    }
});

profileRouter.post("/forgot-password/email", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

        await user.save();

        // Send reset email
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const emailSubject = "Password Reset Request - Tinder for Devs";

        const emailContent = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; max-width: 500px; margin: auto;">
            <h2 style="color: #ff4757;">Tinder for Devs</h2>
            <p style="font-size: 16px; color: #333;">
                Hi <strong>${user.firstName || "User"}</strong>,  
                <br/><br/>
                You requested to reset your password. Click the button below to proceed:
            </p>
            <a href="${resetURL}" target="_blank" style="
                background-color: #ff4757;
                color: white;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 10px;
            ">Reset Password</a>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                If you didn’t request a password reset, please ignore this email.  
                <br/>
                This link will expire in 30 minutes.
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                © 2025 Tinder for Devs | All rights reserved.
            </p>
        </div>
    `;

        const emailres = await sesSendEmail.run(user.email, emailSubject, emailContent);
        console.log("Email sent:", emailres);
        res.status(200).json({ message: "Password reset link sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

profileRouter.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Hash token and find user
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now log in." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

module.exports = profileRouter;