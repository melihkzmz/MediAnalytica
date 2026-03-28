'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { showToast } from '@/lib/utils'
import { Calendar, Clock, FileText, User, ArrowLeft, CheckCircle2, Building, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { generateJitsiRoomName } from '@/lib/appointmentUtils'

const doctorTypes = [
  { value: 'dermatolog', label: 'Dermatolog' },
  { value: 'ortopedist', label: 'Ortopedist' },
  { value: 'gogus-hast', label: 'Göğüs Hastalıkları Uzmanı' },
  { value: 'goz-hast', label: 'Göz Hastalıkları Uzmanı' },
  { value: 'noroloji', label: 'Nöroloji' },
]

function AppointmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    doctorType: '',
  })
  const [preferredDoctorId, setPreferredDoctorId] = useState<string | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [analysisImageUrl, setAnalysisImageUrl] = useState<string | null>(null)
  const [preferredDoctor, setPreferredDoctor] = useState<{
    firstName?: string
    lastName?: string
    institution?: string
    specialty?: string
  } | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push('/login')
        return
      }
      if (!u.emailVerified) {
        setLoading(false)
        router.replace('/verify-email')
        return
      }
      setUser(u)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const applySearchParams = useCallback(async () => {
    const dt = searchParams.get('doctorType')
    const pid = searchParams.get('preferredDoctorId')
    const aid = searchParams.get('analysisId')
    setPreferredDoctorId(pid)
    setAnalysisId(aid)

    setFormData((prev) => ({
      ...prev,
      doctorType: dt || prev.doctorType,
      reason:
        prev.reason ||
        (dt ? 'Yapay zeka analizi sonrası uzman görüşü talebi.' : ''),
    }))

    if (pid) {
      try {
        const snap = await getDoc(doc(db, 'doctors', pid))
        if (snap.exists()) {
          const d = snap.data() as Record<string, unknown>
          setPreferredDoctor({
            firstName: d.firstName as string | undefined,
            lastName: d.lastName as string | undefined,
            institution: d.institution as string | undefined,
            specialty: d.specialty as string | undefined,
          })
        } else {
          setPreferredDoctor(null)
        }
      } catch {
        setPreferredDoctor(null)
      }
    } else {
      setPreferredDoctor(null)
    }

    if (aid && user?.uid) {
      try {
        const snap = await getDoc(doc(db, 'analyses', aid))
        if (snap.exists()) {
          const d = snap.data() as Record<string, unknown>
          if (d.userId === user.uid && typeof d.imageUrl === 'string') {
            setAnalysisImageUrl(d.imageUrl)
          } else {
            setAnalysisImageUrl(null)
          }
        } else {
          setAnalysisImageUrl(null)
        }
      } catch {
        setAnalysisImageUrl(null)
      }
    } else {
      setAnalysisImageUrl(null)
    }
  }, [searchParams, user?.uid])

  useEffect(() => {
    if (!user) return
    applySearchParams()
  }, [user, applySearchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      showToast('Lütfen önce giriş yapın.', 'error')
      return
    }

    setSubmitting(true)

    try {
      const tempRoomName = `medi-analytica-temp-${Date.now()}`

      const payload: Record<string, unknown> = {
        userId: user.uid,
        userEmail: user.email,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        doctorType: formData.doctorType,
        status: 'pending',
        jitsiRoom: tempRoomName,
        createdAt: serverTimestamp(),
      }

      if (preferredDoctorId) {
        payload.preferredDoctorId = preferredDoctorId
      }
      if (analysisId && analysisImageUrl) {
        payload.analysisId = analysisId
        payload.analysisImageUrl = analysisImageUrl
      } else if (analysisId) {
        payload.analysisId = analysisId
      }

      const docRef = await addDoc(collection(db, 'appointments'), payload)

      const { doc: docFn, updateDoc } = await import('firebase/firestore')
      const actualRoomName = generateJitsiRoomName(docRef.id)
      await updateDoc(docFn(db, 'appointments', docRef.id), {
        jitsiRoom: actualRoomName,
      })

      showToast('Randevu talebiniz başarıyla iletildi! Onay sonrası bilgilendirileceksiniz.', 'success')

      setFormData({
        date: '',
        time: '',
        reason: '',
        doctorType: '',
      })
      router.push('/dashboard#patient-appointment-history')
    } catch (error: any) {
      console.error('Error creating appointment:', error)
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

  const timeSlots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:15`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:45`)
  }

  const today = new Date().toISOString().split('T')[0]

  const specLabel =
    preferredDoctor?.specialty &&
    doctorTypes.find((t) => t.value === preferredDoctor.specialty)?.label

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

          {(preferredDoctor || analysisImageUrl) && (
            <div className="mb-8 space-y-4 rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-teal-50/80 to-blue-50/50 p-5">
              {preferredDoctor && (
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Seçilen uzman</p>
                    <p className="font-bold text-gray-900">
                      Dr. {preferredDoctor.firstName || ''} {preferredDoctor.lastName || ''}
                    </p>
                    {specLabel && <p className="text-sm text-teal-700">{specLabel}</p>}
                    {preferredDoctor.institution && (
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                        <Building className="w-4 h-4 shrink-0" />
                        {preferredDoctor.institution}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {analysisImageUrl && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Analize ait görüntü (randevuya eklenecek)</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 max-w-xs">
                    <img src={analysisImageUrl} alt="Analiz görüntüsü" className="w-full h-auto max-h-48 object-contain bg-gray-50" />
                  </div>
                </div>
              )}
            </div>
          )}

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
              <p className="text-sm text-gray-500 mt-2">{formData.reason.length}/500 karakter</p>
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

function AppointmentLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default function AppointmentPage() {
  return (
    <Suspense fallback={<AppointmentLoading />}>
      <AppointmentForm />
    </Suspense>
  )
}
