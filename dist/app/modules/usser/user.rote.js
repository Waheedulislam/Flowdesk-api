"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = require("../../middleware/auth");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("./user.validation");
const upload_1 = __importDefault(require("../../middleware/upload"));
const router = (0, express_1.Router)();
router.get("/me", (0, auth_1.auth)(), user_controller_1.UserController.getMyProfile);
router.post("/me/avatar", (0, auth_1.auth)(), upload_1.default.single("avatar"), user_controller_1.UserController.uploadAvatar);
router.delete("/me/avatar", (0, auth_1.auth)(), user_controller_1.UserController.deleteAvatar);
router.patch("/update-profile", (0, auth_1.auth)(), (0, validateRequest_1.default)(user_validation_1.UserValidation.updateMyProfileValidationSchema), user_controller_1.UserController.updateMyProfile);
exports.UserRoutes = router;
