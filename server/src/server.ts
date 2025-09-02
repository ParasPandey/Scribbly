import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { runningSocket } from "./socket/socket";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("Game server is running 🚀"));

const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ------------- sockets -------------
runningSocket();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
