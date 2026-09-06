"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../Errors/AppError"));
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../config"));
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Authorization header নেওয়া
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "You are not authorized");
            }
            // "Bearer eyJ..." থেকে শুধু token নেওয়া
            const token = authHeader.split(" ")[1];
            if (!token) {
                throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid authorization token");
            }
            // Access token verify + decode
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.access_token_secret);
            // Decoded user information request-এর মধ্যে রাখা
            req.user = verifiedUser;
            // Role authorization
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.auth = auth;
