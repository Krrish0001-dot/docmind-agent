const mongoose = require("mongoose");

const toolCallLogSchema = new mongoose.Schema({
    session:{type:mongoose.Schema.Types.ObjectId, ref:"ChatSession",required:true,index:true},
    user: {type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
    toolName: {type:String,required:true},
    input:{type:mongoose.Schema.Types.Mixed},
    output: {type:mongoose.Schema.Types.Mixed},
    success:{type:Boolean,default:true},
    errorMessage: {type:String},
    latencyMs:{type:Number},
},
    {timestamps: true}
);

module.exports = mongoose.model("ToolCallLog",toolCallLogSchema);