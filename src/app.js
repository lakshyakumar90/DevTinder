const express = require("express");

const app = express();

app.use("/user/:userId", (req, res, next) => {
    console.log("Hello 1");
    // res.send("Got a GET request at /user/:userId");
    next();
    },
    (req, res, next) => {
        console.log("Hello 2");
        // res.send("Got a GET request at /user/:userId");
        next();
    },
    (req, res, next) => {
        console.log("Hello 3");
        res.send("Got a GET request at /user/:userId");
        next();
    }
)

app.get("/abcd", (req, res) => {
    console.log(req.query);
    res.send("Got a GET request at /abcd with query params: " + req.query);
})

//  '/abcd' and '/abLakshyacd' both works => anythinf b/w ab and cd
app.get("/ab*cd", (req, res) => {
    res.send("Got a GET request at /ab*cd")
})

app.listen(3000, () => {
    console.log("Successfully started")
});