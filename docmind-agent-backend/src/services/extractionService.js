const { GetObjectCommand } = require("@aws-sdk/client-s3");
const pdfParse = require("pdf-parse");
const mammoth = require('mammoth');
const { getS3Client } = require("../config/s3");

function streamToBuffer(stream){
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data",(chunk) => chunks.push(chunk));
        stream.on("end",() => resolve(Buffer.concat(chunks)));
        stream.on("error",reject);
    });
}

async function downloadFromS3(key){
    const s3Client = getS3Client();
    const response = await s3Client.send(
        new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
        })
    );
    return streamToBuffer(response.Body);
}

async function extractText(buffer,mimeType){
    switch(mimeType){
        case "application/pdf" : {
            const data = await pdfParse(buffer);
            return data.text;
        }
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }
        case "text/plain":
            return buffer.toString("utf-8");
            default:
                throw new Error(`Unsupported mimeType for extraction : ${mimeType}`);
    }
}

async function extractTextFromDocument(document){
    const buffer = await downloadFromS3(document.s3Key);
    const text = await extractText(buffer, document.mimeType);
    return text;
}
module.exports = { downloadFromS3,extractText,extractTextFromDocument};