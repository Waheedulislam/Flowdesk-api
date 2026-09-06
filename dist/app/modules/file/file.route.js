"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const upload_1 = __importDefault(require("../../middleware/upload"));
const file_controller_1 = require("./file.controller");
const router = express_1.default.Router();
router.post("/task/:taskId", (0, auth_1.auth)(), upload_1.default.single("file"), file_controller_1.FileController.uploadFile);
router.get("/task/:taskId", (0, auth_1.auth)(), file_controller_1.FileController.getTaskFiles);
router.delete("/:fileId", (0, auth_1.auth)(), file_controller_1.FileController.deleteFile);
exports.FileRoutes = router;
