const express = require('express');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const bcrypt = require("bcrypt");

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
    try{
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
    try{
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

module.exports = profileRouter;