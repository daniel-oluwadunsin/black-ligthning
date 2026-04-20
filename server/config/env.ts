import { config } from "dotenv";

config();

const Env = {
  databaseUrl: <string>process.env.DATABASE_URL || "",
  port: parseInt(process.env.PORT || "3000", 10),
  redis: {
    host: <string>process.env.REDIS_HOST || "",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: <string>process.env.REDIS_PASSWORD || "",
    username: <string>process.env.REDIS_USERNAME || "",
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  },
  jwtSecret: <string>process.env.JWT_SECRET || "your_jwt_secret_key",
  gcs: {
    projectId: <string>process.env.GCS_PROJECT_ID || "",
    bucketName: <string>process.env.GCS_BUCKET_NAME || "",
    privateKey: <string>process.env.GCS_PRIVATE_KEY || "",
    clientEmail: <string>process.env.GCS_CLIENT_EMAIL || "",
  },
};

export default Env;
