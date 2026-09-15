import { Server as HttpServer } from "http";
import { Secret } from "jsonwebtoken";
import { Server } from "socket.io";
import { WorkspaceService } from "../app/modules/workspace/workspace.service";
import config from "../config";
import { jwtHelpers } from "../helpers/jwtHelpers";

type WorkspaceRoomResponse =
  { ok: true } | { ok: false; error: "Workspace access denied" };

const getWorkspaceRoomName = (workspaceId: string) =>
  `workspace:${workspaceId}`;

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const accessToken = socket.handshake.auth?.accessToken;
    if (typeof accessToken !== "string" || !accessToken) {
      return next(new Error("unauthorized"));
    }

    try {
      const verifiedUser = jwtHelpers.verifyToken(
        accessToken,
        config.jwt.access_token_secret as Secret,
      );
      if (typeof verifiedUser.userId !== "string" || !verifiedUser.userId) {
        return next(new Error("unauthorized"));
      }

      socket.data.user = { userId: verifiedUser.userId };
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on(
      "join-workspace",
      async (
        workspaceId: unknown,
        acknowledge?: (response: WorkspaceRoomResponse) => void,
      ) => {
        const denyAccess = () =>
          acknowledge?.({ ok: false, error: "Workspace access denied" });
        const userId = socket.data.user?.userId;

        if (
          typeof workspaceId !== "string" ||
          !workspaceId ||
          typeof userId !== "string"
        ) {
          denyAccess();
          return;
        }

        try {
          const isAuthorized = await WorkspaceService.hasActiveMembership(
            userId,
            workspaceId,
          );
          if (!isAuthorized) {
            denyAccess();
            return;
          }

          await socket.join(getWorkspaceRoomName(workspaceId));
          acknowledge?.({ ok: true });
        } catch {
          denyAccess();
        }
      },
    );

    socket.on(
      "leave-workspace",
      (
        workspaceId: unknown,
        acknowledge?: (response: WorkspaceRoomResponse) => void,
      ) => {
        if (
          typeof workspaceId !== "string" ||
          !workspaceId ||
          typeof socket.data.user?.userId !== "string"
        ) {
          acknowledge?.({ ok: false, error: "Workspace access denied" });
          return;
        }

        void socket.leave(getWorkspaceRoomName(workspaceId));
        acknowledge?.({ ok: true });
      },
    );

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
