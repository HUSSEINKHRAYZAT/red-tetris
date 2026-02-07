import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'single' | 'multi' | null
  playerName: string
  setPlayerName: (name: string) => void
  onConfirm: () => void
}

export default function NameRequestDialog({
  open,
  onOpenChange,
  mode,
  playerName,
  setPlayerName,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'single' ? 'Enter name for Singleplayer' : 'Enter name for Multiplayer'}</DialogTitle>
          <DialogDescription>Please provide the player name to continue.</DialogDescription>
        </DialogHeader>

        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="w-full mt-2 p-3 rounded bg-[#0b0b0b] border border-gray-800 text-white"
        />

        <DialogFooter>
          <DialogClose asChild>
            <button className="px-4 py-2 bg-transparent border border-gray-700 rounded text-white">Cancel</button>
          </DialogClose>
          <button onClick={onConfirm} className="px-4 py-2 bg-primary text-black font-bold rounded">Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
