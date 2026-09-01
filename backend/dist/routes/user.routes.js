"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/* Authentication Required */
router.use(auth_middleware_1.authenticate);
/* ==========================
   ADMIN ROUTES
========================== */
router.get("/admin/all", (0, auth_middleware_1.authorize)("ADMIN"), user_controller_1.getAllUsers);
router.put("/admin/:id/role", (0, auth_middleware_1.authorize)("ADMIN"), user_controller_1.updateUserRole);
router.delete("/admin/:id", (0, auth_middleware_1.authorize)("ADMIN"), user_controller_1.deleteUser);
/* ==========================
   USER PROFILE
========================== */
router.get("/profile", user_controller_1.getProfile);
router.put("/profile", user_controller_1.updateProfile);
router.patch("/password", user_controller_1.changePassword);
/* ==========================
   USER ADDRESSES
========================== */
router.get("/addresses", user_controller_1.getAddresses);
router.post("/addresses", user_controller_1.addAddress);
router.put("/addresses/:id", user_controller_1.updateAddress);
router.delete("/addresses/:id", user_controller_1.deleteAddress);
router.get("/notification-preferences", user_controller_1.getNotificationPreferences);
router.put("/notification-preferences", user_controller_1.updateNotificationPreferences);
exports.default = router;
//# sourceMappingURL=user.routes.js.map