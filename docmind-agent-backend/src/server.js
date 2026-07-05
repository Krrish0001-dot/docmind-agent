require("dotenv").config();
const path = require("path");

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { connectToMcpServer } = require("./mcp/mcpClient");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

async function start(){
    try{
        await connectDB();
        await connectRedis();
        await connectToMcpServer(path.join(__dirname, "mcp/retrievalServer.js"));
        logger.info("MCP retrieval server connected");
        await connectToMcpServer(path.join(__dirname, "mcp/webSearchServer.js"));
        logger.info("MCP web search server connected");

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch(err) {
        logger.error("Failed to start server", err);
        process.exit(1);
    }
}

start();