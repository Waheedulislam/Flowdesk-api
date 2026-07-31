import httpStatus from "http-status-codes";
import { WorkspaceService } from "./workspace.service";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { Request, Response } from "express";
import { IAuthUser } from "../../interface/common";

const createWorkspace = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const payload = req.body;

    const result = await WorkspaceService.createWorkspace(payload, req.user!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Workspace created successfully",
      data: result,
    });
  },
);
const getMyWorkspaces = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await WorkspaceService.getMyWorkspaces(req.user!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Workspaces retrieved successfully",
      data: result,
    });
  },
);
const getWorkspaceBySlug = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const slug = req.params.slug as string;

    const result = await WorkspaceService.getWorkspaceBySlug(slug, req.user!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Workspace retrieved successfully",
      data: result,
    });
  },
);

const updateMemberRole = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await WorkspaceService.updateMemberRole(
      req.params.workspaceId as string,
      req.params.memberId as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Member role updated successfully",
      data: result,
    });
  },
);

export const WorkspaceController = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceBySlug,
  updateMemberRole,
};
