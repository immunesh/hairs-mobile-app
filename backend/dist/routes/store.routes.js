"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/*
  Public Routes
*/
router.get("/", store_controller_1.getAllStores);
router.get("/:id", store_controller_1.getStoreById);
/*
  Admin Routes
*/
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), store_controller_1.createStore);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), store_controller_1.updateStore);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), store_controller_1.deleteStore);
router.patch("/:id/toggle", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), store_controller_1.toggleStoreStatus);
exports.default = router;
//# sourceMappingURL=store.routes.js.map