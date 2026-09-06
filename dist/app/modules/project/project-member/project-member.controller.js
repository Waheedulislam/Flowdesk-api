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
exports.ProjectMemberController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../../../utils/catchAsync");
const sendResponse_1 = require("../../../../utils/sendResponse");
const project_member_service_1 = require("./project-member.service");
// Add Member
const addProjectMember = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_member_service_1.ProjectMemberService.addProjectMember(req.params.projectId, req.body, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Project member added successfully",
        data: result,
    });
}));
// Get Members
const getProjectMembers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_member_service_1.ProjectMemberService.getProjectMembers(req.params.projectId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Project members retrieved successfully",
        data: result,
    });
}));
// Update Role
const updateProjectMemberRole = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_member_service_1.ProjectMemberService.updateProjectMemberRole(req.params.memberId, req.body, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Project member role updated successfully",
        data: result,
    });
}));
// Remove Member
const removeProjectMember = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield project_member_service_1.ProjectMemberService.removeProjectMember(req.params.memberId, req.user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Project member removed successfully",
        data: null,
    });
}));
exports.ProjectMemberController = {
    addProjectMember,
    getProjectMembers,
    updateProjectMemberRole,
    removeProjectMember,
};
