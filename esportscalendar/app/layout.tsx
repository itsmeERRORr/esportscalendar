import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

