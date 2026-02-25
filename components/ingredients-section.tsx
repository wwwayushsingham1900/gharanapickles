import Image from "next/image"

const ingredients = [
  {
    name: "Sun-dried Chillies",
    subtitle: "Hand-picked & crisp",
    image:
      "https://res.cloudinary.com/dlj1oohhg/image/upload/v1772035592/Ingredient_chilli_tc2bo8.png",
  },
  {
    name: "Mustard Oil",
    subtitle: "Pure kachi ghani",
    image:
      "https://res.cloudinary.com/dlj1oohhg/image/upload/v1772035592/Ingredient_oil_xiqiaw.png",
  },
  {
    name: "Desi Spices",
    subtitle: "Fennel & coriander",
    image:
      "https://res.cloudinary.com/dlj1oohhg/image/upload/v1772035592/ingredient_masala_cymouf.png",
  },
  {
    name: "Mother's Touch",
    subtitle: "No preservatives",
    image:
      "https://res.cloudinary.com/dlj1oohhg/image/upload/v1772035592/moooom_kvrl7v.png",
  },
]

export function IngredientsSection() {
  return (
    <section className="md:py-24 overflow-hidden pt-16 pb-16 relative">
      <div className="md:px-6 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 space-y-3 md:space-y-4 px-2">
          <h2 className="text-[1.75rem] md:text-3xl font-serif font-medium tracking-tight text-brown-dark text-balance">
            Pure Ingredients, Honest Flavor
          </h2>
          <p className="text-brown-light text-sm max-w-xl mx-auto">
            Sourced directly from village farms, ensuring every bite carries the
            authentic essence of rural India.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-10 md:gap-8">
          {ingredients.map((ingredient, index) => (
            <div
              key={ingredient.name}
              className="flex flex-col items-center text-center space-y-3 md:space-y-4 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card flex items-center justify-center border border-mustard/20 shadow-sm p-1 relative overflow-hidden">
                <Image
                  src={ingredient.image}
                  alt={ingredient.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="px-1">
                <h3 className="font-medium text-brown-dark tracking-tight text-[0.95rem] md:text-base leading-tight">
                  {ingredient.name}
                </h3>
                <p className="text-[11px] md:text-xs text-brown-light mt-1.5">
                  {ingredient.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
