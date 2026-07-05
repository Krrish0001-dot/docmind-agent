const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const documentsRouter = require("./routes/documents");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max : 100,
});
app.use(limiter);

app.use("/api/documents", documentsRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/auth",authRoutes);
app.get("/health",(rq,res)=>{
    res.status(200).json({success:true, message: "DocMind Agent API is running"});
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;