import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getAllCarts,
} from "../controllers/cart.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

// Admin Routes
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  getAllCarts
);

// User Routes
router.use(authenticate);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:id", removeFromCart);

export default router;