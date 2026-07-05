const path = require("path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

const registeredTools = new Map();

async function connectToMcpServer(serverScriptPath){
    const transport = new StdioClientTransport({
        command: "node",
        args: [serverScriptPath],
        env: { ...process.env },
    });
    const client = new Client({ name: "docmind-agent-client", version: "1.0.0" });
    await client.connect(transport);

    const { tools } = await client.listTools();
    for(const tool of tools){
        registeredTools.set(tool.name, { client, definition: tool });
    }
    return client;
}

function getAllToolDefinitions(){
    return Array.from(registeredTools.values()).map((entry) => entry.definition);
}

async function callTool(toolName, args){
    const entry = registeredTools.get(toolName);
    if(!entry){
        throw new Error(`No MCP server registered for tool: ${toolName}`);
    }
    return entry.client.callTool({ name: toolName, arguments: args });
}

module.exports = { connectToMcpServer, getAllToolDefinitions, callTool };