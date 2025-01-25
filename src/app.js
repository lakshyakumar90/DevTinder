const express = require("express");

const app = express();

app.get("/user", (req, res) => {
    res.send("Hello from the user get");
})

app.post("/user", (req, res) => {
    res.send("Hello from the user post");
})

app.use("/test",(req, res) => {
    res.send("Hello from the test");  //request handler
})

app.listen(3000, ()=>{
    console.log("Successfully started")
});