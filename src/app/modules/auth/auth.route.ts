import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerSchema),
  AuthController.registerUser,
);
router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

export const AuthRoutes = router;
