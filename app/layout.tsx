import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import AuthHeader from '@/app/components/AuthHeader'
import ThemeRegistry from '@/app/components/ThemeRegistry'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Baker-Ing',
  description: 'Маркетплейс для пекарей и покупателей',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionProvider session={session}>
          <ThemeRegistry>
            <AuthHeader />
            <main>{children}</main>
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  )
}
