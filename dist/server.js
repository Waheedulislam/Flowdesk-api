"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const socket_1 = require("./socket/socket");
const bootstrap = () => {
    const server = http_1.default.createServer(app_1.default);
    (0, socket_1.initializeSocket)(server);
    server.listen(config_1.default.port, () => {
        console.log(`🚀 FlowDesk Server running on http://localhost:${config_1.default.port}`);
    });
};
bootstrap();
