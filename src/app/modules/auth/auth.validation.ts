import z from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z.email("Invalid email address").trim().toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password cannot exceed 100 characters"),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),

    password: z.string().min(1, "Password is required"),
  }),
});

export const AuthValidation = {
  registerSchema,
  loginValidationSchema,
};
