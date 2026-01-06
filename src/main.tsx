import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './lib/pages/MainPage'
import PhysicsDemo from './lib/pages/PhysicsDemo'
import MultiplayerLobby from './lib/pages/MultiplayerLobby'
import Leaderboard from './lib/pages/Leaderboard'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/physics-demo" element={<PhysicsDemo />} />
        <Route path="/multiplayer-lobby" element={<MultiplayerLobby />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
