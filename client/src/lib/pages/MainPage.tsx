import React from 'react'
// @ts-ignore
import { GridScan } from '../../components/GridScan'
import AboutSection from '../../components/main/AboutSection'
import TeamSection from '../../components/main/TeamSection'
import ActionSection from '../../components/main/ActionSection'
import '../../App.css'
import { motion } from 'framer-motion'
import ScrollDownButton from '../../components/ui/ScrollDownButton'
import { LANDING_PAGE } from '../static'
import JumbotronSection from '../../components/main/JumbotronSection'

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
