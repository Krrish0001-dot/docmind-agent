const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { runAgent } = require("../services/agentService");
const ChatSession = require("../models/ChatSession");

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string" || message.trim() === "") {
            return res.status(400).json({ success: false, message: "A non-empty message is required" });
        }

        const userId = req.user._id.toString();
        const trimmed = message.trim();

        const session = await ChatSession.create({
            user: req.user._id,
            title: trimmed.slice(0, 60),
        });

        const { answer, toolCallLog } = await runAgent({
            message: trimmed,
            userId,
            sessionId: session._id,
        });

        session.messages.push(
            { role: "user", content: trimmed },
            { role: "assistant", content: answer, toolCalls: toolCallLog }
        );
        await session.save();

        res.status(200).json({
            success: true,
            data: { answer, toolCallLog, sessionId: session._id },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;