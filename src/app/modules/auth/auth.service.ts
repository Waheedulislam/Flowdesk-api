import prisma from "../../../config/prisma";
import { IRegisterUser } from "./auth.interface";

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  // const hashPassword=await
  // const isUserExists = await prisma.user.create();
};

export const AuthService = {
  registerUser,
};
