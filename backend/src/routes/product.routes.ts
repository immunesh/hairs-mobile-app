import { Router } from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);

router.get("/:id", getProductById);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

router.get("/:id/related", getRelatedProducts);

export default router;