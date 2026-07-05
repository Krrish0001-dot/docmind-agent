const multer = require("multer");

const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

const storage = multer.memoryStorage();

function fileFilter(req,file,cb) {
    if(allowedMimeTypes.includes(file.mimetype)){
        cb(null,true);
    } else {
        const err = new Error("Unsupported file type. Upload a PDF, DOCX, or TXT file.");
        err.statusCode = 400;
        cb(err);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024},
});

module.exports = upload;