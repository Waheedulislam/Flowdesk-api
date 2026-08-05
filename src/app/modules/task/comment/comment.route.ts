import express from "express";
import { auth } from "../../../middleware/auth";
import validateRequest from "../../../middleware/validateRequest";
import { CommentValidation } from "./comment.validation";
import { CommentController } from "./comment.controller";

const router = express.Router();

// Create Comment
router.post(
  "/:taskId/comments",
  auth(),
  validateRequest(CommentValidation.createCommentValidationSchema),
  CommentController.createComment,
);

// Get Comments
router.get("/:taskId/comments", auth(), CommentController.getComments);

// Update Comment
router.patch(
  "/comments/:commentId",
  auth(),
  validateRequest(CommentValidation.updateCommentValidationSchema),
  CommentController.updateComment,
);

// Delete Comment
router.delete("/comments/:commentId", auth(), CommentController.deleteComment);

export const CommentRoutes = router;
