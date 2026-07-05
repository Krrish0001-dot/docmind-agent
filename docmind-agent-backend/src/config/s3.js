const { S3Client } = require("@aws-sdk/client-s3");

let s3Client = null;

function getS3Client() {
    if(!s3Client){
        s3Client = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
}

module.exports = { getS3Client };