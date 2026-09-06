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
exports.InvitationController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const invitation_service_1 = require("./invitation.service");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const createInvitation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    console.log(req.params.workspaceId, req.body, req.user);
    const result = yield invitation_service_1.InvitationService.createInvitation(req.params.workspaceId, req.body, req.user);
    console.log(result);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Invitation sent successfully",
        data: result,
    });
}));
const getWorkspaceInvitations = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield invitation_service_1.InvitationService.getWorkspaceInvitations(req.params.workspaceId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Workspace invitations retrieved successfully",
        data: result,
    });
}));
const acceptInvitation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield invitation_service_1.InvitationService.acceptInvitation(req.params.token, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Invitation accepted successfully",
        data: result,
    });
}));
const cancelInvitation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield invitation_service_1.InvitationService.cancelInvitation(req.params.workspaceId, req.params.invitationId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Invitation cancelled successfully",
        data: result,
    });
}));
exports.InvitationController = {
    createInvitation,
    getWorkspaceInvitations,
    acceptInvitation,
    cancelInvitation,
};
