"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const file_service_1 = require("./file.service");
const uploadFile = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    if (!req.file) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No file uploaded");
    }
    const result = yield file_service_1.FileService.uploadFile(req.params.taskId, req.file, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "File uploaded successfully",
        data: result,
    });
}));
const getTaskFiles = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield file_service_1.FileService.getTaskFiles(req.params.taskId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Task files retrieved successfully",
        data: result,
    });
}));
const deleteFile = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    yield file_service_1.FileService.deleteFile(req.params.fileId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "File deleted successfully",
        data: null,
    });
}));
exports.FileController = {
    uploadFile,
    getTaskFiles,
    deleteFile,
};
