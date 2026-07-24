import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ZodError } from "zod";
import handleZodError from "../Errors/HandlleZodError";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  let message = error.message || "Something went wrong!";

  let errors = null;

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errors = simplifiedError.errors;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;
