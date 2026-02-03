Project pages overview

This document lists every page-level entry under `src/lib/pages/`, describes responsibilities, and notes whether the page is a working screen or a placeholder/stub that can be removed.

Files

- `src/lib/pages/MainPage.tsx` — Canonical home / landing page (READY)
  - Purpose: primary public landing for the app. This is the only production page currently implemented and wired in routing.
  - Key pieces:
    - Jumbotron: `GridScan` background, jumbotron overlay with animated title (`framer-motion`) and subtitle.
    - `ScrollDownButton` (persistent, bottom-centered) that scrolls to next content.
    - Sections composed as separate components: `AboutSection`, `TeamSection`, `ActionSection` (imported from `src/components`).
    - `ActionSection` opens a name-request dialog (Radix wrapper) when selecting Singleplayer / Multiplayer.
  - Notes: animations are configured with `viewport.once: false` so they replay on scroll. Fonts for title/subtitle were explicitly set to heading/body variables.

- `src/lib/pages/Leaderboard.tsx` — Stub (REMOVED / STUB)
  - Current status: intentionally reduced to a minimal stub that returns `null` to avoid breaking imports during development.
  - If you want a leaderboard page later: implement UI to fetch leaderboard data and mount under `/leaderboard` route.
  - Option: remove the file entirely if you don't want the placeholder kept in the repo.

- `src/lib/pages/MultiplayerLobby.tsx` — Stub (REMOVED / STUB)
  - Current status: minimal stub returning `null`. The project is focused on the MainPage for now.
  - Intended future behavior: lobby UI to create/join rooms, show players, start games.

- `src/lib/pages/PhysicsDemo.tsx` — Stub (REMOVED / STUB)
  - Current status: minimal stub returning `null`.
  - Intended future behavior: optional demo page (physics/canvas) — can be implemented or deleted.

Routing

- `src/main.tsx` registers the router. At present only the root route `/` mounts the `MainPage` component. The other routes were removed from the router to avoid accidental navigation to mock pages.
- `src/App.tsx` currently forwards to the `MainPage` export.

Notes / next steps

- The three non-main pages are intentionally stubbed out. If you prefer them deleted, remove the files and any imports; if you want real pages, implement their contents and re-add routes in `src/main.tsx`.
- Main flows remaining to implement:
  - Wire the `NameRequestDialog` confirm action to the real game flow (start singleplayer / create-join multiplayer room and navigate); currently confirm logs to console.
  - If you add server integration, implement the multiplayer lobby and leaderboard pages to reflect live state.
- To run the app locally (dev):
  - Ensure dependencies are installed (check `package.json`); if you add missing packages run `npm install` or `pnpm install`.
  - Start dev server: `npm run dev` (or your usual script from `package.json`).

If you want, I can now:
- Generate a README section describing the main page component tree and component props in more detail.
- Remove the stub page files completely (delete) and clean imports.
- Implement a basic leaderboard/Lobby UI scaffold that uses mock data so the routes can be restored for testing.
