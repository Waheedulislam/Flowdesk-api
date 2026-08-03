import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { IAuthUser } from "../../interface/common";
import { ProjectService } from "./project.service";

const createProject = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ProjectService.createProject(
      req.params.workspaceId as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Project created successfully",
      data: result,
    });
  },
);

const getProjects = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ProjectService.getProjects(
      req.params.workspaceId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Projects retrieved successfully",
      data: result,
    });
  },
);

export const ProjectController = {
  createProject,
  getProjects,
};
