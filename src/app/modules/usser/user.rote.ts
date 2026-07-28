import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";

const router = Router();

router.get("/me", auth(), UserController.getMyProfile);
router.patch(
  "/update-profile",
  auth(),
  validateRequest(UserValidation.updateMyProfileValidationSchema),
  UserController.updateMyProfile,
);
export const UserRoutes = router;
