import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { IAuthUser } from "../../interface/common";
import httpStatus from "http-status-codes";
import { TaskService } from "./task.service";

const createTask = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TaskService.createTask(
      req.params.projectId as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Task created successfully",
      data: result,
    });
  },
);
const getTasks = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TaskService.getTasks(
      req.params.projectId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Tasks retrieved successfully",
      data: result,
    });
  },
);
const getSingleTask = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TaskService.getSingleTask(
      req.params.taskId as string,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Task retrieved successfully",
      data: result,
    });
  },
);
const updateTask = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TaskService.updateTask(
      req.params.taskId as string,
      req.body,
      req.user!,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Task updated successfully",
      data: result,
    });
  },
);

export const TaskController = {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
};
