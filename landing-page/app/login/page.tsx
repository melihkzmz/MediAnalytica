'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { showToast } from '@/lib/utils'
import { Brain, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Zap, Users } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Email verification check removed - direct redirect
        router.push('/dashboard')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Email verification removed - direct login allowed

        // Save token to localStorage
        const token = await user.getIdToken()
        localStorage.setItem('firebase_id_token', token)
        
        showToast('Giriş başarılı!', 'success')
        router.push('/dashboard')
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Email verification removed
        
        showToast('Kayıt başarılı! Giriş yapılıyor...', 'success')
        
        // Auto login after registration
        const token = await user.getIdToken()
        localStorage.setItem('firebase_id_token', token)
        router.push('/dashboard')
        return
        setIsLogin(true)
      }
    } catch (error: any) {
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-credential': 'E-posta veya şifre hatalı.',
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
        'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
        'auth/user-not-found': 'Kullanıcı bulunamadı.',
        'auth/wrong-password': 'Şifre hatalı.',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
      }
      showToast(errorMessages[error.code] || 'Bir hata oluştu.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      showToast('Lütfen e-posta adresinizi girin.', 'warning')
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      showToast('Şifre sıfırlama e-postası gönderildi.', 'success')
    } catch (error: any) {
      showToast('E-posta gönderilemedi. Lütfen e-posta adresinizi kontrol edin.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="pt-24 pb-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Info */}
            <div className="hidden lg:block space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Güvenli Giriş
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {isLogin ? (
                  <>
                    Hesabınıza{' '}
                    <span className="text-primary">Giriş Yapın</span>
                  </>
                ) : (
                  <>
                    Hemen{' '}
                    <span className="text-primary">Kayıt Olun</span>
                  </>
                )}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {isLogin 
                  ? 'Tıbbi görüntülerinizi analiz edin, uzman doktorlarla görüşün ve sağlığınızı koruyun.'
                  : 'Ücretsiz hesap oluşturun ve yapay zeka destekli tıbbi analiz özelliklerinden faydalanın.'
                }
              </p>

              {/* Features */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">%100 Güvenli</h3>
                    <p className="text-gray-600 text-sm">Tüm verileriniz şifrelenmiş ve güvende</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Anında Analiz</h3>
                    <p className="text-gray-600 text-sm">Saniyeler içinde sonuç alın</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Uzman Doktorlar</h3>
                    <p className="text-gray-600 text-sm">Video konsültasyon ile destek alın</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                {/* Logo - Mobile */}
                <div className="flex items-center justify-center mb-8 lg:hidden">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <span className="ml-3 text-2xl font-bold text-gray-900">MediAnalytica</span>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Şifre
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
                      >
                        Şifremi Unuttum
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Yükleniyor...
                      </span>
                    ) : (
                      isLogin ? 'Giriş Yap' : 'Kayıt Ol'
                    )}
                  </button>
                </form>

                {/* Toggle Login/Register */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-2">
                    {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                  </p>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary-dark font-semibold transition-colors"
                  >
                    {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                  </button>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                  <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ana Sayfaya Dön
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

