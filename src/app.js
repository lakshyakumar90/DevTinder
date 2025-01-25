const express = require("express");

const app = express();
const { adminAuth, userAuth } = require("./middlewareas/auth");

//handle all requests => Auth Middleware
app.use("/admin", adminAuth);
// app.use("/user", userAuth);

app.get("/admin/getAllData", (req, res, next) => {
    res.send("All data available");
})

app.get("/admin/deleteUser", (req, res, next) => {
    res.send("User deleted successfully");
})

app.get("/user/getData", userAuth, (req, res, next) => {
    res.send("User data available");
})

app.listen(3000, () => {
    console.log("Successfully started")
});