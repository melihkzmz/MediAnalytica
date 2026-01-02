'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Loader2, ArrowLeft, Video } from 'lucide-react'
import Link from 'next/link'

function VideoConferenceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomName = searchParams.get('room') || ''
  const appointmentId = searchParams.get('appointmentId') || ''
  const isDoctor = searchParams.get('isDoctor') === 'true'
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      setUser(currentUser)
      setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı')
      setUserEmail(currentUser.email || '')

      // Fetch appointment data if appointmentId is provided
      if (appointmentId) {
        try {
          const appointmentRef = doc(db, 'appointments', appointmentId)
          const appointmentDoc = await getDoc(appointmentRef)
          if (appointmentDoc.exists()) {
            setAppointment(appointmentDoc.data())
          }
        } catch (error) {
          console.error('Error fetching appointment:', error)
        }
      }

      // Create 8x8 meeting via API with JWT (better control) or fallback to direct URL
      if (roomName) {
        const cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        
        try {
          // Try to create meeting via 8x8 API with JWT
          const response = await fetch('/api/8x8/create-meeting', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              roomName: cleanRoomName,
              userName: userName,
              userEmail: userEmail,
              isDoctor: isDoctor
            })
          })

          if (response.ok) {
            const data = await response.json()
            // Use JWT token in URL for authenticated access
            if (data.token && data.joinUrl) {
              setRoomUrl(data.joinUrl)
            } else if (data.joinUrl) {
              setRoomUrl(data.joinUrl)
            } else {
              // Fallback if response format is different
              const params = new URLSearchParams({
                'jwt': data.token || '',
                'userInfo.displayName': userName,
                'userInfo.email': userEmail,
              })
              setRoomUrl(`https://${data.domain || '8x8.vc'}/${cleanRoomName}?${params.toString()}`)
            }
          } else {
            // Fallback to direct 8x8.vc URL if API fails
            console.log('8x8 API not available, using direct URL')
            const params = new URLSearchParams({
              'userInfo.displayName': userName,
              'userInfo.email': userEmail,
              'config.startWithAudioMuted': 'false',
              'config.startWithVideoMuted': 'false',
            })
            setRoomUrl(`https://8x8.vc/${cleanRoomName}?${params.toString()}`)
          }
        } catch (error) {
          // Fallback to direct URL if API call fails
          console.error('Error creating 8x8 meeting via API:', error)
          const params = new URLSearchParams({
            'userInfo.displayName': userName,
            'userInfo.email': userEmail,
            'config.startWithAudioMuted': 'false',
            'config.startWithVideoMuted': 'false',
          })
          setRoomUrl(`https://8x8.vc/${cleanRoomName}?${params.toString()}`)
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, appointmentId, roomName])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!roomName || !roomUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Geçersiz Oda</h2>
          <p className="text-gray-600 mb-6">Randevu odası bulunamadı.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard'a Dön</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-white font-semibold">MediAnalytica - Görüntülü Görüşme</h1>
              {appointment && (
                <p className="text-gray-400 text-sm">
                  {appointment.date} - {appointment.time}
                </p>
              )}
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Oda: {roomName}
          </div>
        </div>
      </div>

      {/* 8x8.vc Video Conference - Free Jitsi service */}
      <div className="h-[calc(100vh-80px)] w-full relative">
        {/* Info banner for login and moderator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-md">
          <p className="font-semibold">💡 İpucu:</p>
          <p>Login yaparken input alanlarına manuel olarak tıklayın (tarayıcı güvenlik nedeniyle otomatik odaklanmayı engeller). Login sonrası <strong>"Start meeting"</strong> butonuna tıklayın.</p>
        </div>
        <iframe
          ref={iframeRef}
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay; clipboard-read; clipboard-write; forms"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="8x8.vc Video Conference"
        />
      </div>
    </div>
  )
}

export default function VideoConferencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <VideoConferenceContent />
    </Suspense>
  )
}
