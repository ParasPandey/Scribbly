import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { runningSocket } from "./socket/socket";

const allowedOrigins = [process.env.CLIENT_URL].filter((url): url is string =>
  Boolean(url)
);

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => res.send("Game server is running 🚀"));

const server = http.createServer(app);
// Apply to Socket.IO
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ------------- sockets -------------
runningSocket();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
