'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, reload } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { sendVerificationEmail } from '@/lib/emailVerification'
import { showToast } from '@/lib/utils'
import Link from 'next/link'
import { Mail, RefreshCw, LogOut, CheckCircle2, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      if (user.emailVerified) {
        router.replace('/dashboard')
        return
      }
      setEmail(user.email)
      setLoading(false)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleResend = async () => {
    const user = auth.currentUser
    if (!user || cooldown > 0) return
    setResendLoading(true)
    try {
      await sendVerificationEmail(user)
      showToast('Doğrulama e-postası tekrar gönderildi. Gelen kutunuzu kontrol edin.', 'success')
      setCooldown(60)
    } catch (e: any) {
      console.error(e)
      if (e?.code === 'auth/too-many-requests') {
        showToast('Çok fazla istek. Bir süre sonra tekrar deneyin.', 'error')
      } else {
        showToast('E-posta gönderilemedi. Lütfen tekrar deneyin.', 'error')
      }
    } finally {
      setResendLoading(false)
    }
  }

  const handleRecheck = async () => {
    const user = auth.currentUser
    if (!user) return
    setRefreshLoading(true)
    try {
      await reload(user)
      if (auth.currentUser?.emailVerified) {
        showToast('E-posta doğrulandı!', 'success')
        router.replace('/dashboard')
      } else {
        showToast('Henüz doğrulanmadı. E-postadaki bağlantıya tıkladığınızdan emin olun.', 'warning')
      }
    } catch (e) {
      console.error(e)
      showToast('Durum güncellenemedi.', 'error')
    } finally {
      setRefreshLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('firebase_id_token')
      router.replace('/login')
    } catch (e) {
      console.error(e)
      showToast('Çıkış yapılamadı.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">E-postanızı doğrulayın</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Hesabınızı kullanmadan önce e-posta adresinizi doğrulamanız gerekir.{' '}
            <span className="font-medium text-gray-800">{email}</span> adresine bir bağlantı gönderdik.
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-900">
          Gelen kutusu veya spam klasörünü kontrol edin. Bağlantıya tıkladıktan sonra aşağıdaki &quot;Doğruladım,
          yenile&quot; düğmesine basın.
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRecheck}
            disabled={refreshLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Doğruladım, yenile
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-800 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {resendLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : 'E-postayı tekrar gönder'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Çıkış yap
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  )
}
