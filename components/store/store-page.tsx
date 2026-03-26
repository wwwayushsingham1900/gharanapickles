"use client"

import { useCart } from "@/lib/cart-context"
import { Product } from "@/components/admin/products-page"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export function StorePage({ products }: { products: Product[] }) {
  const { addToCart, setIsCartOpen } = useCart()

  const handleAddToCart = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return
    const variant = product.variants[0]
    
    addToCart({
      id: `${product.id}-${variant.size}`,
      title: product.title,
      size: variant.size,
      price: variant.price,
      image: product.images?.[0] || product.image || "",
      quantity: 1,
      isPreorder: true
    })
    setIsCartOpen(true)
  }

  // Group products
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Our Collection';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="bg-background-stitch text-on-surface font-body selection:bg-primary-container selection:text-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover opacity-20" alt="aesthetic minimalist setup of a premium glass pickle jar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKSeTWFJ2cc1SOkK4NYLQKo5SECEI9CypoWWGmWE355-AIUIS1ujn19xT5G8mrXet4uXQwh6Ukt0A-FJVE5rSWHMVpo0GJMRRT-PhIlw2QrvMf84L098M9j-s312l4HYeR4ifL51Vqu2CP7ZPILtEyibd3Fnb4mD_FO-jFW5WWyVdKkgyhcyteMXNHqhJ_UuvstRupRnZP-V5dvd_R6LiqXuVVlX6wXEBrzQKnBj2JIDGBlQkgbzMjDFxD6A9bwUz8bdqCOHHw_Zk" />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-tertiary-container block">Limited Pre-Order Available</span>
            <h1 className="font-headline text-6xl md:text-8xl leading-tight text-on-surface">
              Gharana Pickles <br/>
              <span className="italic font-normal text-primary-container">The Taste of Home</span>
            </h1>
            <p className="text-on-surface-variant max-w-md text-lg leading-relaxed font-light">
              Experience the richness of traditional recipes, handcrafted in small batches. Secure your authentic batch today.
            </p>
            <div className="flex gap-4">
              <a className="bg-primary-container text-on-primary-stitch px-10 py-4 rounded-md font-medium hover:bg-primary-stitch transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg" href="#shop">
                Order Now
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="w-72 h-[450px] bg-surface-container-lowest rounded-full p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden">
              <img className="w-full h-full object-cover rounded-full" alt="close up high resolution shot of a rustic glass jar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClSyUefN2VtcC9VQXDAoY2hIOwWxRHvm-NB-UGu0kzKZyR1DtR0C_swzvK-Ku3hU7HwWb8M-dWq5mmd4IqG-Ty22jIS8ExMvw6UxnLiFZ5WutivnNAD7zk-KERv6wXje6QmyhbLP6ceBrmC2dIW9ADPt19noItqxyKKsRGU7Ca572xeTJiMPvd6D_kogtBoiGqKtZm9vGMAdPAQwIiGlXcpPKhQBDCx-zuVMJXK6Kz-Wg1fPijPzi_EUrdCbl-VNxH99A6D396JW8" />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-container rounded-full flex items-center justify-center p-8 text-center rotate-[-12deg] shadow-xl">
              <p className="font-headline italic text-on-secondary-container text-lg">Sun-dried in Small Batches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase by Category */}
      <div id="shop" className="bg-surface-container-low pb-32">
        {Object.keys(groupedProducts).length === 0 ? (
           <section className="py-32 container mx-auto px-6">
              <div className="col-span-12 p-12 text-center text-on-surface-variant font-medium text-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30">Currently out of stock.</div>
           </section>
        ) : (
          Object.entries(groupedProducts).map(([categoryName, catProducts]) => (
            <section key={categoryName} className="pt-32">
              <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                  <div>
                    <h2 className="font-headline text-5xl text-on-surface mb-4">{categoryName}</h2>
                    <p className="text-on-surface-variant">Carefully crafted selections from our {categoryName.toLowerCase()} collection.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 p-1 bg-surface-container-high rounded-lg hover:shadow-md transition-shadow">
                    <Link href={`/store/category/${categoryName.toLowerCase()}`} className="px-6 py-2 rounded-md bg-surface-container-lowest text-on-surface flex items-center gap-2 shadow-sm text-sm font-medium transition-all hover:text-primary-container">
                        View All <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {catProducts.map((product, index) => {
                      const priceDisplay = product.variants && product.variants.length > 0 ? `₹${product.variants[0].price}` : 'Sold Out'
                      const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCN6whATEA07Q4qa_eE0vNzVkGdkuFN_bnnSiTYTRdgyT6I9j2dh08cB8fw-2x_Ny6OC24gQzC3sa500aKUNwHXJbN5NDrFATC5Rr2B2EEPAYzv-kYhcuKxI6GJyYg_aiJWwwJja6AlVtf5fA_oeRTEve0QGE-7t1HAsqlpFwOqB6uIfOUhrZJAFJImObwuYbjx_SxKA7E_LSgQDs_PipAeC2HMeP-a2DVI9_8C_Px2r0AP3f2ycM9YjKezpHBJaD5UmtYFesYc6sI"
                      const displayImage = product.images?.[0] || product.image || defaultImage;
                      
                      if (index % 5 === 1) {
                          return (
                              <div key={product.id} className="md:col-span-8 group">
                                  <div className="bg-surface-container-lowest h-full rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row transition-all duration-500 hover:shadow-xl">
                                      <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto">
                                          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={displayImage} alt={product.title} />
                                          <span className="absolute top-4 left-4 bg-primary-container text-on-primary-stitch px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">Bestseller</span>
                                      </div>
                                      <div className="md:w-1/2 p-10 flex flex-col justify-center space-y-6">
                                          <span className="font-label text-[10px] uppercase tracking-widest text-tertiary opacity-60">{categoryName} Item</span>
                                          <h3 className="font-headline text-4xl text-on-surface">{product.title}</h3>
                                          <p className="text-on-surface-variant leading-relaxed">
                                              {product.description || "A delicate, crunchy masterpiece crafted with traditional spices."}
                                          </p>
                                          <div className="flex items-center gap-6">
                                              <span className="text-tertiary font-serif text-3xl">{priceDisplay}</span>
                                              <button onClick={() => handleAddToCart(product)} className="flex-grow bg-primary-container text-on-primary-stitch py-4 rounded font-medium hover:bg-primary-stitch transition-all shadow-lg text-center cursor-pointer">Order Now</button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )
                      }

                      return (
                          <div key={product.id} className="md:col-span-4 group">
                              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                                  <div className="relative aspect-[4/5] overflow-hidden">
                                      <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={displayImage} alt={product.title} />
                                      {index === 0 && <span className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">Limited Batch</span>}
                                      {index === 3 && <span className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">New Season</span>}
                                  </div>
                                  <div className="p-8 space-y-4 flex-grow flex flex-col justify-between">
                                      <div>
                                          <div className="flex justify-between items-start mb-2">
                                              <h3 className="font-headline text-2xl text-on-surface">{product.title}</h3>
                                              <span className="text-tertiary font-serif text-xl">{priceDisplay}</span>
                                          </div>
                                          <p className="text-on-surface-variant text-sm line-clamp-3">
                                              {product.description || "Heritage recipe sun-dried in brass vessels. Infused with heirloom spices."}
                                          </p>
                                      </div>
                                      <button onClick={() => handleAddToCart(product)} className="w-full bg-primary-container text-on-primary-stitch py-4 rounded font-medium hover:bg-primary-stitch transition-all flex justify-center items-center gap-2 group/btn cursor-pointer">
                                          Add to Bag
                                          <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">shopping_cart</span>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )
                  })}
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      {/* Aesthetic Storytelling */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
          <div className="relative order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <img className="rounded-lg w-full h-64 object-cover mt-12" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtqbKJiaua4E47x4GAyAy5Qbav50k6iTygdV2XG5_fn8fG98J88TSNIdKPP4ipSIym0zbQ8H1gD3s6SEar2m5XFLLIoc7sXN_bUI_aFR81-Fb8NW4anqZleB1jMeq2OGhKQ_u4jeLu4KVoT4Ze5Ojg036rICxdYUFhKAjTI32JA51wxsB3AUgv2spHXLL-wIc5KRBKpQiRcFufw1o4c8UxvNSF1bHmlmWVnXAK4WIb1KuhitESIG_vY_K7X7X0-uHTVYDiHs0Zx8E" alt="Spices" />
              <img className="rounded-lg w-full h-64 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGwEnacS5Q2LtcTZORsN4uvY6GtSreZSSu7kP3qthZQcqw53XKYoswNVCe6-d2Ys460YIQcJqRdOue7M1BTewH0hbOiztn8lz_CG5SuFuFiwHpaXN3Uk7cbM-oiEU7idy3OJDae5vUW1xERcQ0GI6fp9jcphWOlzEUfNLuJNL-espy96PogNKW_lc03UqAT5t2vBu6A2BKsjggqYAMLem3pbp3Vg6KPCWVVzPQMKGZ5kAAPF9f3wcvSWcI2y5UOvuNNtV5-Qjctbo" alt="Jars" />
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-container-low rounded-full blur-3xl opacity-50"></div>
          </div>
          <div className="space-y-8 order-1 md:order-2">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary-stitch">The Maker's Philosophy</span>
            <h2 className="font-headline text-5xl leading-tight text-on-surface">Made With <br/><span className="italic font-normal">Love</span></h2>
            <div className="space-y-6 text-on-surface-variant font-light text-lg leading-relaxed">
              <p>At Gharana Pickles, we believe that time is the most important ingredient. We don't rush the process. Our pickles aren't just food; they are captured seasons, aged with patience in natural sunlight.</p>
              <p>Every jar tells a story of our home, and the ancient techniques passed down through generations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Commitment (Bento Grid) */}
      <section className="py-20 bg-on-surface text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="p-8 space-y-4 border-l border-white/10">
              <span className="material-symbols-outlined text-4xl text-secondary-container">nature</span>
              <h4 className="font-headline text-xl">100% Organic</h4>
              <p className="text-white/60 text-sm font-light leading-relaxed">Sourced from small-scale pesticide-free farms.</p>
            </div>
            <div className="p-8 space-y-4 border-l border-white/10">
              <span className="material-symbols-outlined text-4xl text-secondary-container">hourglass_empty</span>
              <h4 className="font-headline text-xl">Slow Process</h4>
              <p className="text-white/60 text-sm font-light leading-relaxed">Sun-dried in pure mustard oil with zero preservatives.</p>
            </div>
            <div className="p-8 space-y-4 border-l border-white/10">
              <span className="material-symbols-outlined text-4xl text-secondary-container">handyman</span>
              <h4 className="font-headline text-xl">Hand-Crafted</h4>
              <p className="text-white/60 text-sm font-light leading-relaxed">Handcrafted in our village kitchen in small batches.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-12 flex flex-col items-center gap-8 bg-stone-100 dark:bg-stone-950 pt-24 pb-12 transition-opacity duration-500 hover:opacity-100">
        <div className="font-serif text-lg text-stone-900 mb-4">Gharana Pickles</div>
        <div className="flex flex-wrap justify-center gap-10 font-sans text-[10px] uppercase tracking-widest">
            <a className="text-stone-500 hover:text-red-700 transition-opacity" href="#">Privacy</a>
            <a className="text-stone-500 hover:text-red-700 transition-opacity" href="#">Sustainability</a>
            <a className="text-stone-500 hover:text-red-700 transition-opacity" href="#">Wholesale</a>
            <a className="text-stone-500 hover:text-red-700 transition-opacity" href="#">Contact</a>
        </div>
        <div className="w-full h-px bg-stone-200 dark:bg-stone-800 my-4 max-w-4xl"></div>
        <p className="font-sans text-[10px] uppercase tracking-widest text-stone-500 text-center">
            © 2024 Gharana Pickles. Made with Love, Packed with Tradition.
        </p>
      </footer>
    </div>
  )
}
