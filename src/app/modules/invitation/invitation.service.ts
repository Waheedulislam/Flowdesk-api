import prisma from "../../../config/prisma";
import {
  ActivityAction,
  ActivityEntity,
  InvitationStatus,
  NotificationType,
  WorkspaceRole,
} from "../../../generated/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import httpStatus from "http-status-codes";
import crypto from "crypto";
import { createNotification } from "../notification/notification.utils";
import { createActivityLog } from "../activity-log/activity-log.utils";
import { sendEmail } from "../../../utils/sendEmail";
import { invitationTemplate } from "../../../utils/emailTemplate";

const createInvitation = async (
  workspaceId: string,
  payload: {
    email: string;
    role: WorkspaceRole;
  },
  user: IAuthUser,
) => {
  // Normalize email
  const email = payload.email.trim().toLowerCase();

  // Get workspace & inviter
  const [workspace, inviter] = await Promise.all([
    prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    }),

    prisma.user.findUnique({
      where: {
        id: user!.userId,
      },
      select: {
        name: true,
      },
    }),
  ]);

  // Check workspace exists
  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  // Check inviter permission
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (
    !workspaceMember ||
    (workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to invite members",
    );
  }

  // Check invited user exists
  const invitedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Check already workspace member
  if (invitedUser) {
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User is already a workspace member",
      );
    }
  }

  // Check pending invitation
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      workspaceId,
      email,
      status: InvitationStatus.PENDING,
    },
  });

  if (existingInvitation) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invitation already sent");
  }

  // Generate token
  const token = crypto.randomUUID();

  // Set expiration (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create invitation
  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      invitedBy: user!.userId,
      email,
      role: payload.role,
      token,
      expiresAt,
      userId: invitedUser?.id,
    },
  });

  // Create activity log
  await createActivityLog({
    userId: user!.userId,
    workspaceId,
    action: ActivityAction.INVITE,
    entity: ActivityEntity.INVITATION,
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
    await sendEmail({
      to: invitation.email,
      subject: `Invitation to join ${workspace.name}`,
      html: invitationTemplate({
        inviterName: inviter?.name ?? "FlowDesk",
        workspaceName: workspace.name,
        inviteLink,
      }),
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
  }

  return invitation;
};
const acceptInvitation = async (token: string, user: IAuthUser) => {
  // 1. Check Invitation
  const invitation = await prisma.invitation.findUnique({
    where: {
      token,
    },
  });

  if (!invitation) {
    throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
  }

  // 2. Check Invitation Status
  if (invitation.status !== InvitationStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invitation is no longer valid");
  }

  // 3. Check Invitation Expiration
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    throw new AppError(httpStatus.BAD_REQUEST, "Invitation has expired");
  }

  // 4. Check Invitation Owner
  if (user!.email !== invitation.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This invitation is not for your account",
    );
  }

  // 5. Accept Invitation
  const updatedInvitation = await prisma.$transaction(async (tx) => {
    const existingMember = await tx.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: user!.userId,
        },
      },
    });

    if (existingMember) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are already a workspace member",
      );
    }

    await tx.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user!.userId,
        role: invitation.role,
      },
    });

    return tx.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatus.ACCEPTED,
      },
    });
  });

  // 6. Get Workspace & Current User
  const [workspace, currentUser] = await Promise.all([
    prisma.workspace.findUnique({
      where: {
        id: invitation.workspaceId,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    }),

    prisma.user.findUnique({
      where: {
        id: user!.userId,
      },
      select: {
        name: true,
      },
    }),
  ]);

  // Workspace should exist because invitation belongs to it
  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  // 7. Get Workspace Owner
  const owner = await prisma.user.findUnique({
    where: {
      id: workspace.ownerId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  // 8. Notify Workspace Owner
  if (workspace.ownerId !== user!.userId) {
    await createNotification({
      userId: workspace.ownerId,
      title: "Invitation Accepted",
      message: `${currentUser?.name ?? "A user"} has joined your workspace "${workspace.name}".`,
      type: NotificationType.WORKSPACE_INVITATION,
      link: `/workspaces/${workspace.id}`,
    });

    // 9. Send Email to Workspace Owner
    if (owner?.email) {
      try {
        await sendEmail({
          to: owner.email,
          subject: "Invitation Accepted",
          html: `
            <h2>Invitation Accepted</h2>

            <p>
              <strong>${currentUser?.name ?? "A user"}</strong>
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
      } catch (error) {
        console.error("Failed to send invitation accepted email:", error);
      }
    }
  }

  // 10. Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    workspaceId: invitation.workspaceId,
    action: ActivityAction.ACCEPT_INVITATION,
    entity: ActivityEntity.INVITATION,
    entityId: updatedInvitation.id,
    metadata: {
      workspaceName: workspace.name,
      invitedUser: currentUser?.name,
      role: invitation.role,
    },
  });

  return updatedInvitation;
};

export const InvitationService = {
  createInvitation,
  acceptInvitation,
};
