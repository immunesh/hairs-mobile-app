import { Router } from "express";

import {
  getProductReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview,
  getTestimonials,
} from "../controllers/review.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

/* ADMIN */

router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  getAllReviews
);

router.delete(
  "/admin/:id",
  authenticate,
  authorize("ADMIN"),
  adminDeleteReview
);

/* CUSTOMER */

router.get("/testimonials", getTestimonials);

router.get(
  "/product/:productId",
  getProductReviews
);

router.post(
  "/",
  authenticate,
  createReview
);

router.put(
  "/:id",
  authenticate,
  updateReview
);

router.delete(
  "/:id",
  authenticate,
  deleteReview
);
router.get(
  "/my",
  authenticate,
  getMyReviews
);

export default router;