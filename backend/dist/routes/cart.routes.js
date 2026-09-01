"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Admin Routes
router.get("/admin/all", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), cart_controller_1.getAllCarts);
// User Routes
router.use(auth_middleware_1.authenticate);
router.get("/", cart_controller_1.getCart);
router.post("/", cart_controller_1.addToCart);
router.put("/:id", cart_controller_1.updateCartItem);
router.delete("/clear", cart_controller_1.clearCart);
router.delete("/:id", cart_controller_1.removeFromCart);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map