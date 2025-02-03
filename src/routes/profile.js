const express = require('express');
const { validateUserUpdate } = require('../utils/validation');
const User = require('../models/user');

const profileRouter = express.Router();

profileRouter.patch("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { update } = req.body;
    // Define an array of allowed fields for update.
    // Make sure to exclude 'email' or any other fields you don't want to allow.
    try {
        // Validate update fields and skills
        validateUserUpdate(req);
        // { new: true } returns the updated document.
        // { runValidators: true } runs schema validators on update.
        const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send("User updated successfully");
    } catch (err) {
        res.status(500).send("Update Validation failed: " + err.message);
    }
});

module.exports = profileRouter;