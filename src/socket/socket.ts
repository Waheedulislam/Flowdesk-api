import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("join-workspace", (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);

      console.log(`👥 Socket ${socket.id} joined workspace:${workspaceId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
