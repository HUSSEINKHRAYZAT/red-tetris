import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './lib/pages/MainPage'
import GamePage from './lib/pages/GamePage'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/:room/:player" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
