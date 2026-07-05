require("dotenv").config();
const mongoose = require("mongoose");
const { Worker } = require("bullmq");
const { connectRedis,getRedisClient } = require("../config/redis");
const { processDocument } = require("../services/ingestionService");

async function start(){
    await mongoose.connect(process.env.MONGO_URI);
    await connectRedis();

    const worker  = new Worker(
        "document-ingestion",
        async(job) => {
            await processDocument(job.data.documentId);
        },
        { connection: getRedisClient() }
    );

    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed for document ${job.data.documentId}`);
    });

    worker.on("failed",(job,err) => {
        console.error(`Job ${job.id} failed for document ${job.data.documentId}:`,err.message);
    });

    console.log("Ingestion worker started, waiting for jobs...");
}
start();