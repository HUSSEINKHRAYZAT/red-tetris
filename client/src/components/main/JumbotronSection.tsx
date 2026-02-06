import React from 'react'
import { motion } from 'framer-motion'
// @ts-ignore
import { GridScan } from '../GridScan'
import ScrollDownButton from '../ui/ScrollDownButton'
import { LANDING_PAGE } from '../../lib/static'

export default function JumbotronSection() {
  return (
    <section className="jumbotron">
      <GridScan className="jumbotron__grid" />
      <div className="jumbotron__overlay">
        <motion.h1
          className="jumbotron__title font-display"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {LANDING_PAGE.TITLE}
        </motion.h1>

        <motion.p
          className="jumbotron__subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
        >
          {LANDING_PAGE.SUBTITLE}
        </motion.p>
      </div>
      <div className="absolute inset-x-0 bottom-8 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <ScrollDownButton />
        </div>
      </div>
    </section>
  )
}
