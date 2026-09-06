"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidation = void 0;
const zod_1 = require("zod");
const createCommentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        comment: zod_1.z.string().min(1, "Comment is required"),
    }),
});
const updateCommentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        comment: zod_1.z.string().min(1, "Comment is required"),
    }),
});
exports.CommentValidation = {
    createCommentValidationSchema,
    updateCommentValidationSchema,
};
