import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import AppError from "../Errors/AppError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";

export const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Authorization header নেওয়া
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      // "Bearer eyJ..." থেকে শুধু token নেওয়া
      const token = authHeader.split(" ")[1];

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authorization token",
        );
      }

      // Access token verify + decode
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_token_secret as Secret,
      );

      // Decoded user information request-এর মধ্যে রাখা
      req.user = verifiedUser;

      // Role authorization
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
