require('dotenv').config();

const express = require("express");
const http = require("http");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./utils/cronjob");
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const requestRouter = require("./routes/requests");
const imageUploadRouter = require('./routes/imageUpload');
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", userRouter);
app.use("/", requestRouter);
app.use("/", imageUploadRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB().then(() => {
    console.log("Successfully connected to the database");
    server.listen( process.env.PORT, () => {
        console.log("Successfully started")
    });
}).catch((err) => {
    console.error("Error connecting to the database");
    console.log(err);
})