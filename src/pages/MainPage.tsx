import GridScan from '../../components/dashboard/grid-scan'
import TextType from '../../components/dashboard/text-type'
import RadialOrbitalTimeline, { RadialOrbitalTimelineDemo } from '../../components/dashboard/radial-orbital-timeline'

export default function MainPage() {
  // no navigation needed in this file

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
          {/* Demo timeline */}
          <RadialOrbitalTimelineDemo />
        </div>
      </section>

    </main>
  )
}
