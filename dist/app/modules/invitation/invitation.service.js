"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const prisma_2 = require("../../../generated/prisma");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const crypto_1 = __importDefault(require("crypto"));
const notification_utils_1 = require("../notification/notification.utils");
const activity_log_utils_1 = require("../activity-log/activity-log.utils");
const sendEmail_1 = require("../../../utils/sendEmail");
const emailTemplate_1 = require("../../../utils/emailTemplate");
const createInvitation = (workspaceId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Normalize email
    const email = payload.email.trim().toLowerCase();
    // Get workspace & inviter
    const [workspace, inviter] = yield Promise.all([
        prisma_1.default.workspace.findUnique({
            where: {
                id: workspaceId,
            },
        }),
        prisma_1.default.user.findUnique({
            where: {
                id: user.userId,
            },
            select: {
                name: true,
            },
        }),
    ]);
    // Check workspace exists
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // Check inviter permission
    const workspaceMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!workspaceMember ||
        (workspaceMember.role !== prisma_2.WorkspaceRole.OWNER &&
            workspaceMember.role !== prisma_2.WorkspaceRole.ADMIN)) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to invite members");
    }
    // Check invited user exists
    const invitedUser = yield prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    // Check already workspace member
    if (invitedUser) {
        const existingMember = yield prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: invitedUser.id,
                },
            },
        });
        if (existingMember) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already a workspace member");
        }
    }
    // Check pending invitation
    const existingInvitation = yield prisma_1.default.invitation.findFirst({
        where: {
            workspaceId,
            email,
            status: prisma_2.InvitationStatus.PENDING,
        },
    });
    if (existingInvitation) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invitation already sent");
    }
    // Generate token
    const token = crypto_1.default.randomUUID();
    // Set expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    // Create invitation
    const invitation = yield prisma_1.default.invitation.create({
        data: {
            workspaceId,
            invitedBy: user.userId,
            email,
            role: payload.role,
            token,
            expiresAt,
            userId: invitedUser === null || invitedUser === void 0 ? void 0 : invitedUser.id,
        },
    });
    // Create activity log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId,
        action: prisma_2.ActivityAction.INVITE,
        entity: prisma_2.ActivityEntity.INVITATION,
        entityId: invitation.id,
        metadata: {
            invitedEmail: invitation.email,
            role: invitation.role,
        },
    });
    // Generate invitation link
    const inviteLink = `${process.env.CLIENT_URL}/accept-invitation/${invitation.token}`;
    // Send invitation email
    try {
        yield (0, sendEmail_1.sendEmail)({
            to: invitation.email,
            subject: `Invitation to join ${workspace.name}`,
            html: (0, emailTemplate_1.invitationTemplate)({
                inviterName: (_a = inviter === null || inviter === void 0 ? void 0 : inviter.name) !== null && _a !== void 0 ? _a : "FlowDesk",
                workspaceName: workspace.name,
                inviteLink,
            }),
        });
    }
    catch (error) {
        console.error("Failed to send invitation email:", error);
    }
    return invitation;
});
const getWorkspaceInvitations = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check workspace
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 2. Check current user's workspace membership
    const currentMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!currentMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Only OWNER and ADMIN can manage invitations
    if (currentMember.role !== prisma_2.WorkspaceRole.OWNER &&
        currentMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to view workspace invitations");
    }
    // 4. Get pending invitations
    const invitations = yield prisma_1.default.invitation.findMany({
        where: {
            workspaceId,
            status: prisma_2.InvitationStatus.PENDING,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return invitations;
});
const acceptInvitation = (token, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // 1. Check Invitation
    const invitation = yield prisma_1.default.invitation.findUnique({
        where: {
            token,
        },
    });
    if (!invitation) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Invitation not found");
    }
    // 2. Check Invitation Status
    if (invitation.status !== prisma_2.InvitationStatus.PENDING) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invitation is no longer valid");
    }
    // 3. Check Invitation Expiration
    if (invitation.expiresAt < new Date()) {
        yield prisma_1.default.invitation.update({
            where: {
                id: invitation.id,
            },
            data: {
                status: prisma_2.InvitationStatus.EXPIRED,
            },
        });
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invitation has expired");
    }
    // 4. Check Invitation Owner
    if (user.email !== invitation.email) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This invitation is not for your account");
    }
    // 5. Accept Invitation
    const updatedInvitation = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const existingMember = yield tx.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: invitation.workspaceId,
                    userId: user.userId,
                },
            },
        });
        if (existingMember) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You are already a workspace member");
        }
        yield tx.workspaceMember.create({
            data: {
                workspaceId: invitation.workspaceId,
                userId: user.userId,
                role: invitation.role,
            },
        });
        return tx.invitation.update({
            where: {
                id: invitation.id,
            },
            data: {
                status: prisma_2.InvitationStatus.ACCEPTED,
            },
        });
    }));
    // 6. Get Workspace & Current User
    const [workspace, currentUser] = yield Promise.all([
        prisma_1.default.workspace.findUnique({
            where: {
                id: invitation.workspaceId,
            },
            select: {
                id: true,
                name: true,
                ownerId: true,
            },
        }),
        prisma_1.default.user.findUnique({
            where: {
                id: user.userId,
            },
            select: {
                name: true,
            },
        }),
    ]);
    // Workspace should exist because invitation belongs to it
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 7. Get Workspace Owner
    const owner = yield prisma_1.default.user.findUnique({
        where: {
            id: workspace.ownerId,
        },
        select: {
            name: true,
            email: true,
        },
    });
    // 8. Notify Workspace Owner
    if (workspace.ownerId !== user.userId) {
        yield (0, notification_utils_1.createNotification)({
            userId: workspace.ownerId,
            title: "Invitation Accepted",
            message: `${(_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) !== null && _a !== void 0 ? _a : "A user"} has joined your workspace "${workspace.name}".`,
            type: prisma_2.NotificationType.WORKSPACE_INVITATION,
            link: `/workspaces/${workspace.id}`,
        });
        // 9. Send Email to Workspace Owner
        if (owner === null || owner === void 0 ? void 0 : owner.email) {
            try {
                yield (0, sendEmail_1.sendEmail)({
                    to: owner.email,
                    subject: "Invitation Accepted",
                    html: `
            <h2>Invitation Accepted</h2>

            <p>
              <strong>${(_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) !== null && _b !== void 0 ? _b : "A user"}</strong>
              has accepted your invitation and joined your workspace
              <strong>${workspace.name}</strong>.
            </p>

            <p>
              You can now collaborate with them in FlowDesk.
            </p>

            <p>
              — FlowDesk Team
            </p>
          `,
                });
            }
            catch (error) {
                console.error("Failed to send invitation accepted email:", error);
            }
        }
    }
    // 10. Create Activity Log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId: invitation.workspaceId,
        action: prisma_2.ActivityAction.ACCEPT_INVITATION,
        entity: prisma_2.ActivityEntity.INVITATION,
        entityId: updatedInvitation.id,
        metadata: {
            workspaceName: workspace.name,
            invitedUser: currentUser === null || currentUser === void 0 ? void 0 : currentUser.name,
            role: invitation.role,
        },
    });
    return updatedInvitation;
});
const cancelInvitation = (workspaceId, invitationId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check workspace
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 2. Check current user's membership
    const currentMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!currentMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 3. Only OWNER and ADMIN can cancel invitations
    if (currentMember.role !== prisma_2.WorkspaceRole.OWNER &&
        currentMember.role !== prisma_2.WorkspaceRole.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to cancel invitations");
    }
    // 4. Find invitation
    const invitation = yield prisma_1.default.invitation.findFirst({
        where: {
            id: invitationId,
            workspaceId,
        },
    });
    if (!invitation) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Invitation not found");
    }
    // 5. Only pending invitations can be cancelled
    if (invitation.status !== prisma_2.InvitationStatus.PENDING) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only pending invitations can be cancelled");
    }
    // 6. Cancel invitation
    const cancelledInvitation = yield prisma_1.default.invitation.update({
        where: {
            id: invitation.id,
        },
        data: {
            status: prisma_2.InvitationStatus.CANCELLED,
        },
    });
    // 7. Activity log
    yield (0, activity_log_utils_1.createActivityLog)({
        userId: user.userId,
        workspaceId,
        action: prisma_2.ActivityAction.CANCEL_INVITATION,
        entity: prisma_2.ActivityEntity.INVITATION,
        entityId: invitation.id,
        metadata: {
            invitedEmail: invitation.email,
            role: invitation.role,
        },
    });
    return cancelledInvitation;
});
exports.InvitationService = {
    createInvitation,
    getWorkspaceInvitations,
    acceptInvitation,
    cancelInvitation,
};
