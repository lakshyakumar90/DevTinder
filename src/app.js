require('dotenv').config();

const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { validateSignupData, validateUserUpdate } = require("./utils/validation");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const requestRouter = require("./routes/requests");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", userRouter);
app.use("/", requestRouter);




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





connectDB().then(() => {
    console.log("Successfully connected to the database");
    app.listen(3000, () => {
        console.log("Successfully started")
    });
}).catch((err) => {
    console.error("Error connecting to the database");
    console.log(err);
})