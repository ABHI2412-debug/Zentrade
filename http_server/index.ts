import express from "express";
import users from "./src/routes/users.js";
import trade from "./src/routes/trade.js";
import cors from "cors";
import { storeTrade } from "./src/lib/poller.js";
import { initWebSocket } from "./src/lib/websocket.js";
import { connectRedis } from "./src/lib/redis.js";
import dotenv from "dotenv";
const app = express();

const port = 5001;
dotenv.config();

const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

async function startServer() {
  app.listen(port, () => {
    console.log(`Server started at port ${port}!!!`);
  });
}
async function init() {
  // Step 1: Connect to Redis FIRST
  await connectRedis();

  // Step 2: NOW import and initialize trade router (with connected redisClient)
  // The subscriber will be created with an already-connected client
  app.use("/api/v1", users);
  app.use("/api/v1/trade", trade);

  initWebSocket();
  startServer();
  await storeTrade();
}
init();
