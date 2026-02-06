const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socketHandlers");
const { GameRegistry } = require("./registry");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.BIND_HOST || '0.0.0.0';
const server = http.createServer(app);
// Allow permissive CORS for socket.io during development (allow all origins).
// In production you should restrict this to your frontend origin(s).
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.use(express.static("public"));

const registry = new GameRegistry();
registerSocketHandlers(io, registry);

server.listen(PORT, HOST, () => {
  console.log(`Server running and listening on http://${HOST}:${PORT}`);
});
