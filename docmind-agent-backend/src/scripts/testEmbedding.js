require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("../models/Document");
const { extractTextFromDocument } = require("../services/extractionService");
const chunkText = require("../utils/chunkText");
const { embedChunks } = require("../services/embeddingService");
const { upsertChunks } = require("../services/pineconeService");

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    const document = await Document.findById("6a3baf78183668db0677c068");
    if(!document){
        throw new Error("Document not found");
    }
    const text = await extractTextFromDocument(document);
    const chunks = chunkText(text,{ chunkSize: 1000, overlap: 200 });
    console.log(`Chunked into ${chunks.length} pieces`);

    const vectors = await embedChunks(chunks);
    console.log(`Got ${vectors.length} vectors, each ${vectors[0].length} dimensions`);

    const upsertedCount = await upsertChunks({
        documentId: document._id.toString(),
        userId: document.owner.toString(),
        chunks,
        vectors, 
    });
    console.log(`Upserted ${upsertedCount} vectors into Pinecone`);

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("Test failed:",err);
    process.exit(1);
});