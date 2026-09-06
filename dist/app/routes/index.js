"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/auth/auth.route");
const user_rote_1 = require("../modules/usser/user.rote");
const worksapce_route_1 = require("../modules/workspace/worksapce.route");
const invitation_route_1 = require("../modules/invitation/invitation.route");
const project_route_1 = require("../modules/project/project.route");
const task_route_1 = require("../modules/task/task.route");
const notification_route_1 = require("../modules/notification/notification.route");
const activity_log_route_1 = require("../modules/activity-log/activity-log.route");
const file_route_1 = require("../modules/file/file.route");
const analytics_route_1 = require("../modules/analytics/analytics.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/users",
        route: user_rote_1.UserRoutes,
    },
    {
        path: "/workspaces",
        route: worksapce_route_1.WorkspaceRoutes,
    },
    {
        path: "/invitations",
        route: invitation_route_1.InvitationRoutes,
    },
    {
        path: "/projects",
        route: project_route_1.ProjectRoutes,
    },
    {
        path: "/tasks",
        route: task_route_1.TaskRoutes,
    },
    {
        path: "/notifications",
        route: notification_route_1.NotificationRoutes,
    },
    {
        path: "/activity-logs",
        route: activity_log_route_1.ActivityLogRoutes,
    },
    {
        path: "/files",
        route: file_route_1.FileRoutes,
    },
    {
        path: "/analytics",
        route: analytics_route_1.AnalyticsRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
