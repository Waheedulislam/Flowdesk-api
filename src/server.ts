import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import config from "./config";

function bootstrap() {
  app.listen(config.port, () => {
    console.log(
      `🚀 FlowDesk Server running on http://localhost:${config.port}`,
    );
  });
}

bootstrap();
