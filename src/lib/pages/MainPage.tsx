import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import '../../App.css'
// @ts-ignore
import TextType from '../../components/TextType'
import RadialOrbitalTimeline from '../../components/dashboard/radial-orbital-timeline'
import { Calendar, Code, FileText, User, Clock } from 'lucide-react'

export default function MainPage() {
  // no navigation needed in this file

  const timelineData = [
    {
      id: 1,
      title: 'Planning',
      date: 'Jan 2024',
      content: 'Project planning and requirements gathering phase.',
      category: 'Planning',
      icon: Calendar,
      relatedIds: [2],
      status: 'completed' as const,
      energy: 100,
    },
    {
      id: 2,
      title: 'Design',
      date: 'Feb 2024',
      content: 'UI/UX design and system architecture.',
      category: 'Design',
      icon: FileText,
      relatedIds: [1, 3],
      status: 'completed' as const,
      energy: 90,
    },
    {
      id: 3,
      title: 'Development',
      date: 'Mar 2024',
      content: 'Core features implementation and testing.',
      category: 'Development',
      icon: Code,
      relatedIds: [2, 4],
      status: 'in-progress' as const,
      energy: 60,
    },
    {
      id: 4,
      title: 'Testing',
      date: 'Apr 2024',
      content: 'User testing and bug fixes.',
      category: 'Testing',
      icon: User,
      relatedIds: [3, 5],
      status: 'pending' as const,
      energy: 30,
    },
    {
      id: 5,
      title: 'Release',
      date: 'May 2024',
      content: 'Final deployment and release.',
      category: 'Release',
      icon: Clock,
      relatedIds: [4],
      status: 'pending' as const,
      energy: 10,
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
        <div className="container mx-auto py-12">
          <RadialOrbitalTimeline timelineData={timelineData} />
        </div>
      </section>

    </main>
  )
}
