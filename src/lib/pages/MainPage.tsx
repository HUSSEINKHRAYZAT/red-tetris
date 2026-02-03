import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import AboutSection from '../../components/AboutSection'
import TeamSection from '../../components/TeamSection'
import ActionSection from '../../components/ActionSection'
import '../../App.css'
import { motion } from 'framer-motion'
import ScrollDownButton from '../../components/ui/ScrollDownButton'
import { LANDING_PAGE } from '../static'
import JumbotronSection from '../../components/JumbotronSection'

export default function MainPage() {
  return (
    <main className="main-page">
      <JumbotronSection />
      <AboutSection />
      <TeamSection />
      <ActionSection />
    </main>
  )
}
