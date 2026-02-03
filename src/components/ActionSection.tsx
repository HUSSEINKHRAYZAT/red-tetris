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
import { isValidPlayerName, isValidRoomId, generateRoomId } from '../lib/utils/validation'
import { socketService } from '../lib/socket/services/socketService'

export default function ActionSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [playerName, setPlayerName] = useState(socketStorage.getPlayerName() ?? '')
  const [roomId, setRoomId] = useState('')
  const [nameError, setNameError] = useState(false)
  const [roomError, setRoomError] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  // Setup socket event listeners
  useEffect(() => {
    // Listen for connection events
    const unsubConnect = socketService.onConnect(() => {
      console.log('✅ [ActionSection] Socket connected! ID:', socketService.getSocketId())
    })

    const unsubDisconnect = socketService.onDisconnect(() => {
      console.log('❌ [ActionSection] Socket disconnected')
    })

    // Listen for lobby updates
    const unsubLobby = socketService.onLobbyUpdate((data) => {
      console.log('🎮 [ActionSection] Lobby update received:', {
        room: data.room,
        started: data.started,
        players: data.players,
        playerCount: data.players.length
      })
    })

    // Listen for errors
    const unsubError = socketService.onError((data) => {
      console.error('⚠️ [ActionSection] Server error:', data.message)
    })

    return () => {
      unsubConnect()
      unsubDisconnect()
      unsubLobby()
      unsubError()
    }
  }, [])

  function openDialog() {
    setPlayerName(socketStorage.getPlayerName() ?? '')
    setRoomId('')
    setNameError(false)
    setRoomError(false)
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
        setIsConnecting(false)
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

  async function handlePlaySolo() {
    const name = playerName?.trim() ?? ''
    const validName = isValidPlayerName(name)
    setNameError(!validName)

    if (!validName) return

    setIsConnecting(true)
    socketStorage.setPlayerName(name)
    socketStorage.clearCurrentRoom()

    try {
      // Connect to server
      await socketService.connect()
      console.log('✅ [Solo] Connected to server as:', name)
      console.log('✅ [Solo] Socket ID:', socketService.getSocketId())

      // TODO: Navigate to solo game page or start solo game logic
      console.log('🎮 [Solo] Starting singleplayer mode...')

      // close with animation
      handleDialogOpenChange(false)
    } catch (error) {
      console.error('❌ [Solo] Failed to connect:', error)
      setIsConnecting(false)
    }
  }

  async function handleJoinOrCreateRoom() {
    const name = playerName?.trim() ?? ''
    const room = roomId?.trim().toUpperCase() ?? ''

    const validName = isValidPlayerName(name)
    const validRoom = isValidRoomId(room)

    setNameError(!validName)
    setRoomError(!validRoom)

    if (!validName || !validRoom) return

    setIsConnecting(true)
    socketStorage.setPlayerName(name)
    socketStorage.setCurrentRoom(room)

    try {
      // Connect to server
      await socketService.connect()
      console.log('✅ [Multiplayer] Connected to server as:', name)
      console.log('✅ [Multiplayer] Socket ID:', socketService.getSocketId())

      // Join the room
      socketService.joinRoom(room, name)
      console.log('🎮 [Multiplayer] Joining room:', room)
      console.log('👤 [Multiplayer] Player name:', name)
      console.log('⏳ [Multiplayer] Waiting for lobby update...')

      // TODO: Navigate to lobby/game page

      // close with animation
      handleDialogOpenChange(false)
    } catch (error) {
      console.error('❌ [Multiplayer] Failed to connect:', error)
      setIsConnecting(false)
    }
  }

  function handleGenerateRoom() {
    const id = generateRoomId()
    setRoomId(id)
    setRoomError(false)
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
                onChange={(e) => {
                  setPlayerName(e.target.value)
                  if (nameError) setNameError(false)
                }}
                placeholder={ACTION_SECTION.DIALOG.PLACEHOLDER}
                className={`w-full mt-2 p-3 rounded bg-[#0b0b0b] border ${nameError ? 'border-red-500' : 'border-gray-800'} text-white`}
              />

              <div className="mt-6">
                <button
                  onClick={handlePlaySolo}
                  disabled={isConnecting}
                  className={`w-full py-4 bg-gray-800 text-white rounded-lg text-lg font-bold ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isConnecting ? 'Connecting...' : ACTION_SECTION.DIALOG.PLAY_SOLO_BUTTON}
                </button>
              </div>

              <div className="flex items-center my-4 gap-4">
                <div className="flex-1 h-px bg-gray-700" />
                <div className="text-gray-400 uppercase text-sm">or</div>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={roomId}
                  onChange={(e) => {
                    // auto-uppercase and remove invalid chars
                    const raw = (e.target.value ?? '').toUpperCase()
                    const sanitized = raw.replace(/[^A-Z0-9]/g, '')
                    setRoomId(sanitized)
                    if (roomError) setRoomError(false)
                  }}
                  placeholder={ACTION_SECTION.DIALOG.PLACEHOLDER_ROOM}
                  className={`flex-1 p-3 rounded bg-[#0b0b0b] border ${roomError ? 'border-red-500' : 'border-gray-800'} text-white`}
                />
                <button onClick={handleGenerateRoom} className="px-4 py-2 bg-gray-700 text-white rounded">{ACTION_SECTION.DIALOG.GENERATE_BUTTON}</button>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleJoinOrCreateRoom}
                  disabled={isConnecting}
                  className={`w-full py-3 bg-primary text-black font-bold rounded-lg ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isConnecting ? 'Connecting...' : ACTION_SECTION.DIALOG.JOIN_CREATE_BUTTON}
                </button>
              </div>

              {/* Error rules block shown at end of dialog */}
              {(nameError || roomError) && (
                <div className="mt-4 text-red-400 font-mono text-sm space-y-1">
                  {nameError && (
                    <div>{ACTION_SECTION.DIALOG.NAME_RULES}</div>
                  )}
                  {roomError && (
                    <div>{ACTION_SECTION.DIALOG.ROOM_RULES}</div>
                  )}
                </div>
              )}

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
