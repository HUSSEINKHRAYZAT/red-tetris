import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './ui/dialog'
import { ACTION_SECTION } from '../lib/static';
import { socketStorage } from '../lib/utils/storage'

export default function ActionSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [playerName, setPlayerName] = useState(socketStorage.getPlayerName() ?? '')
  const [roomId, setRoomId] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  function openDialog() {
    setPlayerName(socketStorage.getPlayerName() ?? '')
    setRoomId('')
    // ensure any previous closing animation is cleared
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
      setIsClosing(false)
    }
    setDialogOpen(true)
  }

  // Intercept dialog open changes to run a close animation before actually closing
  function handleDialogOpenChange(next: boolean) {
    if (!next) {
      // start closing animation and delay unmount
      setIsClosing(true)
      // duration must match motion transition below (250ms)
      closeTimerRef.current = window.setTimeout(() => {
        setIsClosing(false)
        setDialogOpen(false)
        closeTimerRef.current = null
      }, 250)
    } else {
      // opening immediately
      setDialogOpen(true)
    }
  }

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  function handlePlaySolo() {
    if (!playerName || playerName.trim() === '') {
      alert('Please enter a player name')
      return
    }

    socketStorage.setPlayerName(playerName.trim())
    socketStorage.clearCurrentRoom()

    console.log('Start singleplayer as', playerName.trim())
    setDialogOpen(false)
  }

  function handleJoinOrCreateRoom() {
    if (!playerName || playerName.trim() === '') {
      alert('Please enter a player name')
      return
    }

    if (!roomId || roomId.trim() === '') {
      alert('Please enter or generate a room id')
      return
    }

    const room = roomId.trim()
    socketStorage.setPlayerName(playerName.trim())
    socketStorage.setCurrentRoom(room)

    console.log('Join/Create room', room, 'as', playerName.trim())
    setDialogOpen(false)
  }

  function handleGenerateRoom() {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase()
    setRoomId(id)
  }

  return (
    <section className="w-full pb-24 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.div
        className="bg-black border-4 border-double border-primary/30 p-8 rounded-xl relative overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
        <h2 className="relative z-10 text-4xl md:text-6xl font-display text-white text-center mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {ACTION_SECTION.TITLE}
        </h2>

        <div className="relative z-10 flex justify-center">
          <button onClick={openDialog} className="w-full md:w-1/3 group relative overflow-hidden bg-primary rounded-lg p-6 border-2 border-red-400 shadow-[0_0_15px_rgba(255,26,26,0.5)] hover:shadow-[0_0_25px_rgba(255,26,26,0.8)] transition-all duration-300 text-center cursor-pointer">
            <div className="relative z-10 flex flex-col items-center">
              <Users className="w-12 h-12 text-white mb-2 animate-pulse" />
              <h3 className="text-xl font-mono text-white font-bold uppercase tracking-widest drop-shadow-md">Play</h3>
            </div>
          </button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent>
            {/* Wrap content in motion.div to animate close */}
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={isClosing ? { opacity: 0, y: 12, scale: 0.98 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <DialogHeader>
                <DialogTitle>{ACTION_SECTION.DIALOG.TITLE_MULTI}</DialogTitle>
                <DialogDescription>{ACTION_SECTION.DIALOG.DESCRIPTION}</DialogDescription>
              </DialogHeader>

              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={ACTION_SECTION.DIALOG.PLACEHOLDER}
                className="w-full mt-2 p-3 rounded bg-[#0b0b0b] border border-gray-800 text-white"
              />

              <div className="mt-6">
                <button onClick={handlePlaySolo} className="w-full py-4 bg-gray-800 text-white rounded-lg text-lg font-bold">Play Solo</button>
              </div>

              <div className="flex items-center my-4 gap-4">
                <div className="flex-1 h-px bg-gray-700" />
                <div className="text-gray-400 uppercase text-sm">or</div>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room id"
                  className="flex-1 p-3 rounded bg-[#0b0b0b] border border-gray-800 text-white"
                />
                <button onClick={handleGenerateRoom} className="px-4 py-2 bg-gray-700 text-white rounded">Generate</button>
              </div>

              <div className="mt-4">
                <button onClick={handleJoinOrCreateRoom} className="w-full py-3 bg-primary text-black font-bold rounded-lg">Join / Create</button>
              </div>

              <div className="mt-6 flex justify-center">
                <DialogClose asChild>
                  <button className="px-4 py-2 bg-transparent border border-gray-700 rounded text-white">{ACTION_SECTION.DIALOG.CANCEL_BUTTON}</button>
                </DialogClose>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </section>
  );
}
