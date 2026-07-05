require("dotenv").config();
const path = require("path");
const { connectToMcpServer } = require("../mcp/mcpClient");
const { runAgent } = require("../services/agentService");

async function main(){
    const retrievalServerPath = path.join(__dirname, "../mcp/retrievalServer.js");
    await connectToMcpServer(retrievalServerPath);

    const result = await runAgent({
        message: "What is this document about?",
        userId: "b3966c96f3b22dc8fe10e182",
    });
    console.log("Answer:",result.answer);
    console.log("Tool calls:", JSON.stringify(result.toolCallLog, null, 2));
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});