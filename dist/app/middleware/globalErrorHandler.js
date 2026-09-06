"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const zod_1 = require("zod");
const HandlleZodError_1 = __importDefault(require("../Errors/HandlleZodError"));
const globalErrorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR;
    let message = error.message || "Something went wrong!";
    let errors = null;
    if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, HandlleZodError_1.default)(error);
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
exports.default = globalErrorHandler;
