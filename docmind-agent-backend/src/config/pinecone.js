const { Pinecone } = require("@pinecone-database/pinecone");

let pineconeClient = null;

function getPineconeIndex(){
    if(!pineconeClient){
        if(!process.env.PINECONE_API_KEY){
            throw new Error("PINECONE_API_KEY is not set in environment variables");
        }
        pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    }
    return pineconeClient.index(process.env.PINECONE_INDEX_NAME);
}

module.exports = { getPineconeIndex };