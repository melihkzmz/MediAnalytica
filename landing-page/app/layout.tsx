import type { Metadata } from 'next'
import './globals.css'
import { EmailVerificationReminder } from '@/components/EmailVerificationReminder'

export const metadata: Metadata = {
  title: 'MediAnalytica - Yapay Zeka Destekli Tıbbi Görüntü Analizi',
  description: 'Deri, kemik ve akciğer hastalıklarını tespit eden gelişmiş yapay zeka teknolojisi ile sağlığınızı koruyun.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EmailVerificationReminder />
        {children}
      </body>
    </html>
  )
}

