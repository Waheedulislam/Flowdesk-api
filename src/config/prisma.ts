// import { PrismaClient } from "../generated/prisma/client";

// const prisma = new PrismaClient();

// export default prisma;
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import config from "./index";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
