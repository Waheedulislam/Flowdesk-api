"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const invitation_controller_1 = require("./invitation.controller");
const invitation_validation_1 = require("./invitation.validation");
const auth_1 = require("../../middleware/auth");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const router = express_1.default.Router();
router.post("/workspace/:workspaceId", (0, auth_1.auth)(), (0, validateRequest_1.default)(invitation_validation_1.InvitationValidation.createInvitationValidationSchema), invitation_controller_1.InvitationController.createInvitation);
router.get("/workspace/:workspaceId", (0, auth_1.auth)(), invitation_controller_1.InvitationController.getWorkspaceInvitations);
router.post("/workspace/:token/accept", (0, auth_1.auth)(), invitation_controller_1.InvitationController.acceptInvitation);
router.delete("/workspace/:workspaceId/:invitationId", (0, auth_1.auth)(), invitation_controller_1.InvitationController.cancelInvitation);
exports.InvitationRoutes = router;
