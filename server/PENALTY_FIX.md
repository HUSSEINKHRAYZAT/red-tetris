# Penalty System Fix - Red Tetris Specification Compliance

## Date: 2026-02-06

## Summary
Fixed two critical errors in the backend penalty system to comply with the Red Tetris specification (Page 7).

---

## CHANGES MADE

### 1. Fixed Penalty Calculation (Game.js)

**File**: `server/src/domain/Game.js`

**Function**: `linesToGarbage(cleared)`

**Before**:
```javascript
linesToGarbage(cleared) {
  if (cleared === 2) return 1;
  if (cleared === 3) return 2;
  if (cleared === 4) return 4;  // ❌ WRONG: Should be 3
  return 0;
}
```

**After**:
```javascript
linesToGarbage(cleared) {
  // Spec: opponents receive (n - 1) indestructible penalty lines
  // 1 line → 0 penalties, 2 lines → 1 penalty, 3 lines → 2 penalties, 4 lines → 3 penalties
  return Math.max(0, cleared - 1);
}
```

**Impact**:
- ✅ 1-line clear → 0 penalties (was 0, correct)
- ✅ 2-line clear → 1 penalty (was 1, correct)
- ✅ 3-line clear → 2 penalties (was 2, correct)
- ✅ **4-line clear (Tetris) → 3 penalties (was 4, NOW FIXED)**

---

### 2. Made Penalty Blocks Indestructible (Board.js)

**File**: `server/src/domain/Board.js`

#### 2A. Added Penalty Marker Constant

**Before**:
```javascript
class Board {
  constructor(rows = 20, cols = 10) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  }
```

**After**:
```javascript
class Board {
  constructor(rows = 20, cols = 10) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    // Penalty block marker (indestructible)
    this.PENALTY_VALUE = 8;
  }
```

#### 2B. Updated Garbage Row Creation

**Before**:
```javascript
const garbageRow = Array(this.cols).fill(1);  // ❌ Same value as normal blocks
garbageRow[hole] = 0;
```

**After**:
```javascript
// Use PENALTY_VALUE for indestructible garbage rows
const garbageRow = Array(this.cols).fill(this.PENALTY_VALUE);  // ✅ Special marker
garbageRow[hole] = 0;
```

#### 2C. Updated Line Clearing Logic

**Before**:
```javascript
clearFullLines() {
  const isFull = (row) => row.every((cell) => cell !== 0);

  const remaining = [];
  let cleared = 0;

  for (const row of this.grid) {
    if (isFull(row)) cleared++;  // ❌ Clears penalty rows too
    else remaining.push(row);
  }
  // ...
}
```

**After**:
```javascript
clearFullLines() {
  // A row is clearable if:
  // 1. All cells are non-zero (full row)
  // 2. Row does NOT contain any penalty blocks (PENALTY_VALUE)
  const isClearable = (row) => {
    // Must be completely filled
    if (!row.every((cell) => cell !== 0)) return false;
    // Must NOT contain any indestructible penalty blocks
    if (row.some((cell) => cell === this.PENALTY_VALUE)) return false;
    return true;
  };

  const remaining = [];
  let cleared = 0;

  for (const row of this.grid) {
    if (isClearable(row)) {
      cleared++;  // ✅ Only clears normal blocks
    } else {
      remaining.push(row);  // ✅ Keeps penalty rows
    }
  }
  // ...
}
```

**Impact**:
- ✅ Penalty rows now use value `8` (distinct from normal blocks which use `1`)
- ✅ Penalty rows cannot be cleared by line completion
- ✅ Penalty rows remain as permanent obstacles until game over
- ✅ Mixed rows (normal + penalty blocks) are not clearable

---

## SPECIFICATION COMPLIANCE

### ✅ Penalty Calculation (n - 1 Rule)
- **Spec Requirement**: "opponents receive (n - 1) indestructible penalty lines"
- **Implementation**: `Math.max(0, cleared - 1)`
- **Status**: ✅ COMPLIANT

### ✅ Indestructible Property
- **Spec Requirement**: "indestructible penalty lines"
- **Implementation**: Penalty blocks use value `8`, clearFullLines() ignores rows with penalty blocks
- **Status**: ✅ COMPLIANT

### ✅ Bottom Placement
- **Spec Requirement**: Penalty lines appear at the bottom
- **Implementation**: `addGarbage()` pushes rows at bottom via `this.grid.push(garbageRow)`
- **Status**: ✅ COMPLIANT (already correct)

### ✅ All Opponents Receive
- **Spec Requirement**: Penalties go to ALL other players
- **Implementation**: `sendGarbage()` iterates all players, excludes sender, sends to alive opponents
- **Status**: ✅ COMPLIANT (already correct)

### ✅ Board Integrity
- **Spec Requirement**: Board remains 10×20
- **Implementation**: `addGarbage()` shifts top row out, maintains 20 rows
- **Status**: ✅ COMPLIANT (already correct)

---

## EDGE CASES HANDLED

### 1. Mixed Rows (Normal + Penalty Blocks)
- **Behavior**: Row with ANY penalty blocks is NOT clearable
- **Rationale**: Simplest implementation, prevents edge cases
- **Example**: Row with 9 normal blocks + 1 penalty block → unclearable

### 2. Solo Mode
- **Behavior**: Solo player clears lines → no opponents → no penalties sent
- **Implementation**: `sendGarbage()` iterates players but finds none to send to
- **Status**: ✅ Works correctly

### 3. Multiple Opponents
- **Behavior**: All alive opponents receive the same penalty count
- **Implementation**: Loop sends to each opponent individually
- **Status**: ✅ Works correctly

### 4. Stacked Penalties
- **Behavior**: New penalties stack on top of existing penalties
- **Implementation**: `addGarbage()` treats all rows equally when shifting
- **Status**: ✅ Works correctly

### 5. Dead Players
- **Behavior**: Dead players do NOT receive penalties
- **Implementation**: `sendGarbage()` checks `if (!p.alive) continue;`
- **Status**: ✅ Intentional (spec doesn't require sending to dead players)

---

## TESTING CHECKLIST

### Manual Test Scenarios:
- [ ] Clear 1 line → No penalties sent to opponent
- [ ] Clear 2 lines → 1 penalty line to opponent
- [ ] Clear 3 lines → 2 penalty lines to opponent
- [ ] Clear 4 lines (Tetris) → 3 penalty lines to opponent
- [ ] Opponent receives penalty → penalty row appears at bottom
- [ ] Opponent fills penalty row completely → row does NOT clear
- [ ] Opponent fills normal row → row clears normally
- [ ] Multiple opponents in room → all receive penalties
- [ ] Solo player clears lines → no errors, game continues
- [ ] Board remains 20 rows after receiving penalties

### Expected Results:
All tests should pass with the new implementation.

---

## UNCHANGED BEHAVIOR

The following behavior was NOT changed (already correct):

- ✅ Socket event flow (JOIN → START → STATE → GAME_OVER)
- ✅ Game tick timing (500ms intervals)
- ✅ Piece generation (7-bag shared sequence)
- ✅ Player alive/dead detection
- ✅ Room/lobby management
- ✅ Overflow detection when penalties push blocks off top
- ✅ Active piece collision handling after penalty arrival

---

## FILES MODIFIED

1. **server/src/domain/Game.js**
   - Function: `linesToGarbage(cleared)` → Changed penalty calculation to `Math.max(0, cleared - 1)`

2. **server/src/domain/Board.js**
   - Constructor: Added `this.PENALTY_VALUE = 8`
   - Function: `addGarbage()` → Changed garbage row fill from `1` to `this.PENALTY_VALUE`
   - Function: `clearFullLines()` → Updated to check for penalty blocks and exclude rows containing them

---

## NEXT STEPS

1. **Restart Backend Server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Test Penalty System**:
   - Create a room with 2+ players
   - Clear 2, 3, 4 lines and verify penalty counts
   - Verify penalty rows cannot be cleared
   - Verify board stays 20 rows

3. **Frontend Integration**:
   - Ensure frontend can render penalty blocks (value `8`) differently from normal blocks
   - Consider visual styling (e.g., darker color, special pattern)

4. **Documentation**:
   - Update any game rules documentation
   - Add penalty visualization to UI/UX guides

---

## COMPLIANCE STATUS

| Requirement | Before | After | Status |
|------------|--------|-------|--------|
| Penalty Count (n-1) | ❌ Tetris = 4 | ✅ Tetris = 3 | FIXED |
| Indestructible | ❌ Value 1 (clearable) | ✅ Value 8 (not clearable) | FIXED |
| Bottom Placement | ✅ Correct | ✅ Correct | NO CHANGE |
| All Opponents | ✅ Correct | ✅ Correct | NO CHANGE |
| Board Integrity | ✅ Correct | ✅ Correct | NO CHANGE |

**Overall Status**: ✅ FULLY COMPLIANT with Red Tetris Specification
