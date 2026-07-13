import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import httpStatus from "http-status-codes";

import globalErrorHandler from "./app/middleware/globalErrorHandler";

const app = express();

// Security
app.use(helmet());

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Flow desk Check
app.get("/", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "🚀 FlowDesk API is running...",
    version: "1.0.0",
  });
});

// API Routes
// app.use("/api/v1", router);
app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FlowDesk API v1",
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// 404 Handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found",
    error: {
      path: req.originalUrl,
      message: "The requested API endpoint does not exist.",
    },
  });
});

export default app;
