const Document = require("../models/Document");
const { extractTextFromDocument } = require("./extractionService");
const chunkText = require("../utils/chunkText");
const { embedChunks } = require("./embeddingService");
const { upsertChunks } = require("./pineconeService");

async function processDocument(documentId){
    const document = await Document.findById(documentId);
    if(!document){
        throw new Error(`Document ${documentId} not found`);
    }
    try{
        document.status = "processing";
        await document.save();

        const text = await extractTextFromDocument(document);
        const chunks = chunkText(text,{ chunkSize: 1000, overlap: 200 });
        const vectors = await embedChunks(chunks);

        await upsertChunks({
            documentId: document._id.toString(),
            userId: document.owner.toString(),
            chunks,
            vectors,
        });

        document.status = "embedded";
        document.chunkCount = chunks.length;
        await document.save();
    } catch (err){
        document.status = "failed";
        document.errorMessage = err.message;
        await document.save();
        throw err;
    }
}

module.exports = { processDocument };