const express = require("express");
const http = require("http");
const path = require("path");
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

// URL-based game join route: /:room/:player
// Serves index.html and lets the client parse URL params
app.get('/:room/:player', (req, res) => {
  const indexPath = path.join(__dirname, '../../public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If index.html doesn't exist (dev mode), send a simple message
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Red Tetris</title></head>
          <body>
            <p>Game join URL detected: Room "${req.params.room}", Player "${req.params.player}"</p>
            <p>In development, please use the Vite dev server at http://localhost:5173/${req.params.room}/${req.params.player}</p>
          </body>
        </html>
      `);
    }
  });
});

const registry = new GameRegistry();
registerSocketHandlers(io, registry);

server.listen(PORT, HOST, () => {
  console.log(`Server running and listening on http://${HOST}:${PORT}`);
});
