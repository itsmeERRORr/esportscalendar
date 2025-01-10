import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Esports Calendar 2025',
  description: 'Manage your esports events with ease',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
  appleWebApp: {
    title: 'Esports Calendar',
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥷</text></svg>" />
      </head>
      <body className="bg-gray-900 text-gray-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

