import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/usser/user.rote";
import { WorkspaceRoutes } from "../modules/workspace/worksapce.route";
import { InvitationRoutes } from "../modules/invitation/invitation.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/workspaces",
    route: WorkspaceRoutes,
  },
  {
    path: "/invitations",
    route: InvitationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
