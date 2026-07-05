const { getPineconeIndex } = require("../config/pinecone");

async function upsertChunks({ documentId, userId, chunks, vectors }){
    const index = getPineconeIndex();

    const records = chunks.map((chunkText, i) => ({
        id: `${documentId}-chunk-${i}`,
        values: vectors[i],
        metadata: {
            documentId,
            userId,
            chunkIndex: i,
            text: chunkText,
        },
    }));
    await index.upsert( records );

    return records.length;
}

async function queryChunks({ userId, vector, topK = 5}){
    const index = getPineconeIndex();

    const results = await index.query({
        vector,
        topK,
        filter: {userId: { $eq: userId }},
        includeMetadata: true,
    });

    return results.matches.map((match) => ({
        score: match.score,
        text: match.metadata.text,
        documentId: match.metadata.documentId,
        chunkIndex: match.metadata.chunkIndex,
    }));
}


module.exports = { upsertChunks, queryChunks };