import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { catchAsync } from "../../../../utils/catchAsync";
import { sendResponse } from "../../../../utils/sendResponse";
import { IAuthUser } from "../../../interface/common";
import { ProjectMemberService } from "./project-member.service";

// Add Member
const addProjectMember = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ProjectMemberService.addProjectMember(
      req.params.projectId as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Project member added successfully",
      data: result,
    });
  },
);

// Get Members
const getProjectMembers = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ProjectMemberService.getProjectMembers(
      req.params.projectId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Project members retrieved successfully",
      data: result,
    });
  },
);

// Update Role
const updateProjectMemberRole = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ProjectMemberService.updateProjectMemberRole(
      req.params.memberId,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Project member role updated successfully",
      data: result,
    });
  },
);

// Remove Member
const removeProjectMember = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    await ProjectMemberService.removeProjectMember(
      req.params.memberId,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Project member removed successfully",
      data: null,
    });
  },
);

export const ProjectMemberController = {
  addProjectMember,
  getProjectMembers,
  updateProjectMemberRole,
  removeProjectMember,
};
