const { PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const { getS3Client } = require("../config/s3");
const Document = require("../models/Document");
const logger = require("../utils/logger");

async function uploadDocument({ file,userId }){
    const s3Client = getS3Client();
    const key = `documents/${userId}/${crypto.randomUUID()}-${file.originalname}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key : key,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );

    const document = await Document.create({
        owner: userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        s3Key: key,
        status: "uploaded",
    });

    logger.info(`Document uploaded: ${document._id}(${file.originalname})`);
    return document;
}

module.exports = { uploadDocument };