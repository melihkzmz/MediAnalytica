'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, storage } from '@/lib/firebase'
import { showToast } from '@/lib/utils'
import { User, Mail, Calendar, Camera, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir görüntü dosyası seçin.', 'error')
      return
    }

    setUploading(true)
    try {
      const storageRef = ref(storage, `profile_photos/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setPhotoURL(downloadURL)
      showToast('Fotoğraf yüklendi!', 'success')
    } catch (error) {
      showToast('Fotoğraf yüklenirken bir hata oluştu.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL || undefined
      })
      showToast('Profil güncellendi!', 'success')
    } catch (error) {
      showToast('Profil güncellenirken bir hata oluştu.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <User className="w-8 h-8 text-blue-600 mr-3" />
            Profil Ayarları
          </h1>

          <div className="space-y-8">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profil Fotoğrafı
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Yükleniyor...' : 'Fotoğrafınızı güncelleyin'}
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user?.email}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">E-posta adresi değiştirilemez</p>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Üyelik Tarihi
              </label>
              <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  {user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR')
                    : 'Bilinmiyor'}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

