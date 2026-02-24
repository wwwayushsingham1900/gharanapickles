import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Footer } from "@/components/footer"
import { Particles } from "@/components/particles"
import { Sun } from "lucide-react"

export default function ComingSoonPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 md:pt-20 relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-sunlight">
        {/* Ambient Lighting & Particles */}
        <div className="absolute inset-0 bg-sunlight-left pointer-events-none" />
        <Particles />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 w-full grid xl:grid-cols-2 gap-12 xl:gap-16 items-center py-16 md:py-20">
          {/* Hero Section */}
          <div className="space-y-6 md:space-y-8 animate-fade-in-up text-center xl:text-left">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-mustard-light/30 border border-mustard-dark/20 text-mustard-deep text-[10px] md:text-xs font-medium tracking-wide uppercase">
              <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Sun-dried in small batches
            </div>

            <h1 className="text-[2.5rem] leading-[1.1] md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-brown-dark text-balance">
              {"Gharana Pickles:"}
              <br className="hidden md:block" />
              <span className="text-chilli-dark italic font-normal">
                The Taste of Home,
              </span>
              <br />
              {"Coming Soon."}
            </h1>

            <p className="text-base md:text-xl text-brown-light font-light leading-relaxed max-w-md mx-auto xl:mx-0">
              Experience the richness of traditional recipes, handcrafted in small
              batches using pure, premium ingredients.
            </p>
          </div>

          {/* Product Card */}
          <div className="w-full flex justify-center xl:justify-end">
            <ProductCard />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
