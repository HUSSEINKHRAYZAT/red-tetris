# Red Tetris - Game Components Documentation

**Last Updated:** February 4, 2026
**Version:** 1.0
**Status:** Complete Game Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Structure](#component-structure)
4. [Socket Communication](#socket-communication)
5. [Game Flow](#game-flow)
6. [Privacy Enforcement](#privacy-enforcement)
7. [Component API Reference](#component-api-reference)
8. [Usage Examples](#usage-examples)

---

## 🎮 Overview

Red Tetris is a real-time multiplayer Tetris game built with React, TypeScript, and Socket.IO. The game follows **strict architectural requirements** from the spec:

- **NO Canvas, NO SVG, NO HTML Tables** — All rendering via CSS Grid/Flexbox
- **Socket-only communication** — No REST API calls
- **Spectrum-based opponent visualization** — Privacy enforcement (column heights only)
- **Host/guest flow** — Only host can start/restart games
- **Real-time updates** — 500ms game tick, 50ms input throttle

---

## 🏗️ Architecture

### Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (custom red-dark theme)
- **Communication:** Socket.IO client
- **Routing:** React Router v6
- **State:** React hooks (no external state library)

### Key Architectural Decisions

1. **CSS-Only Rendering**
   - Tetris board: 10×20 CSS Grid
   - Each cell: `<div>` with Tailwind classes
   - Active piece: Rendered in `boardWithPiece` array from backend

2. **Spectrum Privacy Enforcement**
   - Backend broadcasts full boards for all players
   - Frontend converts opponent boards → spectrum (10 column heights)
   - UI components NEVER receive opponent board data

3. **Socket-Only Flow**
   - No REST endpoints
   - All state updates via `STATE` event (500ms)
   - Input events throttled (50ms frontend + backend)

---

## 🧩 Component Structure

```
src/components/game/
├── NavBar.tsx              # Top navigation (room ID, connection status)
├── PlayerCard.tsx          # Current player info (name, stats, host badge)
├── GameControls.tsx        # Control keys + throttle indicator
├── TetrisBoard.tsx         # 10×20 CSS Grid board (your board only)
├── OpponentsPanel.tsx      # Opponent list + spectrum visualization
├── HostControls.tsx        # Start/Restart buttons (host only)
└── GameStatus.tsx          # Lobby/Playing/Game Over overlays

src/lib/pages/
└── GamePage.tsx            # Main game page (integrates all components)

src/lib/utils/
├── spectrum.ts             # Board → spectrum conversion + sanitization
├── storage.ts              # LocalStorage utilities (room/name)
├── types.ts                # TypeScript interfaces (socket payloads)
└── validation.ts           # Input validation (name/room rules)

src/lib/socket/
├── events.ts               # Socket event constants (C2S + S2C)
└── services/
    └── socketService.ts    # Socket connection manager
```

---

## 📡 Socket Communication

### Event Flow Diagram

```
Client                          Server
  │                               │
  ├─── CONNECT ──────────────────>│
  │<──────────────── socket.id ───┤
  │                               │
  ├─── JOIN {room, name} ────────>│
  │<──────────────── LOBBY ───────┤
  │                               │
  │  (Host only)                  │
  ├─── START {room} ─────────────>│
  │<──────────── GAME_STARTED ────┤
  │<──────────────── STATE ───────┤ (every 500ms)
  │                               │
  ├─── INPUT {room, action} ─────>│
  │<──────────────── STATE ───────┤
  │                               │
  │<──────────── GAME_OVER ───────┤
  │                               │
  │  (Host only)                  │
  ├─── RESTART {room} ───────────>│
  │<──────────── GAME_RESTARTED ──┤
  │<──────────────── LOBBY ───────┤
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `JOIN` | `{room: string, name: string}` | Join a room with player name |
| `START` | `{room: string}` | Start game (host only) |
| `RESTART` | `{room: string}` | Restart game (host only) |
| `INPUT` | `{room: string, action: InputAction}` | Send player input |

**Input Actions:** `LEFT`, `RIGHT`, `DOWN`, `ROTATE`, `DROP`

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `LOBBY` | `{room, started, players[]}` | Lobby state update |
| `GAME_STARTED` | `{room}` | Game started notification |
| `STATE` | `{room, started, players[]}` | Full game state (500ms tick) |
| `GAME_OVER` | `{room, winner}` | Game over notification |
| `GAME_RESTARTED` | `{room}` | Game restarted notification |
| `ERROR` | `{message}` | Error message |

---

## 🔄 Game Flow

### 1. Lobby Phase

**States:**
- Host sees "Start Game" button
- Guests see "Waiting for host..."
- Players can join/leave freely

**Transitions:**
- Host clicks Start → `START` event → `GAME_STARTED`

### 2. Playing Phase

**States:**
- Game board active, input enabled
- `STATE` events every 500ms
- Opponents shown as spectrum bars

**Mechanics:**
- Same piece sequence for all players
- Clearing lines sends penalties to opponents
- Penalty lines are indestructible (full width)

**Transitions:**
- ≤1 player alive → `GAME_OVER`

### 3. Game Over Phase

**States:**
- Winner announcement
- Host sees "Restart Game" button
- Guests see "Waiting for host..."

**Transitions:**
- Host clicks Restart → `RESTART` → `GAME_RESTARTED` → Lobby

---

## 🔒 Privacy Enforcement

### The Problem

Backend broadcasts **full boards** for all players in `STATE` events:

```typescript
{
  players: [
    {
      id: "socket123",
      board: [[0,0,1,...], ...],  // ❌ FULL BOARD DATA
      boardWithPiece: [[...]]     // ❌ REVEALS OPPONENT STRATEGY
    }
  ]
}
```

### The Solution

**`spectrum.ts` utilities** sanitize state before rendering:

```typescript
// 1. Convert board → spectrum (10 column heights)
const spectrum = calculateSpectrum(board);
// [5, 3, 0, 2, 4, 1, 0, 0, 3, 2] — heights from bottom

// 2. Sanitize game state
const cleanState = sanitizeGameState(rawState, mySocketId);
// {
//   myPlayer: { ...fullBoardData },  // ✅ Current player keeps board
//   opponents: [
//     {
//       name: "Player2",
//       spectrum: [5, 3, ...],        // ✅ Spectrum only
//       // NO board property!
//     }
//   ]
// }
```

**CRITICAL:** UI components NEVER see opponent board data.

---

## 📖 Component API Reference

### `<TetrisBoard>`

**Purpose:** Render 10×20 Tetris board using CSS Grid (NO canvas/SVG/tables)

**Props:**
```typescript
{
  board: number[][] | null;  // 20×10 array (0=empty, 1=locked, 2=falling)
  isActive?: boolean;        // Visual emphasis when true
  className?: string;
}
```

**Rendering Rules:**
- Cell value `0` → `bg-gray-900` (empty)
- Cell value `1` → `bg-red-500` + glow (locked block)
- Cell value `2` → `bg-red-400` + glow (falling piece)

**Example:**
```tsx
<TetrisBoard
  board={gameState.myPlayer.boardWithPiece}
  isActive={true}
/>
```

---

### `<OpponentsPanel>`

**Purpose:** Display opponents with **spectrum visualization ONLY**

**Props:**
```typescript
{
  opponents: OpponentData[];  // Sanitized data (NO boards)
  className?: string;
}

type OpponentData = {
  id: string;
  name: string;
  alive: boolean;
  lines: number;
  spectrum: number[];  // [h0, h1, ..., h9] column heights
}
```

**Visualization:**
- 10 vertical bars (one per column)
- Height: `(columnHeight / 20) * 100%`
- Color: Green (0-5), Yellow (6-10), Orange (11-15), Red (16-20)

**Example:**
```tsx
<OpponentsPanel opponents={gameState.opponents} />
```

---

### `<HostControls>`

**Purpose:** Start/Restart buttons (visible ONLY to host)

**Props:**
```typescript
{
  isHost: boolean;       // From backend (player.isHost)
  started: boolean;      // Whether game has started
  gameOver: boolean;     // Whether game is over
  onStart: () => void;   // Emit START event
  onRestart: () => void; // Emit RESTART event
}
```

**Visibility Rules:**
- Returns `null` if `!isHost`
- Shows "Start Game" if `!started`
- Shows "Restart Game" if `started && gameOver`

**Example:**
```tsx
<HostControls
  isHost={gameState.myPlayer.isHost}
  started={gameState.started}
  gameOver={gameOver}
  onStart={() => socket.emit('START', {room})}
  onRestart={() => socket.emit('RESTART', {room})}
/>
```

---

### `<GameStatus>`

**Purpose:** Overlay for lobby/game over states

**Props:**
```typescript
{
  started: boolean;
  gameOver: boolean;
  winner: string | null;  // Winner's socket ID
  mySocketId: string | null;
  winnerName?: string;
  isHost: boolean;
}
```

**Display Logic:**
- Lobby: "Waiting for host..." (guests) or "Press Start Game" (host)
- Game Over: "Victory!" (winner) or "Defeated!" (loser)
- Hides when `started && !gameOver`

---

## 💻 Usage Examples

### Example 1: Sanitize State Before Rendering

```typescript
// ❌ WRONG: Pass raw state to UI
socket.on('STATE', (rawState) => {
  setGameState(rawState);  // Opponents have full boards!
});

// ✅ CORRECT: Sanitize first
socket.on('STATE', (rawState) => {
  const cleanState = sanitizeGameState(rawState, socket.id);
  setGameState(cleanState);  // Opponents have spectrum only
});
```

### Example 2: Handle Keyboard Input with Throttle

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const action = KEY_MAPPINGS[e.key];  // ArrowLeft → "LEFT"

    if (!action) return;

    // Frontend throttle (50ms)
    const now = Date.now();
    if (now - lastInputTime < 50) return;

    socket.emit('INPUT', { room, action });
    setLastInputTime(now);
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [socket, room, lastInputTime]);
```

### Example 3: Host-Only Button

```typescript
// Only render for host
{isHost && (
  <button onClick={() => socket.emit('START', {room})}>
    Start Game
  </button>
)}
```

---

## 🚀 Running the Game

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3000`

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Navigate to http://localhost:5173
```

### Game Flow

1. **Main Page** (`/`)
   - Click "Play" button
   - Enter name + room ID
   - Click "Join / Create"

2. **Game Page** (`/game`)
   - Auto-joins room on load
   - Host sees "Start Game"
   - Guests see "Waiting for host..."

3. **Controls** (during game)
   - `←` / `→` — Move left/right
   - `↑` — Rotate
   - `↓` — Soft drop
   - `Space` — Hard drop

---

## 🐛 Debugging Tips

### Check Connection

```typescript
console.log('Connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

### Inspect Game State

```typescript
socket.on('STATE', (data) => {
  console.log('STATE:', {
    room: data.room,
    started: data.started,
    playerCount: data.players.length,
    myPlayer: data.players.find(p => p.id === socket.id)
  });
});
```

### Verify Spectrum Conversion

```typescript
const spectrum = calculateSpectrum(board);
console.log('Spectrum:', spectrum);  // [h0, h1, ..., h9]
```

---

## 📝 Notes

- **No Pause:** Game runs continuously (no pause feature)
- **No Leave Button:** Leaving = closing tab = automatic loss
- **Host Transfer:** Automatic when host disconnects
- **Piece Sequence:** Identical for all players (server-controlled)
- **Penalty Lines:** Full width (10 columns), cannot be cleared

---

## 🔗 Related Documentation

- [Socket Events Reference](./SOCKET_TESTING.md)
- [Pages Overview](./PAGES.md)
- [Backend API](../../server/README.md)

---

**End of Documentation**
