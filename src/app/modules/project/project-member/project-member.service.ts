import httpStatus from "http-status-codes";
import prisma from "../../../../config/prisma";
import AppError from "../../../Errors/AppError";
import { IAuthUser } from "../../../interface/common";
import { ProjectRole, WorkspaceRole } from "../../../../generated/prisma";
import { IAddProjectMember } from "./project-member.interface";

const addProjectMember = async (
  projectId: string,
  payload: IAddProjectMember,
  user: IAuthUser,
) => {
  // 1. Check Project Exists
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  // 2. Check Login User is Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId: user!.userId,
      },
    },
  });

  if (!workspaceMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }

  // 3. Only OWNER / ADMIN Can Add Members
  if (
    workspaceMember.role !== WorkspaceRole.OWNER &&
    workspaceMember.role !== WorkspaceRole.ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only workspace owner or admin can add project members",
    );
  }

  // 4. Check Target User is Workspace Member
  const targetMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId: payload.userId,
      },
    },
  });

  if (!targetMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is not a workspace member",
    );
  }

  // 5. Check Already Added
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: payload.userId,
      },
    },
  });

  if (existingMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is already a project member",
    );
  }

  // 6. Add Project Member
  const projectMember = await prisma.projectMember.create({
    data: {
      projectId,
      userId: payload.userId,
      role: payload.role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return projectMember;
};

const getProjectMembers = async (projectId: string, user: IAuthUser) => {
  // 1. Check Project Exists
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  // 2. Check Login User is Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId: user.userId,
      },
    },
  });

  if (!workspaceMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }

  // 3. Get Project Members
  const members = await prisma.projectMember.findMany({
    where: {
      projectId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  return members;
};

export const ProjectMemberService = {
  addProjectMember,
  getProjectMembers,
};
