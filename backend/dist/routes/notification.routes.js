"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', notification_controller_1.getNotifications);
router.get('/unread-count', notification_controller_1.getUnreadCount);
router.patch('/read-all', notification_controller_1.markAllAsRead);
router.patch('/:id/read', notification_controller_1.markAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map