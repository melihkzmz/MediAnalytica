'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { showToast } from '@/lib/utils'
import { Calendar, Clock, FileText, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { generateJitsiRoomName } from '@/lib/appointmentUtils'

export default function AppointmentPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    doctorType: ''
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate user is logged in
    if (!user) {
      showToast('Lütfen önce giriş yapın.', 'error')
      return
    }
    
    setSubmitting(true)

    try {
      // Generate unique room name for video conference
      // We'll create a temporary ID first, then update with actual ID
      const tempRoomName = `medi-analytica-temp-${Date.now()}`
      
      // Save appointment to Firestore
      const docRef = await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        userEmail: user.email,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        doctorType: formData.doctorType,
        status: 'pending',
        jitsiRoom: tempRoomName, // Will be updated when approved
        createdAt: serverTimestamp()
      })
      
      // Update with actual room name using appointment ID
      const { doc: docFn, updateDoc } = await import('firebase/firestore')
      const actualRoomName = generateJitsiRoomName(docRef.id)
      await updateDoc(docFn(db, 'appointments', docRef.id), {
        jitsiRoom: actualRoomName
      })

      showToast('Randevu talebiniz başarıyla iletildi! Onay sonrası bilgilendirileceksiniz.', 'success')
      
      // Reset form
      setFormData({
        date: '',
        time: '',
        reason: '',
        doctorType: ''
      })
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      
      // Show more specific error message
      if (error.code === 'permission-denied') {
        showToast('Randevu oluşturma izniniz yok. Lütfen Firebase güvenlik kurallarını kontrol edin.', 'error')
      } else {
        showToast(`Randevu oluşturulurken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Generate time slots with 30-minute intervals from 09:00 to 22:00
  const timeSlots = []
  for (let hour = 9; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 22) { // Don't add :30 for 22:00 (last slot)
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  const doctorTypes = [
    { value: 'dermatolog', label: 'Dermatolog' },
    { value: 'ortopedist', label: 'Ortopedist' },
    { value: 'gogus-hast', label: 'Göğüs Hastalıkları Uzmanı' },
    { value: 'goz-hast', label: 'Göz Hastalıkları Uzmanı' },
    { value: 'genel-cerrahi', label: 'Genel Cerrahi' },
    { value: 'ic-hastaliklari', label: 'İç Hastalıkları' },
    { value: 'noroloji', label: 'Nöroloji' },
    { value: 'kardiyoloji', label: 'Kardiyoloji' },
  ]

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Randevu Talep Et</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Randevu Tarihi
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={today}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Randevu Saati
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Saat seçiniz</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Doktor Türü
              </label>
              <select
                value={formData.doctorType}
                onChange={(e) => setFormData({ ...formData, doctorType: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Uzmanlık seçiniz</option>
                {doctorTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Randevu Nedeni
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                placeholder="Şikayet veya açıklama..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.reason.length}/500 karakter
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                'Gönderiliyor...'
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Randevu Oluştur
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

