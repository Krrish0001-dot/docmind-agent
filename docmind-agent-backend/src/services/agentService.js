const { GoogleGenAI, createUserContent, createModelContent, createPartFromFunctionCall, createPartFromFunctionResponse } = require("@google/genai");
const { getAllToolDefinitions, callTool } = require("../mcp/mcpClient");
const ToolCallLog = require("../models/ToolCallLog");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";
const MAX_TURNS = 5;

const SYSTEM_INSTRUCTION =
    "You are DocMind Agent, an assistant that answers questions using the user's uploaded documents and the web. " +
    "Use the search_documents tool for questions about the user's uploaded documents. " +
    "Use the web_search tool for current events, recent news, or general knowledge not covered by the documents. " +
    "If search_documents returns no relevant chunks, try web_search before giving up. " +
    "Always ground your answers in tool results rather than prior knowledge.";

function stripUserIdFromSchema(schema) {
    const cleaned = { ...schema };
    if (cleaned.properties) {
        const { userId, ...rest } = cleaned.properties;
        cleaned.properties = rest;
    }
    if (Array.isArray(cleaned.required)) {
        cleaned.required = cleaned.required.filter((field) => field !== "userId");
    }
    return cleaned;
}

function buildFunctionDeclarations() {
    return getAllToolDefinitions().map((tool) => ({
        name: tool.name,
        description: tool.description,
        parametersJsonSchema: stripUserIdFromSchema(tool.inputSchema),
    }));
}

async function runAgent({ message, userId, sessionId }) {
    const functionDeclarations = buildFunctionDeclarations();
    const contents = [createUserContent(message)];
    const toolCallLog = [];

    for (let turn = 0; turn < MAX_TURNS; turn++) {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations }],
            },
        });

        const calls = response.functionCalls;
        if (!calls || calls.length === 0) {
            return { answer: response.text, toolCallLog };
        }

        for (const call of calls) {
            contents.push(createModelContent(createPartFromFunctionCall(call.name, call.args)));

            const fullArgs = { ...call.args, userId };
            const startTime = Date.now();
            const result = await callTool(call.name, fullArgs);
            const latencyMs = Date.now() - startTime;
            const resultText = result.content?.[0]?.text ?? "";

            toolCallLog.push({ tool: call.name, args: call.args, result: resultText });

            if (sessionId) {
                try {
                    await ToolCallLog.create({
                        session: sessionId,
                        user: userId,
                        toolName: call.name,
                        input: call.args,
                        output: resultText,
                        success: true,
                        latencyMs,
                    });
                } catch (logErr) {
                    console.error("ToolCallLog write failed:", logErr.message);
                }
            }

            contents.push(
                createUserContent(createPartFromFunctionResponse(call.id, call.name, { result: resultText }))
            );
        }
    }

    return {
        answer: "I wasn't able to finish reasoning about that in time. Please try rephrasing your question.",
        toolCallLog,
    };
}

module.exports = { runAgent };