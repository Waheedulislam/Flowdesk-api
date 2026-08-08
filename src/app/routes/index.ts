import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/usser/user.rote";
import { WorkspaceRoutes } from "../modules/workspace/worksapce.route";
import { InvitationRoutes } from "../modules/invitation/invitation.route";
import { ProjectRoutes } from "../modules/project/project.route";
import { TaskRoutes } from "../modules/task/task.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { ActivityLogRoutes } from "../modules/activity-log/activity-log.route";
import { FileRoutes } from "../modules/file/file.route";

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
  {
    path: "/projects",
    route: ProjectRoutes,
  },
  {
    path: "/tasks",
    route: TaskRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/activity-logs",
    route: ActivityLogRoutes,
  },
  {
    path: "/files",
    route: FileRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
