import httpStatus from "http-status-codes";
import { Request, Response } from "express";

import { catchAsync } from "../../../../utils/catchAsync";
import { sendResponse } from "../../../../utils/sendResponse";
import { IAuthUser } from "../../../interface/common";
import { CommentService } from "./comment.service";

// Create Comment
const createComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await CommentService.createComment(
      req.params.taskId as string as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comment created successfully",
      data: result,
    });
  },
);

// Get Comments
const getComments = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await CommentService.getComments(
      req.params.taskId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comments retrieved successfully",
      data: result,
    });
  },
);

// Update Comment
const updateComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await CommentService.updateComment(
      req.params.commentId as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment updated successfully",
      data: result,
    });
  },
);

// Delete Comment
const deleteComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    await CommentService.deleteComment(
      req.params.commentId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment deleted successfully",
      data: null,
    });
  },
);

export const CommentController = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
