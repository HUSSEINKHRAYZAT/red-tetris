import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainPage from './lib/pages/MainPage'
import GamePage from './lib/pages/GamePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/:room/:playerName" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
