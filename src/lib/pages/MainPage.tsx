import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import '../../App.css'
// @ts-ignore
import TextType from '../../components/TextType'

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
            showCursor={false}
            typingSpeed={50}
            loop={false}
            initialDelay={200}
          />

          <TextType
            as="p"
            text={`Battle with falling blocks in real-time multiplayer Tetris. Create a room, challenge friends, and be the last one standing!`}
            className="jumbotron__subtitle"
            showCursor={false}
            typingSpeed={20}
            loop={false}
            initialDelay={900}
            pauseDuration={4000}
          />
        </div>
      </section>
    </main>
  )
}
