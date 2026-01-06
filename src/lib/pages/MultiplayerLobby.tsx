import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MultiplayerLobby() {
  return (
    <div className="min-h-screen bg-black text-[#FF073A] p-8">
      <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors mb-8">
        <ArrowLeft /> Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-4">Multiplayer Lobby</h1>
      <p className="text-xl text-gray-400">Matchmaking and lobby interface would be loaded here.</p>
    </div>
  );
}
