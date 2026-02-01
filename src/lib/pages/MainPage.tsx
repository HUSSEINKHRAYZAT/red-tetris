import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import AboutSection from '../../components/AboutSection'
import TeamSection from '../../components/TeamSection'
import ActionSection from '../../components/ActionSection'
import '../../App.css'
import { motion } from 'framer-motion'
import ScrollDownButton from '../../components/ui/ScrollDownButton'

export default function MainPage() {
  return (
    <main className="main-page">
      <section className="jumbotron">
        <GridScan className="jumbotron__grid" />
        <div className="jumbotron__overlay">
          <motion.h1
            className="jumbotron__title font-display"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Red Tetris
          </motion.h1>

          <motion.p
            className="jumbotron__subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          >
            Battle with falling blocks in real-time multiplayer Tetris. Create a room, challenge friends, and be the last one standing!
          </motion.p>
        </div>
        <div className="absolute inset-x-0 bottom-8 flex justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <ScrollDownButton />
          </div>
        </div>
      </section>

      <AboutSection />
      <TeamSection />
      <ActionSection />
    </main>
  )
}
