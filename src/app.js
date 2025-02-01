const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
    // const user = new User({
    //     firstName: "John",
    //     lastName: "Doe",
    //     email: "john.doe@example.com",
    //     password: "hashedPassword123",
    //     bio: "Full-stack developer with a passion for creating innovative web applications. Love collaborating on open-source projects.",
    //     skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    //     experienceLevel: "Advanced",
    //     location: "San Francisco, CA",
    // });
    const user = new User(req.body);
    try {
        await user.save();
        res.send("User created successfully");
    } catch (err) {
        res.status(500).send("Error creating user: " + err.message);
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
    const update = req.body.update;
    const skills = req.body.skills;

    // Define an array of allowed fields for update.
    // Make sure to exclude 'email' or any other fields you don't want to allow.
    try {
        const allowedUpdates = [
            'firstName',
            'lastName',
            'password',
            'age',
            'bio',
            'skills',
            'experienceLevel',
            'location',
            'profilePicture',
            'gender',
        ];

        // Extract the keys from the update object.
        const updateKeys = Object.keys(update);

        // Check if every key in the update is in the allowedUpdates list.
        const isValidOperation = updateKeys.every((key) => allowedUpdates.includes(key));

        if (skills) {
            if (skills.length > 12) {
                throw new Error("You can only have up to 12 skills");
            }
        }

        if (!isValidOperation) {
            throw new Error("Invalid updates! Only allowed fields can be updated and email cannot be updated.");
        }

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