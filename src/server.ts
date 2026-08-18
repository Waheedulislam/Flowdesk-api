import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import config from "./config";
import { initializeSocket } from "./socket/socket";

const bootstrap = () => {
  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(config.port, () => {
    console.log(
      `🚀 FlowDesk Server running on http://localhost:${config.port}`,
    );
  });
};

bootstrap();
