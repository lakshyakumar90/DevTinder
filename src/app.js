require('dotenv').config();

const express = require("express");
const http = require("http");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressSession = require("express-session");

require("./utils/cronjob");
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,  // save session even if not modified
    saveUninitialized: false, // save session even if not initialized
    name: "session",
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
const { connectPassport } = require('./utils/Provider');
const passport = require('passport');

connectPassport();

app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

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
    server.listen(process.env.PORT, () => {
        console.log("Successfully started")
    });
}).catch((err) => {
    console.error("Error connecting to the database");
    console.log(err);
})