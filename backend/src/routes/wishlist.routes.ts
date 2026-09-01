import { Router } from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAllWishlists,
} from "../controllers/wishlist.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/admin/all",
  authorize("ADMIN"),
  getAllWishlists
);

router.get("/", getWishlist);

router.post("/", addToWishlist);

router.delete(
  "/:productId",
  removeFromWishlist
);

export default router;