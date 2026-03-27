import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Noto_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const _noto = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto',
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

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_playfair.variable} ${_noto.variable} scroll-smooth`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
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
        <Toaster position="top-center" richColors />
        <CartProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
