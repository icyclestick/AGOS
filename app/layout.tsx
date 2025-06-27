import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AGOS',
  description: 'Created with our minds',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
