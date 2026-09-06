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
exports.WorkspaceController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const workspace_service_1 = require("./workspace.service");
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const createWorkspace = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield workspace_service_1.WorkspaceService.createWorkspace(payload, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Workspace created successfully",
        data: result,
    });
}));
const getMyWorkspaces = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield workspace_service_1.WorkspaceService.getMyWorkspaces(req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Workspaces retrieved successfully",
        data: result,
    });
}));
const getWorkspaceBySlug = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield workspace_service_1.WorkspaceService.getWorkspaceBySlug(slug, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Workspace retrieved successfully",
        data: result,
    });
}));
const getWorkspaceMembers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield workspace_service_1.WorkspaceService.getWorkspaceMembers(req.params.workspaceId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Workspace members retrieved successfully",
        data: result,
    });
}));
const updateMemberRole = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield workspace_service_1.WorkspaceService.updateMemberRole(req.params.workspaceId, req.params.memberId, req.body, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Member role updated successfully",
        data: result,
    });
}));
const removeMember = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield workspace_service_1.WorkspaceService.removeMember(req.params.workspaceId, req.params.memberId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Member removed successfully",
        data: result,
    });
}));
const leaveWorkspace = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield workspace_service_1.WorkspaceService.leaveWorkspace(req.params.workspaceId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "You left the workspace successfully",
        data: result,
    });
}));
exports.WorkspaceController = {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceBySlug,
    getWorkspaceMembers,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
};
