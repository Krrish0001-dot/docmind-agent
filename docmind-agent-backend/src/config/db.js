const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectDB(){
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected");

    mongoose.connection.on("disconnected",() => {
        logger.warn("MongoDB disconnected");
    });
}

module.exports = connectDB;