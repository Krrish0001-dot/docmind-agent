require("dotenv").config();
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { embedChunks } = require("../services/embeddingService");
const { queryChunks } = require("../services/pineconeService");

const server = new McpServer({ name:"docmind-retrieval", version: "1.0.0"});

server.registerTool(
    "search_documents",
    {
        title: "Search Documents",
        description: "Search the user's uploaded documents for chunks relevant to a question",
        inputSchema: {
            query: z.string(),
            userId: z.string(),
        },
    },

    async ({ query, userId }) => {
        const [vector] = await embedChunks([query], "RETRIEVAL_QUERY");
        const matches = await queryChunks({ userId, vector, topK: 5});
        
        if(matches.length === 0){
            return{
                content: [{ type: "text",text : "No relevant document chunks found."}],
            };
        }
        const text = matches
        .map((m,i) => `[${i + 1}] (score: ${m.score.toFixed(3)}, doc: ${m.documentId})\n${m.text}`)
        .join("\n\n");

        return {
            content: [{ type: "text", text}],
        };
    }
);

async function start(){
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

start();