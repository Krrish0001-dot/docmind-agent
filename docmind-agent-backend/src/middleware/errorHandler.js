const logger = require("../utils/logger");

function errorHandler(err,req,res,next){
    const statusCode = err.statusCode || 500;
    logger.error(err.message,err);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

module.exports = errorHandler;