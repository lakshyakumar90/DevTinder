const mongoose = require("mongoose");


const connectDB = async () =>{
    await mongoose.connect("mongodb+srv://lakshyakumar:AyG1MzHh3FUZOKXO@namatenode.xfyj9.mongodb.net/DevTinder");
}

module.exports = connectDB;

