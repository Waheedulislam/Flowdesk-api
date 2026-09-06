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
exports.ActivityLogController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const activity_log_service_1 = require("./activity-log.service");
const catchAsync_1 = require("../../../utils/catchAsync");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const sendResponse_1 = require("../../../utils/sendResponse");
const getActivityLogs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { workspaceId } = req.params;
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield activity_log_service_1.ActivityLogService.getActivityLogs(workspaceId, req.user, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Activity logs retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
exports.ActivityLogController = {
    getActivityLogs,
};
