import { Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middleware/validateRequest";
import { auth } from "../../middleware/auth";

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
router.post("/refresh-token", AuthController.refreshToken);

export const AuthRoutes = router;
