import { Router } from "express";

import {
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
} from "../controllers/blog.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

/* PUBLIC ROUTES */
router.get("/published", getPublishedBlogs);
router.get("/:id", getBlogById);

/* ADMIN ROUTES */
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getAllBlogs
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createBlog
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateBlog
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteBlog
);

router.patch(
  "/:id/publish",
  authenticate,
  authorize("ADMIN"),
  togglePublishBlog
);

export default router;