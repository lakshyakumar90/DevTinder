const express = require('express');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetPasswordEmail, sendOtpEmail } = require("../utils/sendEmail");
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

        const subject = "Password Reset Request - Tinder for Devs";

        const emailContentText = `
        Tinder for Devs
        
        Hi ${user.firstName || "User"},
        
        You requested to reset your password. Click the link below to proceed:
        
        Reset Password: ${resetURL}
        
        If you didn’t request a password reset, please ignore this email.  
        This link will expire in 30 minutes.
        
        © 2025 Tinder for Devs | All rights reserved.
        `;


        const emailres = await sendResetPasswordEmail(user.email, subject, emailContentText);
        console.log("Email sent:", emailres);
        res.status(200).json({ message: "Password reset link sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

profileRouter.post("/forgot-password/otp", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate OTP
        const otp = user.generateOTP();
        await user.save();
        await sendOtpEmail(user.email, otp);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }

});

profileRouter.post("/forgot-password/otp-verify", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP has expired
        if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Request a new one." });
        }

        // Hash provided OTP to compare with stored hashed OTP
        const hashedOTP = crypto.createHash("sha256").update(String(otp)).digest("hex");

        if (hashedOTP !== user.resetPasswordOTP) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Reset password
        user.password = await bcrypt.hash(newPassword, 10);; // You should hash the password before saving!
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).json({ message: "Password reset successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
})

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