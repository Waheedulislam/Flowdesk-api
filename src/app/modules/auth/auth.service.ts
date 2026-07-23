import prisma from "../../../config/prisma";
import { IRegisterUser } from "./auth.interface";

const registerUser = async (payload: IRegisterUser) => {
  const isUserExists = await prisma.user;
};

export const AuthService = {
  registerUser,
};
