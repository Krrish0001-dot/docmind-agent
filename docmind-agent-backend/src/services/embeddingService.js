const { GoogleGenAI } = require("@google/genai");

let aiClient = null;

function getAiClient(){
    if(!aiClient){
        if(!process.env.GEMINI_API_KEY){
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }
        aiClient = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    }
    return aiClient;
}

function normalize(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum,value) => sum + value * value,0));
    return vector.map((value) => value / magnitude);
}

async function embedChunks(chunks,taskType = "RETRIEVAL_DOCUMENT"){
    const ai = getAiClient();

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: chunks,
        config: {
            outputDimensionality: 768,
            taskType,
        },
    });
    return response.embeddings.map((embedding) => normalize(embedding.values));
}
module.exports = { embedChunks };