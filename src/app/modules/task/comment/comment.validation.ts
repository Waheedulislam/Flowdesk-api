import { z } from "zod";

const createCommentValidationSchema = z.object({
  body: z.object({
    comment: z.string().min(1, "Comment is required"),
  }),
});

const updateCommentValidationSchema = z.object({
  body: z.object({
    comment: z.string().min(1, "Comment is required"),
  }),
});

export const CommentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
