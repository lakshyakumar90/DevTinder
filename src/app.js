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

connectDB().then(() => {
    console.log("Successfully connected to the database");
    app.listen(3000, () => {
        console.log("Successfully started")
    });
}).catch((err) => {
    console.error("Error connecting to the database");
    console.log(err);
})