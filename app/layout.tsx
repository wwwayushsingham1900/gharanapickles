import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: "Gharana Pickles - Handcrafted Stuffed Chilli Pickle",
  description:
    "Handcrafted in our village kitchen, slow-cured in pure mustard oil. Sun-dried in small batches with zero preservatives. Gharana Pickles - Made with Love, Packed with Tradition.",
  icons: {
    icon: [
      {
        url: '/logo.svg?v=2',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.svg?v=2',
  },
}

export const viewport: Viewport = {
  themeColor: '#FDFBF7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_playfair.variable} scroll-smooth`}>
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NWQGMMCPJ9"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NWQGMMCPJ9');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-base text-brown-dark bg-mud-pattern relative overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
