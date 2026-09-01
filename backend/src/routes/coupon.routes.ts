import { Router } from "express";

import {
  getAllCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
  applyCoupon,
} from "../controllers/coupon.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

/* PUBLIC */
router.post(
  "/apply",
  applyCoupon
);

/* ADMIN */
router.use(
  authenticate,
  authorize("ADMIN")
);

router.get(
  "/",
  getAllCoupons
);

router.post(
  "/",
  createCoupon
);

router.patch(
  "/:id/toggle",
  toggleCouponStatus
);

router.delete(
  "/:id",
  deleteCoupon
);

export default router;