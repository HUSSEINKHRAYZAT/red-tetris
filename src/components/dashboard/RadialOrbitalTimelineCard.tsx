import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Link, Zap } from 'lucide-react'

export default function RadialOrbitalTimelineCard({ item, onToggleRelated }) {
  return (
    <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className={`px-2 text-xs ${item.status === 'completed' ? 'text-white bg-black border-white' : item.status === 'in-progress' ? 'text-black bg-white border-black' : 'text-white bg-black/40 border-white/50'}`}>
            {item.status === 'completed' ? 'COMPLETE' : item.status === 'in-progress' ? 'IN PROGRESS' : 'PENDING'}
          </Badge>
          <span className="text-xs font-mono text-white/50">{item.date}</span>
        </div>
        <CardTitle className="text-sm mt-2">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-white/80">
        <p>{item.content}</p>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="flex items-center"><Zap size={10} className="mr-1" />Energy Level</span>
            <span className="font-mono">{item.energy}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${item.energy}%` }} />
          </div>
        </div>

        {item.relatedIds.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center mb-2">
              <Link size={10} className="text-white/70 mr-1" />
              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">Connected Nodes</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.relatedIds.map((relatedId) => {
                const relatedItem = null
                return (
                  <Button key={relatedId} variant="outline" size="sm" className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all" onClick={(e) => { e.stopPropagation(); onToggleRelated(relatedId); }}>
                    {relatedItem?.title}
                    <ArrowRight size={8} className="ml-1 text-white/60" />
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
