import express from "express";
import path from "path";
import { AuthRoutes } from "../modules/auth/auth.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
