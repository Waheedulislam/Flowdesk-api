import { UserRole } from "../../generated/prisma";

export type IAuthUser = {
  userId: string;
  email: string;
  role: UserRole;
} | null;
