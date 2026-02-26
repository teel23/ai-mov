import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI-Mov | Your Cinematic Guide',
  description: "AI-powered movie and TV recommendations. Tell me your mood — I'll find your perfect watch.",
  keywords: ['movie recommendations', 'TV shows', 'AI', 'cinema', 'streaming'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#0a0a0a] text-gray-100 h-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}
