"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
console.log("UPLOAD ROUTES LOADED");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const uploadDir = "uploads";
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, {
        recursive: true,
    });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() +
            path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
});
router.post("/image", upload.single("image"), (req, res) => {
    console.log("FILE RECEIVED =>", req.file);
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }
    res.json({
        success: true,
        url: `/uploads/${req.file.filename}`,
    });
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map