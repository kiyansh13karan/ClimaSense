import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClimaSense',
  description:
    'Premium atmospheric intelligence and flood risk monitoring. Real-time insights powered by Llama 3.3 70B and Tomorrow.io.',
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>

          {/* Page content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Global WeatherWise Hack footer — shown on all pages */}
          <div className="w-full border-t border-border/15 py-3 px-4 text-center bg-background/60 backdrop-blur-sm">
            <p className="text-[11px] text-muted-foreground/35 tracking-wide">
              Made for{' '}
              <span className="text-primary/50 font-medium">WeatherWise Hack</span>
            </p>
          </div>


        </ThemeProvider>
      </body>
    </html>
  )
}
