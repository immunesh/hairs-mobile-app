"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
            return;
        }
        res.status(200).json({
            success: true,
            filename: req.file.filename,
            url: `http://localhost:5000/uploads/${req.file.filename}`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Upload failed",
        });
    }
};
exports.uploadImage = uploadImage;
//# sourceMappingURL=upload.controller.js.map