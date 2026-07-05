const mongoose = require("mongoose");

const citationSchema = new mongoose.Schema(
    {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
        chunkText: { type: String },
        score: { type: Number },
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ["user", "assistant", "tool"], required: true },
        content: { type: String, required: true },
        citations: { type: [citationSchema], default: [] },
        toolCalls: { type: [mongoose.Schema.Types.Mixed], default: [] },
    },
    { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, default: "New conversation" },
        documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
        messages: { type: [messageSchema], default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);