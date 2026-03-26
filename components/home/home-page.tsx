import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StorySection } from "@/components/story-section"
import { IngredientsSection } from "@/components/ingredients-section"
import { BenefitsSection } from "@/components/benefits-section"
import { Footer } from "@/components/footer"

export function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 md:pt-20">
        <HeroSection />
        <StorySection />
        <IngredientsSection />
        <BenefitsSection />
        <Footer />
      </main>
    </>
  )
}
