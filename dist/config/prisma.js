"use strict";
// import { PrismaClient } from "../generated/prisma/client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const prisma = new PrismaClient();
// export default prisma;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const index_1 = __importDefault(require("./index"));
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: index_1.default.databaseUrl,
});
const prisma = new client_1.PrismaClient({
    adapter,
});
exports.default = prisma;
