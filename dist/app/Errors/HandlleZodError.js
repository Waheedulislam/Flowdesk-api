"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (error) => {
    const errors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
    }));
    return {
        statusCode: 400,
        message: "Validation failed",
        errors,
    };
};
exports.default = handleZodError;
