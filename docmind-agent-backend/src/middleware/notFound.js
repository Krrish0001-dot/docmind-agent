function notFound(req,res,next){
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${rerq.originalUrl}`,
    });
}
module.exports = notFound;