"use client"

import { useCart } from "@/lib/cart-context"
import { Product } from "@/components/admin/products-page"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export function CategoryClientPage({ products, categoryName }: { products: Product[], categoryName: string }) {
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

  return (
    <div className="bg-background-stitch text-on-surface font-body selection:bg-primary-container selection:text-white min-h-screen">
      <Navbar />
      
      {/* Spacer for fixed navbar */}
      <div className="h-32"></div>

      <section className="py-20 bg-surface-container-low min-h-screen">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <Link href="/store" className="text-sm font-medium hover:text-primary-container transition-colors mb-4 inline-flex items-center gap-2">
                 <span className="material-symbols-outlined text-[1rem]">arrow_back</span> Back to Store
              </Link>
              <h1 className="font-headline text-6xl text-on-surface mb-4 capitalize">{categoryName}</h1>
              <p className="text-on-surface-variant">Carefully crafted selections from our {categoryName.toLowerCase()} collection.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {products.length === 0 ? (
               <div className="col-span-12 p-12 text-center text-on-surface-variant font-medium text-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30">Currently out of stock.</div>
            ) : (
                products.map((product, index) => {
                    const priceDisplay = product.variants && product.variants.length > 0 ? `₹${product.variants[0].price}` : 'Sold Out'
                    const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCN6whATEA07Q4qa_eE0vNzVkGdkuFN_bnnSiTYTRdgyT6I9j2dh08cB8fw-2x_Ny6OC24gQzC3sa500aKUNwHXJbN5NDrFATC5Rr2B2EEPAYzv-kYhcuKxI6GJyYg_aiJWwwJja6AlVtf5fA_oeRTEve0QGE-7t1HAsqlpFwOqB6uIfOUhrZJAFJImObwuYbjx_SxKA7E_LSgQDs_PipAeC2HMeP-a2DVI9_8C_Px2r0AP3f2ycM9YjKezpHBJaD5UmtYFesYc6sI"
                    const displayImage = product.images?.[0] || product.image || defaultImage;
                    
                    if (index % 5 === 1) {
                        return (
                            <div key={product.id} className="md:col-span-8 group">
                                <div className="bg-surface-container-lowest h-full rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row transition-all duration-500 hover:shadow-xl">
                                    <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto">
                                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={displayImage} alt={product.title} />
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
                })
            )}
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
