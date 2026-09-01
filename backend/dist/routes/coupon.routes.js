"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/* PUBLIC */
router.post("/apply", coupon_controller_1.applyCoupon);
/* ADMIN */
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"));
router.get("/", coupon_controller_1.getAllCoupons);
router.post("/", coupon_controller_1.createCoupon);
router.patch("/:id/toggle", coupon_controller_1.toggleCouponStatus);
router.delete("/:id", coupon_controller_1.deleteCoupon);
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map