import { Request, Response } from "express";

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};