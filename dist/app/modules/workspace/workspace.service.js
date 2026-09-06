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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = __importDefault(require("../../../config/prisma"));
const prisma_2 = require("../../../generated/prisma");
const AppError_1 = __importDefault(require("../../Errors/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createWorkspace = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const baseSlug = (0, slugify_1.default)(payload.name, {
        lower: true,
        strict: true,
        trim: true,
    });
    let slug = baseSlug;
    let counter = 1;
    let existingWorkspace = yield prisma_1.default.workspace.findUnique({
        where: {
            slug,
        },
    });
    while (existingWorkspace) {
        counter++;
        slug = `${baseSlug}-${counter}`;
        existingWorkspace = yield prisma_1.default.workspace.findUnique({
            where: {
                slug,
            },
        });
    }
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const workspace = yield tx.workspace.create({
            data: {
                name: payload.name,
                slug,
                description: payload.description,
                logo: payload.logo,
                ownerId: user.userId,
            },
        });
        yield tx.workspaceMember.create({
            data: {
                workspaceId: workspace.id,
                userId: user.userId,
                role: prisma_2.WorkspaceRole.OWNER,
            },
        });
        return workspace;
    }));
    return result;
});
const getMyWorkspaces = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const workspaces = yield prisma_1.default.workspace.findMany({
        where: {
            //Prisma ভেতরে ভেতরে এমনভাবে চিন্তা করছে:
            // Workspace table থেকে এক একটা Workspace নাও।
            // তারপর WorkspaceMember table-এ দেখো, এই Workspace-এর জন্য login user-এর (userId) কোনো member record আছে কি না।
            // ✅ থাকলে → সেই Workspace return করো।
            // ❌ না থাকলে → সেই Workspace বাদ দাও।
            workspaceMembers: {
                some: {
                    userId: user.userId,
                },
            },
        },
        include: {
            workspaceMembers: {
                where: {
                    userId: user.userId,
                },
                select: {
                    role: true,
                    joinedAt: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const formattedWorkspaces = workspaces.map((workspace) => {
        var _a;
        const { workspaceMembers } = workspace, workspaceData = __rest(workspace, ["workspaceMembers"]);
        return Object.assign(Object.assign({}, workspaceData), { role: (_a = workspaceMembers[0]) === null || _a === void 0 ? void 0 : _a.role });
    });
    return formattedWorkspaces;
});
const getWorkspaceBySlug = (slug, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const workspace = yield prisma_1.default.workspace.findFirst({
        where: {
            slug,
            workspaceMembers: {
                some: {
                    userId: user.userId,
                },
            },
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            workspaceMembers: {
                where: {
                    userId: user === null || user === void 0 ? void 0 : user.userId,
                },
                select: {
                    role: true,
                },
            },
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    const { workspaceMembers } = workspace, workspaceData = __rest(workspace, ["workspaceMembers"]);
    const workspaceMemberRole = (_a = workspaceMembers[0]) === null || _a === void 0 ? void 0 : _a.role;
    return Object.assign(Object.assign({}, workspaceData), { role: workspaceMemberRole });
});
const updateMemberRole = (workspaceId, memberId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Workspace exists
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // 2. Current user must be OWNER
    const currentMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!currentMember || currentMember.role !== prisma_2.WorkspaceRole.OWNER) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only workspace owner can update member roles");
    }
    // 3. Target  /এখানে যার role change করব তাকে খুঁজছি।
    const targetMember = yield prisma_1.default.workspaceMember.findFirst({
        where: {
            id: memberId,
            workspaceId,
        },
    });
    if (!targetMember) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Member not found");
    }
    // 4. Owner protection
    if (targetMember.role === prisma_2.WorkspaceRole.OWNER) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Workspace owner role cannot be changed");
    }
    // 5. Same role check
    if (targetMember.role === payload.role) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Member already has this role");
    }
    // 6. Update
    const updatedMember = yield prisma_1.default.workspaceMember.update({
        where: {
            id: memberId,
        },
        data: {
            role: payload.role,
        },
    });
    return updatedMember;
});
const getWorkspaceMembers = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check workspace + current user's membership
    const currentMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!currentMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // 2. Get all workspace members
    const members = yield prisma_1.default.workspaceMember.findMany({
        where: {
            workspaceId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    designation: true,
                    jobTitle: true,
                    status: true,
                },
            },
        },
        orderBy: {
            joinedAt: "asc",
        },
    });
    return members;
});
const removeMember = (workspaceId, memberId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Check workspace
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    // Check current user
    const currentMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!currentMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    // Check target member
    const targetMember = yield prisma_1.default.workspaceMember.findFirst({
        where: {
            id: memberId,
            workspaceId,
        },
    });
    if (!targetMember) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Member not found");
    }
    // MEMBER cannot remove anyone
    if (currentMember.role === prisma_2.WorkspaceRole.MEMBER) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to remove members");
    }
    // ADMIN can remove only MEMBER
    if (currentMember.role === prisma_2.WorkspaceRole.ADMIN &&
        targetMember.role !== prisma_2.WorkspaceRole.MEMBER) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You can only remove members");
    }
    // OWNER cannot be removed
    if (targetMember.role === prisma_2.WorkspaceRole.OWNER) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Workspace owner cannot be removed");
    }
    // Delete member
    const deletedMember = yield prisma_1.default.workspaceMember.delete({
        where: {
            id: targetMember.id,
        },
    });
    return deletedMember;
});
const leaveWorkspace = (workspaceId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const workspace = yield prisma_1.default.workspace.findUnique({
        where: {
            id: workspaceId,
        },
    });
    if (!workspace) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Workspace not found");
    }
    const currentMember = yield prisma_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.userId,
            },
        },
    });
    if (!currentMember) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not a member of this workspace");
    }
    if (currentMember.role === prisma_2.WorkspaceRole.OWNER) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Workspace owner cannot leave the workspace");
    }
    yield prisma_1.default.workspaceMember.delete({
        where: {
            id: currentMember.id,
        },
    });
    return null;
});
exports.WorkspaceService = {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceBySlug,
    getWorkspaceMembers,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
};
