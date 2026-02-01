import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import AboutSection from '../../components/AboutSection'
import TeamSection from '../../components/TeamSection'
import ActionSection from '../../components/ActionSection'
import '../../App.css'
import { motion } from 'framer-motion'

export default function MainPage() {
  return (
    <main className="main-page">
      <section className="jumbotron">
        <GridScan className="jumbotron__grid" />
        <div className="jumbotron__overlay">
          {/* static title and subtitle replaced with framer-motion entry animations */}
          <motion.h1
            className="jumbotron__title font-display"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Red Tetris
          </motion.h1>

          <motion.p
            className="jumbotron__subtitle"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          >
            Battle with falling blocks in real-time multiplayer Tetris. Create a room, challenge friends, and be the last one standing!
          </motion.p>
        </div>
      </section>

      <AboutSection />
      <TeamSection />
      <ActionSection />
    </main>
  )
}
