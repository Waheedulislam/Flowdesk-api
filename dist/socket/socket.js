"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on("join-workspace", (workspaceId) => {
            socket.join(`workspace:${workspaceId}`);
            console.log(`👥 Socket ${socket.id} joined workspace:${workspaceId}`);
        });
        socket.on("disconnect", () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
