import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
import upload from "../../middleware/upload";

const router = Router();

router.get("/me", auth(), UserController.getMyProfile);
router.post(
  "/me/avatar",
  auth(),
  upload.single("avatar"),
  UserController.uploadAvatar,
);
router.delete("/me/avatar", auth(), UserController.deleteAvatar);
router.patch(
  "/update-profile",
  auth(),
  validateRequest(UserValidation.updateMyProfileValidationSchema),
  UserController.updateMyProfile,
);
export const UserRoutes = router;
