import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import '../../App.css'
// @ts-ignore
import TextType from '../../components/TextType'
import RadialOrbitalTimeline from '../../components/dashboard/radial-orbital-timeline'
import { Info, FileText, Play, Users } from 'lucide-react'
// @ts-ignore
import { BGPattern } from '@/components/ui/bg-pattern'

export default function MainPage() {
  // no navigation needed in this file

  const timelineData = [
    {
      id: 1,
      title: 'About Us',
      date: '',
      content: 'We are passionate developers building modern multiplayer gaming experiences with cutting-edge web technologies.',
      icon: Info,
      relatedIds: [2],
    },
    {
      id: 2,
      title: 'Project',
      date: '',
      content: 'A real-time multiplayer Tetris game featuring neon aesthetics, competitive gameplay, and seamless online battles.',
      icon: FileText,
      relatedIds: [1, 3, 4],
    },
    {
      id: 3,
      title: 'Single Player',
      date: '',
      content: 'Hone your skills with AI opponents and take on daily challenges to master the mechanics.',
      icon: Play,
      relatedIds: [2, 4],
    },
    {
      id: 4,
      title: 'Multiplayer',
      date: '',
      content: 'Create rooms, invite friends, and compete in real-time multiplayer matches. Last one standing wins!',
      icon: Users,
      relatedIds: [2, 3],
    },
  ];

  return (
    <main className="main-page">
      <section className="jumbotron">
        <GridScan className="jumbotron__grid" />
        <div className="jumbotron__overlay">
          <TextType
            as="h1"
            text="Red Tetris"
            className="jumbotron__title"
            showCursor={true}
            typingSpeed={50}
            loop={false}
            initialDelay={200}
          />

          <TextType
            as="p"
            text={`Battle with falling blocks in real-time multiplayer Tetris. Create a room, challenge friends, and be the last one standing!`}
            className="jumbotron__subtitle"
            showCursor={true}
            typingSpeed={20}
            loop={false}
            initialDelay={900}
            pauseDuration={4000}
          />
        </div>
      </section>

      <section className="timeline-section timeline-bg-dark">
        {/* Dotted red background pattern for entire timeline section */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <BGPattern variant="dots" mask="none" size={16} fill="#2a0505" />
        </div>
        
        <div className="container mx-auto py-12 relative z-10">
          <RadialOrbitalTimeline timelineData={timelineData} />
        </div>
      </section>

    </main>
  )
}
