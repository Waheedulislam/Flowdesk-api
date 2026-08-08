import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { FileService } from "./file.service";

const uploadFile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    if (!req.file) {
      throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
    }

    const result = await FileService.uploadFile(
      req.params.taskId as string,
      req.file,
      req.user,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "File uploaded successfully",
      data: result,
    });
  },
);

export const FileController = {
  uploadFile,
};
