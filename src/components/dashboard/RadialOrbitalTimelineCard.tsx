import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'lucide-react'

interface RadialOrbitalTimelineCardProps {
  item: any;
  timelineData?: any[];
  onToggleRelated: (id: number) => void;
}

export default function RadialOrbitalTimelineCard({ item, timelineData, onToggleRelated }: RadialOrbitalTimelineCardProps) {
  const isSingleOrMultiplayer = item.title?.toLowerCase().includes('single') || item.title?.toLowerCase().includes('multiplayer');

  return (
    <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/30" />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#FF073A]">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-white/80">
        <p className="mb-4">{item.content}</p>

        {item.relatedIds && item.relatedIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center mb-2">
              <Link size={12} className="text-white/70 mr-2" />
              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">Related</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.relatedIds.map((relatedId: number) => {
                const relatedItem = timelineData?.find((i: any) => i.id === relatedId);
                return (
                  <Button
                    key={relatedId}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 py-0 text-xs border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onToggleRelated(relatedId);
                    }}
                  >
                    {relatedItem?.title || `Node ${relatedId}`}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {isSingleOrMultiplayer && (
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
            <Button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                console.log('Navigate to:', item.title);
              }}
              className="bg-[#FF073A] hover:bg-[#cc0530] text-white"
            >
              Open Demo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
