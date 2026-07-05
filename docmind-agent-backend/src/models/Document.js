const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        owner: {type: mongoose.Schema.Types.ObjectId, ref:"user",required:true,index:true},
        originalName: {type:String, required:true},
        mimeType: {type:String,required:true},
        sizeBytes:{type:Number,required:true},
        s3Key:{type:String,required:true},
        status: {
            type: String,
            enum : ["uploaded","processing","embedded","failed"],
            default: "uploaded",
        },
        chunkCount : {type: Number, default:0 },
        pineconeNamespace: {type:String},
        errorMessage: {type:String},
    },
    {timestamps: true}
);

module.exports = mongoose.model("Document",documentSchema);