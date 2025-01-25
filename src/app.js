const express = require("express");

const app = express();

app.get("/",(req, res) => {
    res.send("Hello from the server");  //request handler
})

app.get("/test",(req, res) => {
    res.send("Hello from the test");  //request handler
})

app.get("/hello",(req, res) => {
    res.send("Hello hello hello");  //request handler
})

app.listen(3000, ()=>{
    console.log("Successfully started")
});