# Red Tetris 🎮🔴

A real-time multiplayer Tetris game built with **Full Stack JavaScript**, featuring competitive gameplay, penalty systems, and real-time synchronization.

![Red Tetris Banner](https://img.shields.io/badge/Red-Tetris-red) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.0-black)

## 🌟 Features

### 🎮 **Gameplay**
- **Real-time multiplayer** - Battle against friends in the same room
- **Classic Tetris mechanics** - 10×20 board, 7 Tetromino shapes, rotation
- **Penalty system** - Clear lines to send indestructible lines to opponents
- **Solo mode** - Practice alone or play against yourself
- **Spectrum view** - See opponents' board heights without full visibility

### 🛠️ **Technical Stack**
- **Frontend**: React + TypeScript + Tailwind CSS (Functional Programming)
- **Backend**: Node.js + Express + Socket.io (Prototype-based OOP)
- **Real-time**: Socket.io for bidirectional communication
- **Testing**: 70%+ coverage with Jest

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/red-tetris.git
cd red-tetris
2. Install Dependencies
bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../client
npm install
3. Start the Application
bash
# Terminal 1: Start backend server
cd server
npm start
# Server runs on http://localhost:3000

# Terminal 2: Start frontend development server
cd client
npm run dev
# Frontend runs on http://localhost:5173
4. Open in Browser
Navigate to http://localhost:5173 and start playing!
```

## 🎯 How to Play

### Join a Game
- **Create Room:** Enter a room name and your player name
- **Join Room:** Share the room name with friends to join
- **Start Game:** The first player becomes host and can start the game

### Controls
| Key     | Action                             |
|---------|------------------------------------|
| ← →     | Move piece left / right             |
| ↑       | Rotate piece                        |
| ↓       | Soft drop (accelerated fall)        |
| Space   | Hard drop (instant placement)       |

### Game Rules
- **Board:** 10 columns × 20 rows
- **Pieces:** 7 classic Tetrominos with original rotation
- **Penalties:** Clear `n` lines → opponents receive `(n - 1)` indestructible lines
- **Winning:** Last player standing wins (no scoring system)

## 📁 Project Structure

```text
red-tetris/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Socket service and utilities
│   │   ├── lib/             # Utilities and constants
│   │   └── types/           # TypeScript definitions
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── vite.config.ts       # Vite configuration
│
├── server/                  # Backend Node.js server
│   ├── src/
│   │   ├── game/            # Game logic (prototype-based)
│   │   ├── socket/          # Socket.io handlers
│   │   └── utils/           # Server utilities
│   └── package.json
│
├── public/                  # Static assets
├── tests/                   # Test files
├── .env.example             # Environment variables template
├── .gitignore
└── README.md
```

## 🔧 Development

### Backend Development

``` bash
cd server
npm run dev      # Development mode with hot reload
npm test        # Run tests
npm run test:coverage # Test with coverage report
Frontend Development
bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm test        # Run tests
npm run lint    # Lint code
```

### Testing Requirements
Statement coverage: ≥70%

Function coverage: ≥70%

Line coverage: ≥70%

Branch coverage: ≥50%

### 🚫 Technical Constraints

#### Mandatory Requirements
✅ Frontend: Functional programming (no this keyword)

✅ Backend: Prototype-based OOP (no ES6 classes)

✅ Communication: Socket.io only (no REST API)

✅ Rendering: CSS Grid/Flexbox only (no Canvas/SVG/HTML Tables)

✅ Architecture: Client-server model with real-time updates

#### Forbidden Technologies
❌ Canvas or SVG elements

❌ jQuery or DOM manipulation libraries

❌ HTML <table>

#### for layout

❌ Authentication systems (simple room-based access)

❌ Database persistence (in-memory games only)

### 🎨 Design
Color Palette
Primary: #09122C (Dark Blue)

Secondary: #872341 (Deep Red)

Accent: #BE3144 (Bright Red)

Highlight: #E17564 (Salmon)

### UI Components
Game Board: 10×20 CSS Grid with colored blocks

Spectrum View: Column height visualization for opponents

Player Panel: Real-time player status and statistics

Control Guide: On-screen keyboard mapping

### 🔌 Socket.io Events
Client → Server
javascript
// Join a room
socket.emit('JOIN', { room: 'room1', name: 'Player1' });

// Start game (host only)
socket.emit('START', { room: 'room1' });

// Send input
socket.emit('INPUT', { room: 'room1', action: 'LEFT' });
Server → Client
javascript
// Room updates
socket.on('LOBBY', (data) => { /* players, host status */ });

// Game state (every 500ms)
socket.on('STATE', (data) => { /* board, pieces, scores */ });

// Game events
socket.on('GAME_STARTED', () => { /* game begins */ });
socket.on('GAME_OVER', (data) => { /* winner announced */ });
### 🐳 Docker Support
bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
docker build -t red-tetris-server ./server
docker build -t red-tetris-client ./client
📊 Performance
Real-time updates: 500ms game ticks

Input throttling: 50ms minimum between inputs

Spectrum updates: Real-time column height calculations

Multi-room support: Concurrent games with separate states

## 🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

Development Guidelines
Follow functional programming patterns in frontend

Use prototype inheritance in backend

Write tests for new features

Maintain 70%+ test coverage

Update documentation accordingly

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
Redpelicans - Project sponsor

Original Tetris - Game concept by Alexey Pajitnov

JavaScript Community - For amazing tools and libraries

## 📞 Support
For issues, questions, or feedback:

Open a GitHub Issue

Check the Wiki for documentation

Made with ❤️ and JavaScript
