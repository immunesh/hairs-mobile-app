"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/google', auth_controller_1.googleAuth);
router.post('/refresh', auth_controller_1.refresh);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logout);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getMe);
router.post('/forgot-password', auth_controller_1.forgotPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map