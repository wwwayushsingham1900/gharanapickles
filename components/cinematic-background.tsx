import Image from "next/image"

export function CinematicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Image
        src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
        alt="Modern Kitchen"
        fill
        className="object-cover scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-deep/90 via-charcoal-deep/70 to-earth-dark/60 backdrop-blur-sm" />
    </div>
  )
}
