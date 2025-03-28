import React from 'react'
import { cn } from '@/lib/utils'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://admin-y2va.onrender.com'), // TODO: Replace with our domain
  description: 'Aprimore o desempenho da sua equipe com a Apex.',
  title: 'Apex',
  openGraph: {
    title: 'Apex',
    description: 'Aprimore o desempenho da sua equipe com a Apex.',
    images: '/assets/logo.svg',
  },
}

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="pt-br">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased max-w-screen-2xl mx-auto',
          fontSans.variable,
        )}
      >
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
