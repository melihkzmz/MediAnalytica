'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { auth, db, storage } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { showToast } from '@/lib/utils'
import { Brain, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Zap, Users, User, Stethoscope, Phone, Briefcase, Award, FileText, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registrationStep, setRegistrationStep] = useState<'basic' | 'doctor'>('basic')
  
  // Doctor additional fields
  const [tcNo, setTcNo] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [diplomaPhoto, setDiplomaPhoto] = useState<File | null>(null)
  const [diplomaPreview, setDiplomaPreview] = useState<string | null>(null)
  const [certificates, setCertificates] = useState('')
  const [phone, setPhone] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [institution, setInstitution] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && isLogin) {
        // Only redirect if we're in login mode (not during registration)
        router.push('/dashboard')
      }
    })
    return () => unsubscribe()
  }, [router, isLogin])

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
        // Register - Basic step
        if (registrationStep === 'basic') {
          // Validate basic fields
          if (!name.trim()) {
            showToast('Lütfen ad soyad girin.', 'error')
            setLoading(false)
            return
          }

          // If patient, create account immediately
          if (userType === 'patient') {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Save basic user data to Firestore
            try {
              const userDoc = {
                email: email,
                displayName: name || email.split('@')[0],
                userType: 'patient',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                settings: {
                  notifications: true,
                  language: 'tr'
                }
              }
              
              await setDoc(doc(db, 'users', user.uid), userDoc)
              
              showToast('Kayıt başarılı! Giriş yapılıyor...', 'success')
              const token = await user.getIdToken()
              localStorage.setItem('firebase_id_token', token)
              router.push('/dashboard')
              return
            } catch (error: any) {
              console.error('Error saving user data:', error)
              showToast('Kullanıcı oluşturulurken hata oluştu.', 'error')
            }
          } else {
            // If doctor, don't create account yet - just show the additional form
            setRegistrationStep('doctor')
            setLoading(false) // Stop loading to show the form
            showToast('Lütfen doktor bilgilerinizi doldurun.', 'info')
            return // Important: return here to prevent account creation
          }
        }
      }
    } catch (error: any) {
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-credential': 'Bu bilgilere ait bir hesap bulunamadı. Lütfen e-posta ve şifrenizi kontrol edin.',
        'auth/user-not-found': 'Bu e-posta adresine ait bir hesap bulunamadı. Lütfen kayıt olun.',
        'auth/wrong-password': 'Şifre hatalı. Lütfen şifrenizi kontrol edin.',
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
        'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
        'auth/invalid-email': 'Geçersiz e-posta adresi formatı.',
        'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
      }
      showToast(errorMessages[error.code] || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate required fields
    if (!specialty.trim()) {
      showToast('Lütfen uzmanlık alanı girin.', 'error')
      setLoading(false)
      return
    }
    if (!phone.trim()) {
      showToast('Lütfen telefon numarası girin.', 'error')
      setLoading(false)
      return
    }
    if (!experienceYears.trim() || isNaN(Number(experienceYears))) {
      showToast('Lütfen geçerli bir deneyim yılı girin.', 'error')
      setLoading(false)
      return
    }
    if (!institution.trim()) {
      showToast('Lütfen çalışılan kurum bilgisi girin.', 'error')
      setLoading(false)
      return
    }
    if (!bio.trim()) {
      showToast('Lütfen hakkında bilgisi girin.', 'error')
      setLoading(false)
      return
    }
    if (!diplomaPhoto) {
      showToast('Lütfen diploma fotoğrafı yükleyin.', 'error')
      setLoading(false)
      return
    }

    try {
      // Now create the user account with all information
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Upload diploma photo
      let diplomaUrl = ''
      try {
        const diplomaRef = ref(storage, `doctors/${user.uid}/diploma/${diplomaPhoto.name}`)
        await uploadBytes(diplomaRef, diplomaPhoto)
        diplomaUrl = await getDownloadURL(diplomaRef)
      } catch (uploadError: any) {
        console.error('Error uploading diploma:', uploadError)
        showToast('Diploma fotoğrafı yüklenirken hata oluştu.', 'error')
        setLoading(false)
        return
      }

      // Save user data to Firestore
      const userDoc = {
        email: email,
        displayName: name || email.split('@')[0],
        userType: 'doctor',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        settings: {
          notifications: true,
          language: 'tr'
        }
      }
      
      await setDoc(doc(db, 'users', user.uid), userDoc)

      // Save doctor data to Firestore
      const doctorData = {
        userId: user.uid,
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        specialty: specialty.trim(),
        phone: phone.trim(),
        tcNo: tcNo.trim() || null,
        experienceYears: parseInt(experienceYears),
        institution: institution.trim(),
        bio: bio.trim(),
        certificates: certificates.trim() || null,
        diplomaUrl: diplomaUrl,
        status: 'pending', // Requires approval
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'doctors', user.uid), doctorData)

      showToast('Doktor kaydı başarılı! Giriş yapılıyor...', 'success')
      
      // Save token and redirect
      const token = await user.getIdToken()
      localStorage.setItem('firebase_id_token', token)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving doctor data:', error)
      showToast('Doktor bilgileri kaydedilirken hata oluştu.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDiplomaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Lütfen bir görüntü dosyası seçin.', 'error')
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('Dosya boyutu 10MB\'dan küçük olmalıdır.', 'error')
        return
      }
      setDiplomaPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setDiplomaPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeDiplomaPhoto = () => {
    setDiplomaPhoto(null)
    setDiplomaPreview(null)
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
                    {isLogin ? 'Giriş Yap' : registrationStep === 'doctor' ? 'Doktor Bilgileri' : 'Kayıt Ol'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'Hesabınıza giriş yapın' : registrationStep === 'doctor' ? 'Doktor bilgilerinizi tamamlayın' : 'Yeni hesap oluşturun'}
                  </p>
                </div>

                {/* Form */}
                {registrationStep === 'basic' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <>
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

                      {/* User Type Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Kayıt Türü
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setUserType('patient')
                              setRegistrationStep('basic')
                            }}
                            className={`flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl border-2 transition-all ${
                              userType === 'patient'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <User className="w-5 h-5" />
                            <span className="font-semibold">Hasta</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserType('doctor')
                              setRegistrationStep('basic')
                            }}
                            className={`flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl border-2 transition-all ${
                              userType === 'doctor'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <Stethoscope className="w-5 h-5" />
                            <span className="font-semibold">Doktor</span>
                          </button>
                        </div>
                        {userType === 'doctor' && (
                          <p className="mt-2 text-xs text-gray-500">
                            Doktor kaydı onay gerektirir. Kayıt sonrası ek bilgiler istenebilir.
                          </p>
                        )}
                      </div>
                    </>
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
                ) : (
                  <form onSubmit={handleDoctorRegistration} className="space-y-6">
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Doktor Bilgileri</h3>
                        <span className="text-sm text-gray-500">2/2</span>
                      </div>
                      <p className="text-sm text-gray-600">Lütfen doktor bilgilerinizi eksiksiz doldurun.</p>
                    </div>

                    {/* TC Kimlik No */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        T.C. Kimlik No <span className="text-gray-400 text-xs">(Opsiyonel)</span>
                      </label>
                      <input
                        type="text"
                        value={tcNo}
                        onChange={(e) => setTcNo(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="T.C. Kimlik Numaranız"
                        maxLength={11}
                      />
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Uzmanlık Alanı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Örn: Kardiyoloji, Dermatoloji, Ortopedi"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefon Numarası <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="05XX XXX XX XX"
                        />
                      </div>
                    </div>

                    {/* Experience Years */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Deneyim Yılı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        required
                        min="0"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Kaç yıllık deneyiminiz var?"
                      />
                    </div>

                    {/* Institution */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Çalışılan Kurum <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="Hastane, Klinik veya Kurum adı"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hakkında (Kısa Özgeçmiş) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                        placeholder="Kısa özgeçmişinizi yazın..."
                      />
                    </div>

                    {/* Certificates */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sertifikalar <span className="text-gray-400 text-xs">(Opsiyonel)</span>
                      </label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <textarea
                          value={certificates}
                          onChange={(e) => setCertificates(e.target.value)}
                          rows={3}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                          placeholder="Sertifikalarınızı listeleyin..."
                        />
                      </div>
                    </div>

                    {/* Diploma Photo */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diploma Fotoğrafı <span className="text-red-500">*</span>
                      </label>
                      {diplomaPreview ? (
                        <div className="relative">
                          <img src={diplomaPreview} alt="Diploma preview" className="w-full h-48 object-contain border-2 border-gray-200 rounded-xl bg-gray-50" />
                          <button
                            type="button"
                            onClick={removeDiplomaPhoto}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Dosya seçin</span> veya sürükleyip bırakın
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG veya JPEG (MAX. 10MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDiplomaUpload}
                            className="hidden"
                            required
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep('basic')}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Geri
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Kaydediliyor...
                          </span>
                        ) : (
                          'Kayıt Ol'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Toggle Login/Register */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-2">
                    {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                  </p>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setUserType('patient') // Reset to default when switching
                      setRegistrationStep('basic') // Reset registration step
                      // Reset all form fields
                      setEmail('')
                      setPassword('')
                      setName('')
                      setTcNo('')
                      setSpecialty('')
                      setDiplomaPhoto(null)
                      setDiplomaPreview(null)
                      setCertificates('')
                      setPhone('')
                      setExperienceYears('')
                      setInstitution('')
                      setBio('')
                    }}
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

