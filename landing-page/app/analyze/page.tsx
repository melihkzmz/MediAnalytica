'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { config } from '@/lib/config'
import { showToast, validateImageFile, compressImage } from '@/lib/utils'
import { 
  Brain, Upload, History, Heart, BarChart3, Video, 
  Settings, LogOut, User, Home, HelpCircle, Mail, Building,
  X, CheckCircle2, Loader2, Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'

type DiseaseType = 'skin' | 'bone' | 'lung' | 'eye'
type Section = 'dashboard' | 'analyze' | 'history' | 'favorites' | 'stats' | 'appointment'

export default function AnalyzePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState<Section>('analyze')
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      // Email verification check removed
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (user && currentSection === 'history') {
      loadAnalyses()
    }
  }, [user, currentSection])

  useEffect(() => {
    if (user && currentSection === 'favorites') {
      loadFavorites()
    }
  }, [user, currentSection])

  useEffect(() => {
    if (user && currentSection === 'stats') {
      loadStats()
    }
  }, [user, currentSection])

  const loadAnalyses = async () => {
    if (!user) return
    setLoadingHistory(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${config.apiUrl}/api/user/analyses?page=1&per_page=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses || [])
      }
    } catch (error) {
      console.error('Error loading analyses:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    setLoadingFavorites(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${config.apiUrl}/api/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadStats = async () => {
    if (!user) return
    setLoadingStats(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${config.apiUrl}/api/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const addToFavorites = async (analysisId: string) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${config.apiUrl}/api/user/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisId })
      })
      if (response.ok) {
        showToast('Favorilere eklendi!', 'success')
        loadFavorites()
      }
    } catch (error) {
      showToast('Favorilere eklenirken hata oluştu.', 'error')
    }
  }

  const removeFromFavorites = async (favoriteId: string) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${config.apiUrl}/api/user/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        showToast('Favorilerden kaldırıldı!', 'success')
        loadFavorites()
      }
    } catch (error) {
      showToast('Favorilerden kaldırılırken hata oluştu.', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('firebase_id_token')
      router.push('/login')
      showToast('Çıkış yapıldı.', 'success')
    } catch (error) {
      showToast('Çıkış yapılırken bir hata oluştu.', 'error')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedDisease || !selectedImage) {
      showToast('Lütfen hastalık türü seçin ve görüntü yükleyin.', 'warning')
      return
    }

    setAnalyzing(true)
    try {
      // Compress image
      const compressedImage = await compressImage(selectedImage)
      const formData = new FormData()
      formData.append('image', compressedImage, selectedImage.name)
      formData.append('with_gradcam', 'true')

      // Determine API endpoint based on disease type
      // Use Hugging Face Space if configured, otherwise fallback to localhost
      let apiUrl: string
      let headers: HeadersInit = {}
      
      if (config.useHuggingFaceSpace && config.hfSpaceUrl) {
        if (config.useProxyForHF) {
          // Use Next.js API proxy (for private Spaces - token kept secure)
          apiUrl = `/api/predict/${selectedDisease}`
        } else {
          // Direct Hugging Face Space API: /predict/<disease_type>
          // For private Spaces, you'll need to add token here (not recommended for production)
          apiUrl = `${config.hfSpaceUrl}/predict/${selectedDisease}`
          // Uncomment below if your Space requires authentication and you want to use direct access
          // const hfToken = process.env.NEXT_PUBLIC_HF_TOKEN // ⚠️ Security risk: token exposed to client
          // if (hfToken) {
          //   headers['Authorization'] = `Bearer ${hfToken}`
          // }
        }
      } else {
        // Localhost fallback (for development)
        const apiPorts: { [key: string]: string } = {
          'bone': '5002',
          'skin': '5003',
          'lung': '5004',
          'eye': '5005'
        }
        apiUrl = `http://localhost:${apiPorts[selectedDisease]}/predict`
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Analiz başarısız')
      }

      const result = await response.json()
      
      // Format results - handle different API response formats
      let formattedResult
      
      if (result.prediction) {
        // New format with prediction object
        formattedResult = {
          prediction: result.prediction.class || result.prediction.className || 'Bilinmiyor',
          confidence: result.prediction.confidence || 0,
          top_3: result.top_3 || [],
          gradcam: result.gradcam || null,
          fullData: result
        }
      } else if (result.top_3 && result.top_3.length > 0) {
        // Format with top_3 array
        formattedResult = {
          prediction: result.top_3[0].class || result.top_3[0].class_tr || result.top_3[0].className || 'Bilinmiyor',
          confidence: result.top_3[0].confidence || result.top_3[0].probability || 0,
          top_3: result.top_3.map((item: any) => ({
            class: item.class || item.class_tr || item.className,
            confidence: item.confidence || item.probability,
            description: item.description || ''
          })),
          gradcam: result.gradcam || null,
          fullData: result
        }
      } else {
        // Fallback format
        formattedResult = {
          prediction: 'Bilinmiyor',
          confidence: 0,
          top_3: [],
          gradcam: result.gradcam || null,
          fullData: result
        }
      }
      
      setAnalysisResult(formattedResult)
      showToast('Analiz tamamlandı!', 'success')
      
      // Save to Firebase
      const analysisId = await saveAnalysisToFirebase(selectedDisease, formattedResult, selectedImage)
      if (analysisId) {
        setCurrentAnalysisId(analysisId)
        // Refresh history if on history page
        if (currentSection === 'history') {
          loadAnalyses()
        }
        // Refresh stats if on stats page
        if (currentSection === 'stats') {
          loadStats()
        }
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      showToast('Analiz sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveAnalysisToFirebase = async (diseaseType: DiseaseType, results: any, imageFile: File) => {
    try {
      if (!user) return

      // Upload image to Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { storage } = await import('@/lib/firebase')
      
      const storageRef = ref(storage, `analysis_images/${user.uid}/${Date.now()}_${imageFile.name}`)
      await uploadBytes(storageRef, imageFile)
      const imageUrl = await getDownloadURL(storageRef)

      // Get token
      const token = await user.getIdToken()

      // Save to backend API
      const response = await fetch(`${config.apiUrl}/api/user/analyses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          diseaseType: diseaseType,
          results: results.top_3.map((item: any) => ({
            class: item.class || item.className,
            confidence: item.confidence || item.probability
          })),
          topPrediction: results.prediction,
          imageUrl: imageUrl
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Analysis saved:', data)
        return data.analysisId
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to save analysis:', errorData)
        return null
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const diseaseOptions = [
    { value: 'skin', label: 'Deri Hastalıkları', icon: '✨' },
    { value: 'bone', label: 'Kemik Hastalıkları', icon: '🦴' },
    { value: 'lung', label: 'Akciğer Hastalıkları', icon: '🫁' },
    { value: 'eye', label: 'Göz Hastalıkları', icon: '👁️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MediAnalytica</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{user?.email?.split('@')[0] || 'Kullanıcı'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Profil Ayarları</span>
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16">
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Ana Menü', icon: Home },
              { id: 'analyze', label: 'Analiz Yap', icon: Brain },
              { id: 'history', label: 'Analiz Geçmişi', icon: History },
              { id: 'favorites', label: 'Favoriler', icon: Heart },
              { id: 'stats', label: 'İstatistikler', icon: BarChart3 },
              { id: 'appointment', label: 'Randevu Talep', icon: Video },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id as Section)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    currentSection === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            <div className="border-t border-gray-200 my-4"></div>
            {[
              { href: '/help', label: 'Yardım', icon: HelpCircle },
              { href: '/contact', label: 'İletişim', icon: Mail },
              { href: '/about', label: 'Hakkımızda', icon: Building },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {currentSection === 'dashboard' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">MediAnalytica'ya Hoş Geldiniz</h1>
                <p className="text-xl mb-8">Sağlığınız için yapay zeka destekli çözümler sunuyoruz</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setCurrentSection('analyze')}
                    className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Analiz Yap
                  </button>
                  <button
                    onClick={() => setCurrentSection('history')}
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Geçmişim
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'analyze' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Analiz Yap</h2>
              
              {/* Disease Type Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Hastalık Türü Seçin
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {diseaseOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedDisease(option.value as DiseaseType)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedDisease === option.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Görüntü Yükleyin
                </label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Görüntüyü sürükleyin veya tıklayın</p>
                      <p className="text-sm text-gray-500">JPEG, PNG (Max 10MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full rounded-xl" />
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedImage(null)
                      }}
                      className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedDisease || !selectedImage || analyzing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Analiz Et
                  </>
                )}
              </button>

              {/* Results */}
              {analysisResult && (
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Analiz Sonuçları</h3>
                  
                  {/* Top Prediction */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <span className="text-xl font-bold text-gray-900">Tahmin: {analysisResult.prediction}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">Güven Oranı</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                              style={{ width: `${(analysisResult.confidence * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            %{(analysisResult.confidence * 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Results */}
                  {analysisResult.top_3 && analysisResult.top_3.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">En Olası 3 Sonuç</h4>
                      <div className="space-y-3">
                        {analysisResult.top_3.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-green-100 text-green-700' :
                                index === 1 ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{item.class || item.className}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                %{((item.confidence || item.probability) * 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grad-CAM Visualization */}
                  {analysisResult.gradcam && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Model Odak Bölgeleri (Grad-CAM)</h4>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <img 
                          src={analysisResult.gradcam} 
                          alt="Grad-CAM" 
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {currentAnalysisId && (
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          addToFavorites(currentAnalysisId)
                          loadFavorites()
                        }}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Favorilere Ekle
                      </button>
                      <button
                        onClick={() => setCurrentSection('history')}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                      >
                        <History className="w-5 h-5 mr-2" />
                        Geçmişe Git
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentSection === 'history' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Analiz Geçmişi</h2>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Henüz analiz geçmişiniz yok</p>
                  <button
                    onClick={() => setCurrentSection('analyze')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    İlk analizinizi yapın →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis: any) => (
                    <div key={analysis.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {analysis.diseaseType === 'skin' ? '✨ Deri' :
                               analysis.diseaseType === 'bone' ? '🦴 Kemik' :
                               analysis.diseaseType === 'lung' ? '🫁 Akciğer' :
                               analysis.diseaseType === 'eye' ? '👁️ Göz' : analysis.diseaseType}
                            </span>
                            <span className="text-sm text-gray-500">
                              {analysis.createdAt ? new Date(analysis.createdAt * 1000).toLocaleDateString('tr-TR') : 'Tarih yok'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Tahmin: {analysis.topPrediction || 'Bilinmiyor'}
                          </h3>
                          {analysis.imageUrl && (
                            <img src={analysis.imageUrl} alt="Analysis" className="w-32 h-32 object-cover rounded-lg" />
                          )}
                        </div>
                        <button
                          onClick={() => addToFavorites(analysis.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'favorites' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Favoriler</h2>
              {loadingFavorites ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Henüz favori analiziniz yok</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((favorite: any) => (
                    <div key={favorite.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {favorite.analysis?.diseaseType === 'skin' ? '✨ Deri' :
                               favorite.analysis?.diseaseType === 'bone' ? '🦴 Kemik' :
                               favorite.analysis?.diseaseType === 'lung' ? '🫁 Akciğer' :
                               favorite.analysis?.diseaseType === 'eye' ? '👁️ Göz' : favorite.analysis?.diseaseType}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {favorite.analysis?.topPrediction || 'Bilinmiyor'}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeFromFavorites(favorite.id)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentSection === 'stats' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">İstatistikler</h2>
              {loadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Toplam Analiz</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalAnalyses || 0}</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Deri Analizleri</div>
                    <div className="text-3xl font-bold text-purple-600">{stats.diseaseCounts?.skin || 0}</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Kemik Analizleri</div>
                    <div className="text-3xl font-bold text-green-600">{stats.diseaseCounts?.bone || 0}</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Akciğer Analizleri</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.diseaseCounts?.lung || 0}</div>
                  </div>
                  {stats.mostAnalyzed && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white col-span-full">
                      <div className="text-sm opacity-90 mb-2">En Çok Analiz Edilen</div>
                      <div className="text-2xl font-bold">
                        {stats.mostAnalyzed === 'skin' ? '✨ Deri Hastalıkları' :
                         stats.mostAnalyzed === 'bone' ? '🦴 Kemik Hastalıkları' :
                         stats.mostAnalyzed === 'lung' ? '🫁 Akciğer Hastalıkları' :
                         stats.mostAnalyzed === 'eye' ? '👁️ Göz Hastalıkları' : stats.mostAnalyzed}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-gray-600">İstatistikler yüklenemedi</p>
                </div>
              )}
            </div>
          )}

          {currentSection === 'appointment' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Randevu Talep</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-600 mb-4">Randevu almak için aşağıdaki butona tıklayın:</p>
                <Link
                  href="/appointment"
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Video className="w-5 h-5 inline mr-2" />
                  Randevu Talep Et
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

