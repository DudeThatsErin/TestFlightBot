import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { GlobalHeader } from '@/components/global-header'
import '@/lib/init' // Initialize background jobs

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TestFlight Checker',
  description: 'Check TestFlight build status in real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // On page load or when changing themes, best to add inline in head to avoid FOUC
              document.documentElement.classList.toggle(
                'dark',
                localStorage.theme === 'dark' ||
                  (!('theme' in localStorage) && true) // Default to dark theme
              );
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <GlobalHeader />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
