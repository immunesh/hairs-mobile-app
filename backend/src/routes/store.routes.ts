import { Router } from "express";

import {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  toggleStoreStatus,
} from "../controllers/store.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

/*
  Public Routes
*/
router.get("/", getAllStores);
router.get("/:id", getStoreById);

/*
  Admin Routes
*/
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createStore
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateStore
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteStore
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize("ADMIN"),
  toggleStoreStatus
);

export default router;