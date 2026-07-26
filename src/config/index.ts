import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  clientUrl: process.env.CLIENT_URL!,

  databaseUrl: process.env.DATABASE_URL!,

  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET!,
    access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,

    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET!,
    refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  redis: {
    url: process.env.REDIS_URL,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  mail: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

export default config;
