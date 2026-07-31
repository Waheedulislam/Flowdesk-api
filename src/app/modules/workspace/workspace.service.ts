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
export const WorkspaceService = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceBySlug,
};
