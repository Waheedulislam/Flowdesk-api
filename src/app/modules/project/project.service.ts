import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
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
  console.log("workspaceId:", workspaceId);
  console.log("user:", user);

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

  const project = await prisma.project.create({
    data: {
      workspaceId,
      name: payload.name,
      description: payload.description,
      createdBy: user!.userId,
    },
  });

  return project;
};

export const ProjectService = {
  createProject,
};
