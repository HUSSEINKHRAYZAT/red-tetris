import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
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
            className="jumbotron__title"
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
      </section>
    </main>
  )
}
