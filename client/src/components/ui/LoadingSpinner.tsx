
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-red-500/50 rounded-full animate-spin" 
             style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  )
}
