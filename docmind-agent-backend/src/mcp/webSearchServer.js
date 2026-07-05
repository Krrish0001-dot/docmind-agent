require("dotenv").config();
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { tavily } = require("@tavily/core");

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

const server = new McpServer({
    name: "docmind-web-search",
    version: "1.0.0",
});

server.registerTool(
    "web-search",
    {
        title:"Web Search",
        description:
            "Search the web for current information, recent news, or general knowledge not available in the user's uploaded documents. " +
            "Use this when the question requires up-to-date facts or information clearly outside the uploaded files.",
        inputSchema: {
            query: z.string().describe("The search query to send to the web"),
        },
    },
    async ({ query }) => {
        const response = await tavilyClient.search(query, {
            maxResults: 5,
            searchDepth : "basic",
        });
        const formatted = response.results
            .map((r, i) => `[${i+1}] ${r.title}\n${r.url}\n${r.content}`)
            .join("\n\n");

            return {
                content: [{ type: "text",text: formatted || "No results found. "}],
            };
        }
);

async function main(){
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);