# Socket Integration Testing Guide

## Overview
This document explains the socket connection implementation and how to test it.

## Servers Running
- **Backend Server**: http://localhost:3000 (Socket.IO server)
- **Frontend Server**: http://localhost:5174 (Vite dev server)

## Implementation Summary

### 1. Socket Connection on Play Solo
When you click "Play Solo":
1. Validates player name (must be 3-20 chars with at least 1 letter and 1 number)
2. Connects to the backend server
3. Logs connection success to console with Socket ID
4. Stores player name in localStorage
5. Ready for solo game (navigation to game page not yet implemented)

**Console Logs to Expect:**
```
✅ [ActionSection] Socket connected! ID: <socket-id>
✅ [Solo] Connected to server as: <player-name>
✅ [Solo] Socket ID: <socket-id>
🎮 [Solo] Starting singleplayer mode...
```

### 2. Socket Connection on Join/Create Room
When you enter a room ID and click "Join / Create":
1. Validates player name (same rules as solo)
2. Validates room ID (3-20 chars, uppercase A-Z and 0-9 only)
3. Auto-uppercases room input
4. Connects to the backend server
5. Sends JOIN event to server with room and player name
6. Server responds with LOBBY event containing room state
7. Logs all details to console

**Console Logs to Expect:**
```
✅ [ActionSection] Socket connected! ID: <socket-id>
✅ [Multiplayer] Connected to server as: <player-name>
✅ [Multiplayer] Socket ID: <socket-id>
🎮 [Multiplayer] Joining room: <room-id>
👤 [Multiplayer] Player name: <player-name>
⏳ [Multiplayer] Waiting for lobby update...
🎮 [ActionSection] Lobby update received: {
  room: "<room-id>",
  started: false,
  players: [
    { name: "<player-name>", isHost: true }
  ],
  playerCount: 1
}
```

### 3. Event Listeners Active
The following socket events are being monitored:
- **connect**: Fires when socket connects to server
- **disconnect**: Fires when socket disconnects
- **LOBBY**: Server sends room state (player list, host status, game started status)
- **ERROR**: Server sends error messages

## Testing Instructions

### Test 1: Solo Connection
1. Open http://localhost:5174 in your browser
2. Open browser console (F12 → Console tab)
3. Scroll to "Ready to Drop?" section
4. Click "Play" button
5. Enter a valid name (e.g., "Player1")
6. Click "Play Solo"
7. Check console for connection logs

### Test 2: Multiplayer Room Creation
1. Open http://localhost:5174
2. Open browser console
3. Click "Play" button
4. Enter a valid name (e.g., "Alice1")
5. Enter or generate a room ID (e.g., "ROOM01")
6. Click "Join / Create"
7. Check console for:
   - Connection success
   - JOIN event sent
   - LOBBY event received with room state

### Test 3: Multiple Players in Same Room
1. Open http://localhost:5174 in **two different browser tabs**
2. Open console in both tabs
3. **Tab 1**:
   - Enter name "Alice1"
   - Generate room ID (e.g., "ABC123")
   - Click "Join / Create"
   - Check console - should show Alice1 as host
4. **Tab 2**:
   - Enter name "Bob2"
   - Enter same room ID "ABC123"
   - Click "Join / Create"
   - Check console in BOTH tabs - should show 2 players

**Expected in both tabs:**
```
🎮 [ActionSection] Lobby update received: {
  room: "ABC123",
  started: false,
  players: [
    { name: "Alice1", isHost: true },
    { name: "Bob2", isHost: false }
  ],
  playerCount: 2
}
```

## Validation Rules

### Player Name
- 3-20 characters
- Must include at least one letter (A-Z, a-z)
- Must include at least one number (0-9)
- Valid examples: `Player1`, `Alice99`, `Bob2024`
- Invalid examples: `Al` (too short), `PlayerName` (no number), `12345` (no letter)

### Room ID
- 3-20 characters
- Only uppercase letters (A-Z) and numbers (0-9)
- Auto-uppercased on input
- Auto-strips invalid characters
- Valid examples: `ROOM1`, `ABC123`, `GAME001`
- Invalid examples: `ab` (too short), `room-1` (lowercase/special chars)

## UI Features

### Input Validation
- Red border on invalid inputs
- Error messages displayed below inputs
- Errors clear when user starts typing
- Generate button creates random valid room IDs

### Connection State
- Buttons disabled while connecting
- "Connecting..." text shown during connection
- Dialog stays open on validation errors
- Dialog closes with animation on success

## Next Steps (Not Yet Implemented)
- [ ] Navigate to game page after successful connection
- [ ] Display lobby UI with player list
- [ ] Implement game start functionality
- [ ] Add game over handling
- [ ] Create game board rendering
- [ ] Add keyboard controls for piece movement

## Files Modified
- `client/src/components/ActionSection.tsx` - Added socket connection logic
- `client/src/lib/static.ts` - Added validation rule messages
- `client/src/lib/utils/validation.ts` - Created validation helpers
- `client/src/lib/utils/storage.ts` - Moved storage from socket folder

## Backend Events Reference
See `server/src/protocol/events.js` and `server/src/protocol/payloads.js` for complete event contracts.
