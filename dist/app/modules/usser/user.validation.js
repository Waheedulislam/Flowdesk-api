"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const updateMyProfileValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name cannot exceed 100 characters")
            .optional(),
        avatar: zod_1.z.string().url("Avatar must be a valid URL").optional(),
        phone: zod_1.z
            .string()
            .trim()
            .min(11, "Phone number is too short")
            .max(15, "Phone number is too long")
            .optional(),
        bio: zod_1.z
            .string()
            .trim()
            .max(500, "Bio cannot exceed 500 characters")
            .optional(),
        designation: zod_1.z
            .string()
            .trim()
            .max(100, "Designation cannot exceed 100 characters")
            .optional(),
        dateOfBirth: zod_1.z.coerce.date().optional(),
        gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    }),
});
exports.UserValidation = {
    updateMyProfileValidationSchema,
};
