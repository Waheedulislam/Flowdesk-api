import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { catchAsync } from "../../../utils/catchAsync";
import { IAuthUser } from "../../interface/common";
import { sendResponse } from "../../../utils/sendResponse";
import { InvitationService } from "./invitation.service";
import AppError from "../../Errors/AppError";

const createInvitation = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await InvitationService.createInvitation(
      req.params.workspaceId as string,
      req.body,
      req.user,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Invitation sent successfully",
      data: result,
    });
  },
);
const acceptInvitation = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await InvitationService.acceptInvitation(
      req.params.token as string,
      req.user!,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invitation accepted successfully",
      data: result,
    });
  },
);

export const InvitationController = {
  createInvitation,
  acceptInvitation,
};
