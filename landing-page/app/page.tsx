import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Technology from '@/components/Technology'
import VideoConsultation from '@/components/VideoConsultation'
import CTA from '@/components/CTA'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Technology />
        <VideoConsultation />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

