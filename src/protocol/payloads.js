/**
 * Frontend ↔ Backend payload contracts
 * This file contains ONLY shapes / documentation objects.
 */

exports.C2S_JOIN = {
  room: "string",
  name: "string",
};

exports.C2S_START = {
  room: "string",
};

exports.C2S_RESTART = {
  room: "string",
};

/**
 * action:
 *  - "LEFT"
 *  - "RIGHT"
 *  - "DOWN"
 *  - "ROTATE"
 *  - "DROP"
 */
exports.C2S_INPUT = {
  room: "string",
  action: "LEFT | RIGHT | DOWN | ROTATE | DROP",
};

/* =======================
   SERVER → CLIENT
   ======================= */

exports.S2C_LOBBY = {
  room: "string",
  started: "boolean",
  players: [{ name: "string", isHost: "boolean" }],
};

exports.S2C_STATE = {
  room: "string",
  started: "boolean",

  // Notes:
  // - When a player clears 2/3/4 lines, server sends garbage to opponents.
  // - Garbage is applied server-side by modifying board / boardWithPiece.
  // - Clients will see the result in the next STATE message.

  players: [
    {
      id: "string",
      name: "string",
      isHost: "boolean",
      alive: "boolean",

      lines: "number",
      lastClear: "number",

      board: "number[20][10]",
      activePiece: "Array<{x:number,y:number}> | null",
      boardWithPiece: "number[20][10]",
    },
  ],
};

exports.S2C_GAME_STARTED = { room: "string" };
exports.S2C_GAME_RESTARTED = { room: "string" };

exports.S2C_GAME_OVER = {
  room: "string",
  winner: "string | null",
};

exports.S2C_ERROR = { message: "string" };
