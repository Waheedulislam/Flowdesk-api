import prisma from "../../../config/prisma";
import {
  ActivityAction,
  ActivityEntity,
  ProjectRole,
  WorkspaceRole,
} from "../../../generated/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { createActivityLog } from "../activity-log/activity-log.utils";
import { ICreateProject } from "./project.interface";
import httpStatus from "http-status-codes";

const createProject = async (
  workspaceId: string,
  payload: ICreateProject,
  user: IAuthUser,
) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
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

  const project = await prisma.$transaction(async (tx) => {
    // Create Project
    const newProject = await tx.project.create({
      data: {
        workspaceId,
        name: payload.name,
        description: payload.description,
        createdBy: user!.userId,
      },
    });

    // Automatically add creator as Project Admin
    await tx.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: user!.userId,
        role: ProjectRole.PROJECT_ADMIN,
      },
    });
    // Create Activity Log
    await tx.activityLog.create({
      data: {
        userId: user!.userId,
        action: ActivityAction.CREATE,
        entity: ActivityEntity.PROJECT,
        entityId: newProject.id,
        metadata: {
          projectName: newProject.name,
          workspaceId: newProject.workspaceId,
        },
      },
    });

    return newProject;
  });

  return project;
};

const getProjects = async (workspaceId: string, user: IAuthUser) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(httpStatus.NOT_FOUND, "Workspace not found");
  }
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user!.userId,
      },
    },
  });
  console.log("workspaceMember:", workspaceMember);

  if (!workspaceMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this workspace",
    );
  }
  const projects = await prisma.project.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
};

const getSingleProject = async (projectId: string, user: IAuthUser) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

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

  return project;
};
const updateProject = async (
  projectId: string,
  payload: Partial<ICreateProject>,
  user: IAuthUser,
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

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

  if (
    workspaceMember.role !== WorkspaceRole.OWNER &&
    workspaceMember.role !== WorkspaceRole.ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only workspace owner or admin can update projects",
    );
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: payload,
  });

  // Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    action: ActivityAction.UPDATE,
    entity: ActivityEntity.PROJECT,
    entityId: updatedProject.id,
    metadata: {
      projectName: updatedProject.name,
      workspaceId: updatedProject.workspaceId,
    },
  });

  return updatedProject;
};
const deleteProject = async (projectId: string, user: IAuthUser) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

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

  if (
    workspaceMember.role !== WorkspaceRole.OWNER &&
    workspaceMember.role !== WorkspaceRole.ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only workspace owner or admin can delete projects",
    );
  }

  // Save project info before delete
  const projectName = project.name;

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  // Active log helpers - Create Activity Log
  await createActivityLog({
    userId: user!.userId,
    action: ActivityAction.DELETE,
    entity: ActivityEntity.PROJECT,
    entityId: projectId,
    metadata: {
      projectName,
      workspaceId: project.workspaceId,
    },
  });

  return null;
};

export const ProjectService = {
  createProject,
  getProjects,
  getSingleProject,
  updateProject,
  deleteProject,
};
