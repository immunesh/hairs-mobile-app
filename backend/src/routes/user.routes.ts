import { Router } from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/user.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

/* Authentication Required */
router.use(authenticate);

/* ==========================
   ADMIN ROUTES
========================== */

router.get(
  "/admin/all",
  authorize("ADMIN"),
  getAllUsers
);

router.put(
  "/admin/:id/role",
  authorize("ADMIN"),
  updateUserRole
);

router.delete(
  "/admin/:id",
  authorize("ADMIN"),
  deleteUser
);

/* ==========================
   USER PROFILE
========================== */

router.get("/profile", getProfile);

router.put("/profile", updateProfile);

router.patch(
  "/password",
  changePassword
);

/* ==========================
   USER ADDRESSES
========================== */

router.get(
  "/addresses",
  getAddresses
);

router.post(
  "/addresses",
  addAddress
);

router.put(
  "/addresses/:id",
  updateAddress
);

router.delete(
  "/addresses/:id",
  deleteAddress
);
router.get(
  "/notification-preferences",
  getNotificationPreferences
);

router.put(
  "/notification-preferences",
  updateNotificationPreferences
);

export default router;
