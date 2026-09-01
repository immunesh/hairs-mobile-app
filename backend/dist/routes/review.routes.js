"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/* ADMIN */
router.get("/admin/all", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), review_controller_1.getAllReviews);
router.delete("/admin/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), review_controller_1.adminDeleteReview);
/* CUSTOMER */
router.get("/testimonials", review_controller_1.getTestimonials);
router.get("/product/:productId", review_controller_1.getProductReviews);
router.post("/", auth_middleware_1.authenticate, review_controller_1.createReview);
router.put("/:id", auth_middleware_1.authenticate, review_controller_1.updateReview);
router.delete("/:id", auth_middleware_1.authenticate, review_controller_1.deleteReview);
router.get("/my", auth_middleware_1.authenticate, review_controller_1.getMyReviews);
exports.default = router;
//# sourceMappingURL=review.routes.js.map