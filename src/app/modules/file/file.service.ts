import httpStatus from "http-status-codes";
import prisma from "../../../config/prisma";
import AppError from "../../Errors/AppError";
import { IAuthUser } from "../../interface/common";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import cloudinary from "../../../config/cloudinary";

const uploadFile = async (
  taskId: string,
  file: Express.Multer.File,
  user: IAuthUser,
) => {
  // 1. Check Task
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
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

  // 3. Check Project Member
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId: user!.userId,
      },
    },
  });

  if (!projectMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this project",
    );
  }

  // 4. Upload to Cloudinary
  const uploadedFile = await uploadToCloudinary(
    file.buffer,
    `flowdesk/tasks/${taskId}`,
  );

  // 5. Save File in Database
  const newFile = await prisma.file.create({
    data: {
      taskId,
      fileName: file.originalname,
      url: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      uploadedBy: user!.userId,
    },
  });

  return newFile;
};

const getTaskFiles = async (taskId: string, user: IAuthUser) => {
  // 1. Check Task
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: task.project.workspaceId,
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

  // 3. Check Project Member
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: task.projectId,
        userId: user!.userId,
      },
    },
  });

  if (!projectMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this project",
    );
  }

  // 4. Get Task Files
  const files = await prisma.file.findMany({
    where: {
      taskId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return files;
};
const deleteFile = async (fileId: string, user: IAuthUser) => {
  // 1. Check File
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  // 2. Check Workspace Member
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: file.task.project.workspaceId,
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

  // 3. Check Project Member
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: file.task.projectId,
        userId: user!.userId,
      },
    },
  });

  if (!projectMember) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not a member of this project",
    );
  }

  // 4. Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary delete failed:", error);

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete file from Cloudinary",
    );
  }

  // 5. Delete from Database
  await prisma.file.delete({
    where: {
      id: fileId,
    },
  });

  return null;
};

export const FileService = {
  uploadFile,
  getTaskFiles,
  deleteFile,
};
