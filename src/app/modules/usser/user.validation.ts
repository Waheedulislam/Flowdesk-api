import { z } from "zod";

const updateMyProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    avatar: z.string().url("Avatar must be a valid URL").optional(),

    phone: z
      .string()
      .trim()
      .min(11, "Phone number is too short")
      .max(15, "Phone number is too long")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters")
      .optional(),

    designation: z
      .string()
      .trim()
      .max(100, "Designation cannot exceed 100 characters")
      .optional(),

    dateOfBirth: z.coerce.date().optional(),

    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  }),
});

export const UserValidation = {
  updateMyProfileValidationSchema,
};
