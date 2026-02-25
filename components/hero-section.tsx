import Link from "next/link"
import Image from "next/image"
import { Sun, ArrowRight } from "lucide-react"
import { Particles } from "./particles"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-sunlight">
      {/* Ambient Lighting & Particles */}
      <div className="absolute inset-0 bg-sunlight-left pointer-events-none" />
      <Particles />

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 w-full grid md:grid-cols-2 gap-10 md:gap-12 items-center py-10 md:py-12">
        {/* Hero Text */}
        <div className="space-y-6 md:space-y-8 animate-fade-in-up text-center md:text-left mt-4 md:mt-0">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-mustard-light/30 border border-mustard-dark/20 text-mustard-deep text-[10px] md:text-xs font-medium tracking-wide uppercase">
            <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Sun-dried in small batches
          </div>

          <h1 className="text-[2.5rem] leading-[1.1] md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-brown-dark text-balance">
            {"Made with Mother's Love, "}
            <br className="hidden md:block" />
            <span className="text-chilli-dark italic font-normal">
              Packed with Tradition.
            </span>
          </h1>

          <p className="text-base md:text-xl text-brown-light font-light leading-relaxed max-w-md mx-auto md:mx-0">
            Handcrafted in our village kitchen, slow-cured in pure mustard oil,
            just like Maa used to make.
          </p>

          <div className="pt-2 md:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-4 sm:gap-6">
            <Link
              href="/coming-soon"
              className="bg-chilli-dark text-primary-foreground px-6 py-3.5 md:px-8 md:py-4 rounded-full text-sm font-medium tracking-wide hover:bg-chilli hover:shadow-[0_8px_30px_rgba(153,27,27,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 text-center"
            >
              Taste the Love
            </Link>
            <a
              href="#story"
              className="text-sm font-medium text-brown-dark hover:text-mustard-deep transition-colors flex items-center justify-center gap-2 py-2 sm:py-0"
            >
              Our Story <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-full min-h-[350px] md:min-h-[500px] flex justify-center items-center animate-fade-in-up [animation-delay:200ms] mt-4 md:mt-0">
          {/* Soft glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-mustard/20 to-terracotta/10 rounded-[3rem] blur-2xl md:blur-3xl transform -rotate-6 scale-105 md:scale-100" />

          <div className="relative w-full max-w-[260px] sm:max-w-xs md:max-w-md aspect-[4/5] rounded-t-full rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden border-4 md:border-8 border-card/60 shadow-[0_20px_40px_rgba(69,26,3,0.15)] md:shadow-[0_20px_50px_rgba(69,26,3,0.1)]">
            <div className="bg-gradient-to-t from-brown-dark/40 via-transparent to-transparent mix-blend-multiply absolute inset-0 z-10" />
            <Image
              src="https://res.cloudinary.com/dlj1oohhg/image/upload/v1772030882/aura_imag_ahnigv.png"
              alt="Traditional Indian Pickles in Jar"
              fill
              className="object-cover object-center transform hover:scale-105 transition-transform duration-1000 -translate-y-3"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
