// Static Text and Links for Red Tetris Application

// GitHub Profile Links
export const GITHUB_PROFILES = {
  BACKEND: 'https://github.com/HUSSEINKHRAYZAT/',
  FRONTEND: 'https://github.com/Ali-Fayad/',
}

// Main Landing Page Text
export const LANDING_PAGE = {
  TITLE: 'Red Tetris',
  SUBTITLE: 'Battle with falling blocks in real-time multiplayer Tetris. Create a room, challenge friends, and be the last one standing!',
}

// About Section Text
export const ABOUT_SECTION = {
  TITLE: 'About the Project',
  PARAGRAPHS: [
    'Red Tetris is a modern, networked multiplayer Tetris experience built entirely with JavaScript. This project reimagines the classic puzzle game for the web era, transforming solitary block-stacking into a competitive, real-time battle. Unlike traditional Tetris, here you play against others in shared rooms where every line cleared sends indestructible penalties to opponents. Each player receives identical piece sequences, turning victory into a test of skill, strategy, and speed rather than random chance.',
    'Developed as a full-stack JavaScript implementation, Red Tetris showcases cutting-edge web technologies through functional programming, reactive UI design, and real-time communication via WebSockets. It represents both a technical demonstration and a tribute to the timeless appeal of Tetris—now enhanced for multiplayer competition. Whether practicing alone or battling friends, Red Tetris brings people together through shared challenge and classic gameplay, proving that some games only get better when youre not playing alone.',
  ],
}

// Team Section Text
export const TEAM_SECTION = {
  TITLE: 'The Team',
  MEMBERS: [
    {
      name: 'Hussein Khrayzat',
      role: 'Backend Architect',
      github: GITHUB_PROFILES.BACKEND,
      description:
        'I developed the game server using Express.js\nwith pure WebSocket communication—no REST APIs.\nThe server manages game rooms, synchronizes pieces,\nand broadcasts penalties in real-time\nto all connected players.',
    },
    {
      name: 'Ali Fayad',
      role: 'Frontend Engineer',
      github: GITHUB_PROFILES.FRONTEND,
      description:
        'I built the responsive, real-time game interface\nusing React with TypeScript and styled it\nwith a custom red-dark theme in Tailwind CSS.\nThe frontend communicates seamlessly via\nWebSocket to deliver live multiplayer action.',
    },
  ],
  GITHUB_LINK_TEXT: 'GitHub Profile',
}

// Action Section Text
export const ACTION_SECTION = {
  TITLE: 'Ready to Drop?',
  MODES: {
    SINGLE: {
      TITLE: 'Singleplayer',
      DESCRIPTION: 'Practice your stacking skills',
    },
    MULTI: {
      TITLE: 'Multiplayer',
      DESCRIPTION: 'Challenge the world',
    },
  },
  DIALOG: {
    TITLE_SINGLE: 'Enter name for Singleplayer',
    TITLE_MULTI: 'Enter name for Multiplayer',
    DESCRIPTION: 'Please provide the player name to continue.',
    PLACEHOLDER: 'Your name',
    PLACEHOLDER_ROOM: 'Enter room id',
    GENERATE_BUTTON: 'Generate',
    PLAY_SOLO_BUTTON: 'Play Solo',
    JOIN_CREATE_BUTTON: 'Join / Create',
    CANCEL_BUTTON: 'Cancel',
    CONFIRM_BUTTON: 'Confirm',

    // Validation rules displayed on error
    NAME_RULES: 'Name rules: must be 3-20 characters and include at least one letter and one number.',
    ROOM_RULES: 'Room ID rules: 3-20 characters, uppercase letters and numbers only (A-Z, 0-9).',
  },
}

/* ============================================================================
 * GAME CONSTANTS
 * ============================================================================ */

/**
 * Tetromino piece types and their shapes
 * Classic 7 pieces with rotation states
 */
export const TETROMINOS = {
  I: {
    color: 'cyan',
    shapes: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    ],
  },
  O: {
    color: 'yellow',
    shapes: [[[1, 1], [1, 1]]],
  },
  T: {
    color: 'purple',
    shapes: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
    ],
  },
  S: {
    color: 'green',
    shapes: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    ],
  },
  Z: {
    color: 'red',
    shapes: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    ],
  },
  J: {
    color: 'blue',
    shapes: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    ],
  },
  L: {
    color: 'orange',
    shapes: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    ],
  },
} as const;

/**
 * Color mapping for board cells
 * 0 = empty, 1 = locked block, 2 = falling piece
 */
export const PIECE_COLORS: Record<number, string> = {
  0: 'bg-gray-900', // Empty cell
  1: 'bg-red-500 shadow-[inset_0_0_8px_rgba(255,255,255,0.3),0_0_10px_rgba(255,7,58,0.6)]', // Locked block
  2: 'bg-red-400 shadow-[0_0_8px_rgba(255,100,100,0.6)]', // Falling piece
};

/**
 * Keyboard controls mapping
 * STRICT: These are the ONLY allowed key mappings per spec
 */
export const KEY_MAPPINGS: Record<string, string> = {
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  ArrowUp: 'ROTATE',
  ArrowDown: 'DOWN',
  ' ': 'DROP', // Spacebar for hard drop
} as const;

/**
 * Control labels for UI display
 */
export const CONTROL_LABELS = [
  { action: 'Move Left', key: '←' },
  { action: 'Move Right', key: '→' },
  { action: 'Rotate', key: '↑' },
  { action: 'Soft Drop', key: '↓' },
  { action: 'Hard Drop', key: 'Space' },
] as const;

/**
 * Game board dimensions (fixed per spec)
 */
export const BOARD_CONFIG = {
  COLS: 10,
  ROWS: 20,
  TICK_MS: 500, // Backend game tick rate
  INPUT_THROTTLE_MS: 50, // Frontend input throttle (backend enforces this too)
} as const;

/**
 * Game status messages
 */
export const GAME_MESSAGES = {
  WAITING_FOR_HOST: 'Waiting for host to start the game...',
  WAITING_FOR_PLAYERS: 'Waiting for more players to join...',
  GAME_OVER: 'Game Over',
  YOU_WIN: 'Victory! You are the last one standing!',
  YOU_LOSE: 'Defeated! Better luck next time.',
  PENALTY_INCOMING: 'Penalty lines incoming!',
} as const;
