const { Queue } = require("bullmq");
const { getRedisClient } = require("../config/redis");

let ingestionQueue = null;

function getIngestionQueue(){
    if(!ingestionQueue){
        ingestionQueue = new Queue("document-ingestion",{
            connection: getRedisClient(),
        });
    }
    return ingestionQueue;
}
async function enqueueDocumentProcessing(documentId){
    const queue  = getIngestionQueue();
    await queue.add("process-document",{ documentId });
}

module.exports = { getIngestionQueue, enqueueDocumentProcessing };