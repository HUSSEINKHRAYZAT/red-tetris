# Lobby Dialog Implementation

## Overview
Replaced the old GameStatus component with a unified **LobbyDialog** that shows player information both in the lobby (pre-game) and post-game states.

## New Components

### 1. PlayerLobbyCard (`/src/components/game/PlayerLobbyCard.tsx`)
**Purpose**: Display individual player information in the lobby

**Features**:
- Player name (title) and Socket ID (subtitle)
- Host badge (red "HOST" badge)
- Win/Loss status badge from previous round:
  - 🟢 Green "WINNER" badge if player won
  - 🔴 Red "LOST" badge if player lost
- "YOU" badge for current player (primary color)
- Card styling matches TeamSection theme (border-l-4, bg-[#0f0f0f])
- Hover effects (shadow, translate)

**Props**:
```typescript
{
  name: string;           // Player name
  socketId: string;       // Player socket ID
  isHost: boolean;        // Whether player is host
  lastRoundResult?: boolean | null;  // true = won, false = lost, null = no result
  isMe?: boolean;         // Whether this is current player
}
```

### 2. LobbyDialog (`/src/components/game/LobbyDialog.tsx`)
**Purpose**: Unified dialog for lobby and post-game states

**Features**:
- Shows all players in room as PlayerLobbyCard components
- Dynamic title: "Game Lobby" (pre-game) or "Round Complete" (post-game)
- Player count subtitle
- Real-time updates when players join/leave
- Host actions:
  - "Start Game" button (in lobby)
  - "Start New Round" button (post-game)
- Guest waiting state with animated dots
- Fade-in and scale-up animation on mount
- Scrollable player list (max-height: 400px)
- Matches main UI theme (bg-[#0a0a0a], border-primary/30)

**Props**:
```typescript
{
  players: Player[];      // List of players with win/loss status
  mySocketId: string | null;
  isHost: boolean;
  isPostGame?: boolean;   // Whether showing post-game results
  onStart?: () => void;   // Callback for host to start/restart
}
```

## GamePage Changes

### State Updates
```typescript
// NEW: Track lobby players with win/loss status
const [lobbyPlayers, setLobbyPlayers] = useState<Array<{
  id: string;
  name: string;
  isHost: boolean;
  lastRoundResult?: boolean | null;
}>>([]);

// REMOVED: No longer need separate winner/winnerName state
```

### Event Handler Updates

**LOBBY Event**:
- Now populates `lobbyPlayers` array from `data.players`
- Preserves `lastRoundResult` when players are updated
- Real-time updates when players join/leave

**GAME_STARTED Event**:
- Clears `lastRoundResult` for all players (new round starts)

**GAME_OVER Event**:
- Updates `lastRoundResult` for all players:
  - Winner gets `true`
  - Losers get `false`
  - If no winner, all get `null`

**GAME_RESTARTED Event**:
- Keeps `lastRoundResult` so it shows in lobby after restart
- Results remain visible until new game starts

### JSX Changes
```tsx
// OLD: GameStatus component
<GameStatus
  started={started}
  gameOver={gameOver}
  winner={winner}
  mySocketId={socketId}
  winnerName={winnerName}
  isHost={isHost}
  onStart={handleStart}
  onRestart={handleRestart}
/>

// NEW: LobbyDialog component
<LobbyDialog
  players={lobbyPlayers}
  mySocketId={socketId}
  isHost={isHost}
  isPostGame={gameOver}
  onStart={gameOver ? handleRestart : handleStart}
/>
```

## UX Flow

### Pre-Game (Lobby)
1. Player joins room → LOBBY event → updates `lobbyPlayers`
2. LobbyDialog shows all players with:
   - Name and Socket ID
   - Host badge
   - No win/loss badges (first game)
3. Host sees "Start Game" button
4. Guests see "Waiting for host to start..." with animated dots

### During Game
- LobbyDialog is hidden (`started === true && !gameOver`)
- Players can see game board and play

### Post-Game
1. Game ends → GAME_OVER event → marks winners/losers in `lobbyPlayers`
2. LobbyDialog reappears with:
   - Title: "Round Complete"
   - All players showing their result badges (WINNER/LOST)
   - Host sees "Start New Round" button
   - Guests see "Waiting for host to start..."
3. Host clicks "Start New Round" → RESTART event → returns to lobby
4. Lobby shows with results still visible
5. Host clicks "Start Game" → GAME_STARTED → clears results, new round begins

## Styling

### Theme Consistency
- Dialog background: `bg-[#0a0a0a]` (matches main theme)
- Border: `border-primary/30` (red accent with opacity)
- Cards: `bg-[#0f0f0f]` with `border-l-4` (TeamSection style)
- Shadows: `shadow-2xl` with glow effects
- Animations: Fade-in, scale-up, pulse for waiting dots

### Badges
- Host: Red background (`bg-primary`), black text
- Winner: Green background (`bg-green-500`), black text
- Lost: Red background (`bg-red-500`), black text
- You: Primary border with "YOU" badge

### Responsive
- Max width: `max-w-2xl`
- Scrollable player list for many players
- Mobile-friendly margins (`mx-4`)

## CSS Additions

### Tailwind Config
```javascript
animation: {
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
}
```

### Index CSS
```css
@layer utilities {
  .delay-75 { animation-delay: 75ms; }
  .delay-150 { animation-delay: 150ms; }
}
```

## Benefits

### Before
- ❌ Only showed "You Win/Lose" messages
- ❌ No player list visibility
- ❌ Unclear who was in the room
- ❌ No result tracking across rounds

### After
- ✅ Clear player list with names and IDs
- ✅ Visual host identification
- ✅ Win/loss badges after each round
- ✅ Real-time updates when players join/leave
- ✅ Consistent UI for lobby and post-game
- ✅ Better UX with animations and clear states
- ✅ Matches main theme perfectly

## Testing Checklist

- [ ] Solo play: Create room, see yourself as host in lobby
- [ ] Multiplayer: Join room, see all players listed
- [ ] Host badge appears on host player
- [ ] "YOU" badge appears on your card
- [ ] Host can start game, guests see waiting message
- [ ] After game over, winner gets green badge, losers get red badge
- [ ] After restart, results still show in lobby
- [ ] After new game starts, badges clear
- [ ] Players joining mid-lobby appear in real-time
- [ ] Scrolling works with many players (10+)
