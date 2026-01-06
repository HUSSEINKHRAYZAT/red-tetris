import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RadialOrbitalTimelineCardProps {
  item: any;
}

export default function RadialOrbitalTimelineCard({ item }: RadialOrbitalTimelineCardProps) {
  const isSingleOrMultiplayer = item.title?.toLowerCase().includes('single') || item.title?.toLowerCase().includes('multiplayer');

  return (
    <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/30" />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#FF073A]">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-white/80">
        <p className="mb-4">{item.content}</p>

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
