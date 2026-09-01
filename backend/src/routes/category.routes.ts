import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";

const router = Router();

// GET ALL CATEGORIES
router.get("/", getCategories);

// GET SINGLE CATEGORY
router.get("/:id", getCategoryById);

// CREATE CATEGORY
router.post("/", createCategory);

// UPDATE CATEGORY
router.put("/:id", updateCategory);

// DELETE CATEGORY
router.delete("/:id", deleteCategory);

export default router;