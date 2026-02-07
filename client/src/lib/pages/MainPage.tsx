import AboutSection from '../../components/main/AboutSection'
import TeamSection from '../../components/main/TeamSection'
import ActionSection from '../../components/main/ActionSection'
import '../../App.css'
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
