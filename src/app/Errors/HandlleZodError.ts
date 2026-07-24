import { ZodError } from "zod";

const handleZodError = (error: ZodError) => {
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

export default handleZodError;
