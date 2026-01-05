const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socketHandlers");
const { GameRegistry } = require("./registry");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

const registry = new GameRegistry();
registerSocketHandlers(io, registry);

server.listen(3000, () => console.log("Server running on port 3000"));
