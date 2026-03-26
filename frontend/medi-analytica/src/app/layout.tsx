import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediAnalytica - Yapay Zeka Destekli Tıbbi Görüntü Analizi',
  description: 'Deri, kemik ve akciğer hastalıklarını tespit eden gelişmiş yapay zeka teknolojisi ile sağlığınızı koruyun.',
}

import { AuthProvider } from '@/contexts/AuthContext'
import Providers from '@/components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}

