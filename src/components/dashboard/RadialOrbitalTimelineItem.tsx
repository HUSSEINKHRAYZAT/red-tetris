import React from 'react'

export default function RadialOrbitalTimelineItem({ item, isExpanded, isRelated, isPulsing, onToggle }) {
  const Icon = item.icon
  return (
    <div className="absolute transition-all duration-700 cursor-pointer" style={{ transform: `translate(${item._posX}px, ${item._posY}px)`, zIndex: isExpanded ? 200 : item._zIndex, opacity: isExpanded ? 1 : item._opacity }} onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}>
      <div className={`absolute rounded-full -inset-1 ${isPulsing ? 'animate-pulse duration-1000' : ''}`} style={{ background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`, width: `${item.energy * 0.5 + 40}px`, height: `${item.energy * 0.5 + 40}px`, left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`, top: `-${(item.energy * 0.5 + 40 - 40) / 2}px` }} />

      <div className={`${isExpanded ? 'bg-white text-black' : isRelated ? 'bg-white/50 text-black' : 'bg-black text-white'} border-2 ${isExpanded ? 'border-white shadow-lg shadow-white/30' : isRelated ? 'border-white animate-pulse' : 'border-white/40'} w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'scale-150' : ''}`}>
        <Icon size={16} />
      </div>

      <div className={`${isExpanded ? 'text-white scale-125' : 'text-white/70'} absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300`}>
        {item.title}
      </div>
    </div>
  )
}
