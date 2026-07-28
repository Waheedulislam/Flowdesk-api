import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/me", auth(), UserController.getMyProfile);

export const UserRoutes = router;
