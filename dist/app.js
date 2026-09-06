"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const app = (0, express_1.default)();
// Security
app.use((0, helmet_1.default)());
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
// Flow desk Check
app.get("/", (_req, res) => {
    res.status(http_status_codes_1.default.OK).json({
        success: true,
        message: "🚀 FlowDesk API is running...",
        version: "1.0.0",
    });
});
// API Routes
app.use("/api/v1", routes_1.default);
// Global Error Handler
app.use(globalErrorHandler_1.default);
// 404 Handler
app.use((req, res, _next) => {
    res.status(http_status_codes_1.default.NOT_FOUND).json({
        success: false,
        message: "API Not Found",
        error: {
            path: req.originalUrl,
            message: "The requested API endpoint does not exist.",
        },
    });
});
exports.default = app;
