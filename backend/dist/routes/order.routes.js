"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/* ADMIN */
router.get("/admin/all", (0, auth_middleware_2.authorize)("ADMIN"), order_controller_1.getAdminOrders);
router.get("/admin/:id", (0, auth_middleware_2.authorize)("ADMIN"), order_controller_1.getAdminOrderById);
router.put("/admin/:id/status", (0, auth_middleware_2.authorize)("ADMIN"), order_controller_1.updateOrderStatus);
router.post("/admin/:id/shipment", (0, auth_middleware_2.authorize)("ADMIN"), order_controller_1.createShipment);
router.put("/admin/:id/shipment", (0, auth_middleware_2.authorize)("ADMIN"), order_controller_1.updateShipment);
/* CUSTOMER */
router.post('/', order_controller_1.createOrder);
router.get('/', order_controller_1.getOrders);
router.get('/:id', order_controller_1.getOrderById);
router.patch('/:id/cancel', order_controller_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map