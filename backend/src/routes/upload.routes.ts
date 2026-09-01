import { Router } from "express";
console.log("UPLOAD ROUTES LOADED");
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
});

router.post(
  "/image",
  upload.single("image"),
  (req, res) => {

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
  }
);

export default router;