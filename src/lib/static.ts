
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
    CANCEL_BUTTON: 'Cancel',
    CONFIRM_BUTTON: 'Confirm',
  },
}
