const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const app = express();
const { validateSignupData, validateUserUpdate } = require("./utils/validation");

app.use(express.json());

app.post("/signup", async (req, res) => {
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

app.get("/feed", async (req, res) => {
    try {
        const user = await User.find();
        if (user.length === 0) {
            res.status(404).send("Something went wrong: No users found");
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
})

app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        // const user = await User.findByIdAndDelete({_id: userId});

        if (!user) {
            res.status(404).send("User not found");
        } else {
            res.send("User deleted successfully");
        }
    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
})

app.patch("/user/:userId", async (req, res) => {
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



connectDB().then(() => {
    console.log("Successfully connected to the database");
    app.listen(3000, () => {
        console.log("Successfully started")
    });
}).catch((err) => {
    console.error("Error connecting to the database");
    console.log(err);
})