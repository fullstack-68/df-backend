import "dotenv/config";
import Debug from "debug";
import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { PORT } from "./env.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const debug = Debug("myapp");
const app = express();
app.use(cors({ origin: false }));

// Endpoints
app.get("/", async (req, res, next) => {
  res.send("OK");
});

app.get("/clock", async (req, res, next) => {
  // const dtStr = dayjs().format("DD/MM/YYYY HH:mm:ss");
  const dtStr = dayjs().format("HH:mm:ss");
  res.json({ data: dtStr });
});

// Server-Send Event Endpoint
app.get("/sse/clock", async (req, res, next) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  const intervalID = setInterval(() => {
    // const dtStr = dayjs().format("DD/MM/YYYY HH:mm:ss");
    const dtStr = dayjs().format("HH:mm:ss");
    // ! Need \n\n at the end
    res.write(`data: ${dtStr}\n\n`);
  }, 1000);

  req.on("close", () => {
    debug("Close connection");
    clearInterval(intervalID);
  });
});

// SocketIO Integration
const server = http.createServer(app);
const io = new SocketIOServer(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  setInterval(function () {
    // const dtStr = dayjs().format("DD/MM/YYYY HH:mm:ss");
    const dtStr = dayjs().format("HH:mm:ss");
    io.sockets.emit("clock", { clock: dtStr });
  }, 1000);
});

// * Running app
server.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
