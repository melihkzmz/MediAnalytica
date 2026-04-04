'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isEmailVerificationDeferred } from '@/lib/emailVerificationPrefs'
import { Mail } from 'lucide-react'

const PROTECTED_PREFIXES = ['/dashboard', '/analyze', '/appointment', '/video', '/profile']

function isProtectedPath(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
}

export function EmailVerificationReminder() {
  const pathname = usePathname() || ''
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.emailVerified || !isProtectedPath(pathname)) {
        setVisible(false)
        return
      }
      setVisible(isEmailVerificationDeferred(user.uid))
    })
    return () => unsub()
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      role="status"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 pb-[env(safe-area-inset-bottom)]">
        <Mail className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <span>
          E-posta adresiniz henüz doğrulanmadı. Tam özellikler ve güvenlik için gelen kutunuzdaki bağlantıyı
          kullanın.
        </span>
        <Link href="/verify-email" className="font-semibold text-amber-900 underline hover:text-amber-800">
          Doğrulama sayfası
        </Link>
      </div>
    </div>
  )
}
