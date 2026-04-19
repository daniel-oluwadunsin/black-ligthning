import { config } from "dotenv";

config();

const Env = {
  databaseUrl: <string>process.env.DATABASE_URL || "",
  redis: {
    host: <string>process.env.REDIS_HOST || "",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: <string>process.env.REDIS_PASSWORD || "",
    username: <string>process.env.REDIS_USERNAME || "",
  },
  jwtSecret: <string>process.env.JWT_SECRET || "your_jwt_secret_key",
};

export default Env;
