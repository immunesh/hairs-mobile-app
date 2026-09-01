"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/* PUBLIC ROUTES */
router.get("/published", blog_controller_1.getPublishedBlogs);
router.get("/:id", blog_controller_1.getBlogById);
/* ADMIN ROUTES */
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), blog_controller_1.getAllBlogs);
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), blog_controller_1.createBlog);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), blog_controller_1.updateBlog);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), blog_controller_1.deleteBlog);
router.patch("/:id/publish", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), blog_controller_1.togglePublishBlog);
exports.default = router;
//# sourceMappingURL=blog.routes.js.map