import prisma from "../../../config/prisma";
import { InvitationStatus, WorkspaceRole } from "../../../generated/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import httpStatus from "http-status-codes";
import crypto from "crypto";

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

  // Check workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

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

  return invitation;
};

const acceptInvitation = async (token: string, user: IAuthUser) => {
  const invitation = await prisma.invitation.findUnique({
    where: {
      token,
    },
  });
  if (!invitation) {
    throw new AppError(httpStatus.NOT_FOUND, "Invitation not found");
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invitation is no longer valid");
  }
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

  if (user!.email !== invitation.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This invitation is not for your account",
    );
  }

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

    return await tx.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatus.ACCEPTED,
      },
    });
  });

  return updatedInvitation;
};

export const InvitationService = {
  createInvitation,
  acceptInvitation,
};
