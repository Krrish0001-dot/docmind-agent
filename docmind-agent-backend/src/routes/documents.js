const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { uploadDocument } = require("../services/documentService");
const { enqueueDocumentProcessing } = require("../queues/ingestionQueue");

const router = express.Router();

router.post("/", protect, upload.single("file"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const userId = req.user._id.toString();
        const document = await uploadDocument({ file: req.file, userId });

        await enqueueDocumentProcessing(document._id.toString());

        res.status(201).json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
});

module.exports = router;