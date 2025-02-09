require('dotenv').config();
const mongoose = require("mongoose");


const connectDB = async () =>{
    await mongoose.connect(process.env.MONGO_DB_URL);
}

module.exports = connectDB;

