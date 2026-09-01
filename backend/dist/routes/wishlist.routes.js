"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("../controllers/wishlist.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/admin/all", (0, auth_middleware_1.authorize)("ADMIN"), wishlist_controller_1.getAllWishlists);
router.get("/", wishlist_controller_1.getWishlist);
router.post("/", wishlist_controller_1.addToWishlist);
router.delete("/:productId", wishlist_controller_1.removeFromWishlist);
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map