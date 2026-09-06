"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationValidation = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../generated/prisma");
const createInvitationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().email("Invalid email address"),
        role: zod_1.z.nativeEnum(prisma_1.WorkspaceRole),
    }),
});
exports.InvitationValidation = {
    createInvitationValidationSchema,
};
