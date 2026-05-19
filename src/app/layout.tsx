import type { Metadata, Viewport } from 'next'
import { Poppins, Inter, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { ThemeSync } from '@/components/theme-sync'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-number',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Milk Dairy',
  description: 'Premium Milk Dairy Management System',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Milk Dairy',
  },
  openGraph: {
    title: 'Milk Dairy',
    description: 'Premium Milk Dairy Management System',
    images: ['/og-image.png'],
    type: 'website',
  },
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="milk-dairy-theme"
          disableTransitionOnChange={false}
        >
          <ThemeSync />
          {children}
          <Toaster position="top-center" richColors />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
