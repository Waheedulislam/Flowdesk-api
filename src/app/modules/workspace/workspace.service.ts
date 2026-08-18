import slugify from "slugify";
import { ICreateWorkspace } from "./workspace.interface";
import { IAuthUser } from "../../interface/common";
import prisma from "../../../config/prisma";
import { WorkspaceRole } from "../../../generated/prisma";
import AppError from "../../Errors/AppError";
import httpStatus from "http-status-codes";

const createWorkspace = async (payload: ICreateWorkspace, user: IAuthUser) => {
  const baseSlug = slugify(payload.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  let existingWorkspace = await prisma.workspace.findUnique({
    where: {
      slug,
    },
  });

  while (existingWorkspace) {
    counter++;

    slug = `${baseSlug}-${counter}`;

    existingWorkspace = await prisma.workspace.findUnique({
      where: {
        slug,
      },
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: payload.name,
        slug,
        description: payload.description,
        logo: payload.logo,
        ownerId: user!.userId,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user!.userId,
        role: WorkspaceRole.OWNER,
      },
    });

    return workspace;
  });

  return result;
};

const getMyWorkspaces = async (user: IAuthUser) => {
  const workspaces = await prisma.workspace.findMany({
    where: {
      //Prisma ভেতরে ভেতরে এমনভাবে চিন্তা করছে:

      // Workspace table থেকে এক একটা Workspace নাও।
      // তারপর WorkspaceMember table-এ দেখো, এই Workspace-এর জন্য login user-এর (userId) কোনো member record আছে কি না।
      // ✅ থাকলে → সেই Workspace return করো।
      // ❌ না থাকলে → সেই Workspace বাদ দাও।
      workspaceMembers: {
        some: {
          userId: user!.userId,
        },
      },
    },
    include: {
      workspaceMembers: {
        where: {
          userId: user!.userId,
        },
        select: {
          role: true,
          joinedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedWorkspaces = workspaces.map((workspace) => {
    const { workspaceMembers, ...workspaceData } = workspace;
    return {
      ...workspaceData,
      role: workspaceMembers[0]?.role,
    };
  });
  return formattedWorkspaces;
};

const getWorkspaceBySlug = async (slug: string, user: IAuthUser) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      workspaceMembers: {
        some: {
          userId: user!.userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      workspaceMembers: {
        where: {
          userId: user?.userId,
        },
        select: {
          role: true,
        },
      },
    },
  });
  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }
  const { workspaceMembers, ...workspaceData } = workspace;
  const workspaceMemberRole = workspaceMembers[0]?.role;

  return {
    ...workspaceData,
    role: workspaceMemberRole,
  };
};

const updateMemberRole = async (
  workspaceId: string,
  memberId: string,
  payload: {
    role: WorkspaceRole;
  },
  user: IAuthUser,
) => {
  // 1. Workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  // 2. Current user must be OWNER
  const currentMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (!currentMember || currentMember.role !== WorkspaceRole.OWNER) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only workspace owner can update member roles",
    );
  }

  // 3. Target  /এখানে যার role change করব তাকে খুঁজছি।
  const targetMember = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId,
    },
  });

  if (!targetMember) {
    throw new AppError(httpStatus.NOT_FOUND, "Member not found");
  }

  // 4. Owner protection
  if (targetMember.role === WorkspaceRole.OWNER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Workspace owner role cannot be changed",
    );
  }

  // 5. Same role check
  if (targetMember.role === payload.role) {
    throw new AppError(httpStatus.BAD_REQUEST, "Member already has this role");
  }

  // 6. Update
  const updatedMember = await prisma.workspaceMember.update({
    where: {
      id: memberId,
    },
    data: {
      role: payload.role,
    },
  });

  return updatedMember;
};
const getWorkspaceMembers = async (workspaceId: string, user: IAuthUser) => {
  // 1. Check workspace + current user's membership
  const currentMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (!currentMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }

  // 2. Get all workspace members
  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          designation: true,
          jobTitle: true,
          status: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  return members;
};
const removeMember = async (
  workspaceId: string,
  memberId: string,
  user: IAuthUser,
) => {
  // Check workspace
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  // Check current user
  const currentMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (!currentMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }

  // Check target member
  const targetMember = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId,
    },
  });

  if (!targetMember) {
    throw new AppError(httpStatus.NOT_FOUND, "Member not found");
  }

  // MEMBER cannot remove anyone
  if (currentMember.role === WorkspaceRole.MEMBER) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to remove members",
    );
  }

  // ADMIN can remove only MEMBER
  if (
    currentMember.role === WorkspaceRole.ADMIN &&
    targetMember.role !== WorkspaceRole.MEMBER
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only remove members");
  }

  // OWNER cannot be removed
  if (targetMember.role === WorkspaceRole.OWNER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Workspace owner cannot be removed",
    );
  }

  // Delete member
  const deletedMember = await prisma.workspaceMember.delete({
    where: {
      id: targetMember.id,
    },
  });

  return deletedMember;
};

const leaveWorkspace = async (workspaceId: string, user: IAuthUser) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  const currentMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (!currentMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }

  if (currentMember.role === WorkspaceRole.OWNER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Workspace owner cannot leave the workspace",
    );
  }
  await prisma.workspaceMember.delete({
    where: {
      id: currentMember.id,
    },
  });

  return null;
};

export const WorkspaceService = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceBySlug,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
};
