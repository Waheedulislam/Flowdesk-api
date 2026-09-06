"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middleware/auth");
const validateRequest_1 = __importDefault(require("../../../middleware/validateRequest"));
const comment_validation_1 = require("./comment.validation");
const comment_controller_1 = require("./comment.controller");
const router = express_1.default.Router();
// Create Comment
router.post("/:taskId/comments", (0, auth_1.auth)(), (0, validateRequest_1.default)(comment_validation_1.CommentValidation.createCommentValidationSchema), comment_controller_1.CommentController.createComment);
// Get Comments
router.get("/:taskId/comments", (0, auth_1.auth)(), comment_controller_1.CommentController.getComments);
// Update Comment
router.patch("/comments/:commentId", (0, auth_1.auth)(), (0, validateRequest_1.default)(comment_validation_1.CommentValidation.updateCommentValidationSchema), comment_controller_1.CommentController.updateComment);
// Delete Comment
router.delete("/comments/:commentId", (0, auth_1.auth)(), comment_controller_1.CommentController.deleteComment);
exports.CommentRoutes = router;
