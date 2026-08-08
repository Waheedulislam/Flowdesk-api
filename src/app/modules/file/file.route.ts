import express from "express";
import { auth } from "../../middleware/auth";
import upload from "../../middleware/upload";
import { FileController } from "./file.controller";

const router = express.Router();

router.post(
  "/task/:taskId",
  auth(),
  upload.single("file"),
  FileController.uploadFile,
);

export const FileRoutes = router;
